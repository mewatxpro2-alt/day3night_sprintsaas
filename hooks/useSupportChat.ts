import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { SupportConversation, SupportMessage, SupportChatState } from '../types';

interface UseSupportChatReturn extends SupportChatState {
    startConversation: (email: string, name?: string) => Promise<SupportConversation | null>;
    sendMessage: (message: string, conversationId?: string) => Promise<void>;
    markAsRead: (messageId: string) => Promise<void>;
    closeConversation: () => void;
}

export const useSupportChat = (): UseSupportChatReturn => {
    const { user } = useAuth();
    const [conversation, setConversation] = useState<SupportConversation | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load existing conversation on mount
    useEffect(() => {
        loadConversation();
    }, [user]);

    // Subscribe to new messages in realtime
    useEffect(() => {
        if (!conversation) return;

        const channel = supabase
            .channel(`conversation:${conversation.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    const newMessage = payload.new as SupportMessage;
                    // Prevent duplicate: only add if not already in messages
                    setMessages((prev) => {
                        const exists = prev.some(m => m.id === newMessage.id);
                        if (exists) return prev;
                        return [...prev, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation?.id]);

    const loadConversation = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let conversationData: SupportConversation | null = null;

            if (user) {
                // Load by user_id for authenticated users
                // Only load if conversation is still OPEN
                const { data, error: fetchError } = await supabase
                    .from('support_conversations')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'open')  // Only load open conversations
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (fetchError) throw fetchError;
                conversationData = data;
            } else {
                // For guest users, check localStorage for conversation ID
                const storedConvId = localStorage.getItem('support_conversation_id');
                if (storedConvId) {
                    const { data, error: fetchError } = await supabase
                        .from('support_conversations')
                        .select('*')
                        .eq('id', storedConvId)
                        .eq('status', 'open')  // Only load if still open
                        .maybeSingle();

                    if (fetchError) throw fetchError;
                    conversationData = data;

                    // If conversation is resolved, clear localStorage
                    if (!data) {
                        localStorage.removeItem('support_conversation_id');
                    }
                }
            }

            if (conversationData) {
                setConversation(conversationData);
                await loadMessages(conversationData.id);
            }
        } catch (err) {
            console.error('Error loading conversation:', err);
            setError('Failed to load conversation');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const { data, error: fetchError } = await supabase
                .from('support_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            setMessages(data || []);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const startConversation = useCallback(
        async (email: string, name?: string) => {
            try {
                setIsLoading(true);
                setError(null);

                // Check if conversation already exists
                if (conversation) {
                    return conversation;
                }

                // Create new conversation
                const { data, error: insertError } = await supabase
                    .from('support_conversations')
                    .insert({
                        user_id: user?.id || null,
                        email,
                        name: name || null,
                        status: 'open',
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                setConversation(data);

                // Store conversation ID for guest users
                if (!user) {
                    localStorage.setItem('support_conversation_id', data.id);
                }

                return data;
            } catch (err) {
                console.error('Error starting conversation:', err);
                setError('Failed to start conversation');
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [user, conversation]
    );

    const sendMessage = useCallback(
        async (message: string, conversationId?: string) => {
            const activeId = conversationId || conversation?.id;

            if (!activeId) {
                setError('No active conversation');
                return;
            }

            try {
                setError(null);

                // Optimistic UI update
                const tempMessage: SupportMessage = {
                    id: `temp-${Date.now()}`,
                    conversation_id: activeId,
                    sender_type: 'user',
                    sender_id: user?.id || null,
                    message,
                    read_at: null,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, tempMessage]);

                // Insert message
                const { data, error: insertError } = await supabase
                    .from('support_messages')
                    .insert({
                        conversation_id: activeId,
                        sender_type: 'user',
                        sender_id: user?.id || null,
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
                console.error('Error sending message:', err);
                setError('Failed to send message');
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
            }
        },
        [conversation, user]
    );

    const markAsRead = useCallback(async (messageId: string) => {
        try {
            await supabase
                .from('support_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', messageId);

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, read_at: new Date().toISOString() } : m
                )
            );
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    }, []);

    const closeConversation = useCallback(() => {
        setConversation(null);
        setMessages([]);
    }, []);

    return {
        conversation,
        messages,
        isLoading,
        error,
        startConversation,
        sendMessage,
        markAsRead,
        closeConversation,
    };
};
