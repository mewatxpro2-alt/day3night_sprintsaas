import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportChatWidget from './SupportChatWidget';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const SupportChatButton: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load unread count
    useEffect(() => {
        loadUnreadCount();

        // Subscribe to new admin messages
        const channel = supabase
            .channel('support-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: 'sender_type=eq.admin',
                },
                () => {
                    loadUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Reset unread count when widget opens
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const loadUnreadCount = async () => {
        try {
            let conversationId: string | null = null;

            if (user) {
                // Get conversation for authenticated user
                const { data: conversation } = await supabase
                    .from('support_conversations')
                    .select('id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                conversationId = conversation?.id || null;
            } else {
                // Get conversation ID from localStorage for guest
                conversationId = localStorage.getItem('support_conversation_id');
            }

            if (!conversationId) {
                setUnreadCount(0);
                return;
            }

            // Count unread admin messages
            const { count } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conversationId)
                .eq('sender_type', 'admin')
                .is('read_at', null);

            setUnreadCount(count || 0);
        } catch (err) {
            console.error('Error loading unread count:', err);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 bg-accent-primary text-black rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center z-50 ${isOpen ? 'scale-0' : 'scale-100'
                    }`}
                aria-label="Open support chat"
            >
                <MessageCircle size={24} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Chat Widget */}
            <SupportChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default SupportChatButton;
