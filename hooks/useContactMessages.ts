import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    company: string;
    message: string;
    status: 'unread' | 'read' | 'resolved';
    created_at: string;
}

export const useContactMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setMessages(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const updateStatus = async (messageId: string, status: 'read' | 'resolved') => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ status })
                .eq('id', messageId);

            if (error) throw error;

            await fetchMessages();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
        }
    };

    return { messages, isLoading, error, updateStatus };
};
