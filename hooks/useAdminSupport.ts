import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SupportConversation, SupportMessage, ConversationStatus } from '../types';
import { SUPPORT_CONFIG } from '../config/support';

interface UseAdminSupportReturn {
    conversations: SupportConversation[];
    selectedConversation: SupportConversation | null;
    messages: SupportMessage[];
    isLoading: boolean;
    error: string | null;
    loadConversations: (sortBy?: 'new' | 'unread' | 'old') => Promise<void>;
    selectConversation: (conversationId: string) => Promise<void>;
    sendAdminReply: (conversationId: string, message: string) => Promise<void>;
    updateStatus: (conversationId: string, status: ConversationStatus) => Promise<void>;
    markMessagesAsRead: (conversationId: string) => Promise<void>;
}

export const useAdminSupport = (): UseAdminSupportReturn => {
    const [conversations, setConversations] = useState<SupportConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to new conversations and messages
    useEffect(() => {
        const conversationsChannel = supabase
            .channel('admin-conversations')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_conversations',
                },
                (payload) => {
                    const newConversation = payload.new as SupportConversation;
                    setConversations((prev) => [newConversation, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'support_conversations',
                },
                (payload) => {
                    const updatedConversation = payload.new as SupportConversation;
                    setConversations((prev) =>
                        prev.map((c) => (c.id === updatedConversation.id ? updatedConversation : c))
                    );
                    if (selectedConversation?.id === updatedConversation.id) {
                        setSelectedConversation(updatedConversation);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(conversationsChannel);
        };
    }, [selectedConversation?.id]);

    // Subscribe to messages in selected conversation
    useEffect(() => {
        if (!selectedConversation) return;

        const messagesChannel = supabase
            .channel(`admin-messages:${selectedConversation.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `conversation_id=eq.${selectedConversation.id}`,
                },
                (payload) => {
                    const newMessage = payload.new as SupportMessage;
                    setMessages((prev) => {
                        // Check if message already exists (by ID)
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        // Also check if we have a temp message that matches this one (same content & created recently)
                        // This prevents the "flash" of duplicate before replacement
                        const isDuplicate = prev.some(m =>
                            m.id.startsWith('temp-') &&
                            m.message === newMessage.message &&
                            m.sender_id === newMessage.sender_id
                        );
                        if (isDuplicate) return prev;

                        return [...prev, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messagesChannel);
        };
    }, [selectedConversation?.id]);

    const loadConversations = useCallback(async (sortBy: 'new' | 'unread' | 'old' = 'new') => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('support_conversations')
                .select('*');

            // Apply sorting
            switch (sortBy) {
                case 'new':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'old':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'unread':
                    query = query.order('last_message_at', { ascending: false, nullsFirst: false });
                    break;
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setConversations(data || []);
        } catch (err) {
            console.error('Error loading conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectConversation = useCallback(async (conversationId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch conversation details
            const { data: conversationData, error: convError } = await supabase
                .from('support_conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            if (convError) throw convError;

            setSelectedConversation(conversationData);

            // Fetch messages
            const { data: messagesData, error: messagesError } = await supabase
                .from('support_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (messagesError) throw messagesError;

            setMessages(messagesData || []);

            // Auto-mark unread messages as read
            await markMessagesAsRead(conversationId);
        } catch (err) {
            console.error('Error selecting conversation:', err);
            setError('Failed to load conversation');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendAdminReply = useCallback(
        async (conversationId: string, message: string) => {
            try {
                setError(null);

                // Get current admin user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error('Not authenticated');
                }

                // Optimistic UI update
                const tempMessage: SupportMessage = {
                    id: `temp-${Date.now()}`,
                    conversation_id: conversationId,
                    sender_type: 'admin',
                    sender_id: user.id,
                    message,
                    read_at: null,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, tempMessage]);

                // Insert message
                const { data, error: insertError } = await supabase
                    .from('support_messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_type: 'admin',
                        sender_id: user.id,
                        message,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempMessage.id ? data : m))
                );
            } catch (err) {
                console.error('Error sending admin reply:', err);
                setError('Failed to send message');
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
            }
        },
        []
    );

    const updateStatus = useCallback(async (conversationId: string, status: ConversationStatus) => {
        try {
            setError(null);

            const { error: updateError } = await supabase
                .from('support_conversations')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            if (updateError) throw updateError;

            // If marking as resolved, send system message
            if (status === 'resolved') {
                await supabase
                    .from('support_messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_type: 'system',
                        sender_id: null,
                        message: SUPPORT_CONFIG.resolvedMessage,
                    });
            }

            // Update local state
            setConversations((prev) =>
                prev.map((c) => (c.id === conversationId ? { ...c, status } : c))
            );
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation((prev) => (prev ? { ...prev, status } : null));
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update status');
        }
    }, [selectedConversation?.id]);

    const markMessagesAsRead = useCallback(async (conversationId: string) => {
        try {
            // Mark all user messages as read
            const { error: updateError } = await supabase
                .from('support_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('sender_type', 'user')
                .is('read_at', null);

            if (updateError) throw updateError;

            // Update local state
            setMessages((prev) =>
                prev.map((m) =>
                    m.sender_type === 'user' && !m.read_at
                        ? { ...m, read_at: new Date().toISOString() }
                        : m
                )
            );
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, []);

    return {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        error,
        loadConversations,
        selectConversation,
        sendAdminReply,
        updateStatus,
        markMessagesAsRead,
    };
};
