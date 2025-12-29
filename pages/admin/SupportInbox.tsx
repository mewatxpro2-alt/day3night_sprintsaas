import React, { useState, useEffect } from 'react';
import { useAdminSupport } from '../../hooks/useAdminSupport';
import ConversationList from '../../components/admin/ConversationList';
import ConversationHeader from '../../components/admin/ConversationHeader';
import AdminChatView from '../../components/admin/AdminChatView';
import { Loader2, MessageSquare } from 'lucide-react';

const SupportInbox: React.FC = () => {
    const {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        error,
        loadConversations,
        selectConversation,
        sendAdminReply,
        updateStatus,
    } = useAdminSupport();

    const [sortBy, setSortBy] = useState<'new' | 'unread' | 'old'>('new');

    // Load conversations on mount
    useEffect(() => {
        loadConversations(sortBy);
    }, [sortBy]);

    const handleSortChange = (newSort: 'new' | 'unread' | 'old') => {
        setSortBy(newSort);
        loadConversations(newSort);
    };

    const handleSelectConversation = async (id: string) => {
        await selectConversation(id);
    };

    const handleSendReply = async (message: string) => {
        if (!selectedConversation) return;
        await sendAdminReply(selectedConversation.id, message);
    };

    const handleStatusChange = async (status: 'open' | 'resolved') => {
        if (!selectedConversation) return;
        await updateStatus(selectedConversation.id, status);
    };

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="h-[calc(100vh-80px)] flex">
                {/* Left Sidebar: Conversation List */}
                <div className="w-full md:w-[350px] lg:w-[400px] border-r border-border">
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation?.id || null}
                        onSelect={handleSelectConversation}
                        sortBy={sortBy}
                        onSortChange={handleSortChange}
                    />
                </div>

                {/* Right Panel: Chat View */}
                <div className="flex-1 flex flex-col">
                    {isLoading && !selectedConversation ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-accent-primary" size={48} />
                        </div>
                    ) : selectedConversation ? (
                        <>
                            <ConversationHeader
                                conversation={selectedConversation}
                                onStatusChange={handleStatusChange}
                            />
                            <AdminChatView
                                conversation={selectedConversation}
                                messages={messages}
                                onSendReply={handleSendReply}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <MessageSquare size={64} className="text-textMuted/30 mb-4" />
                            <h3 className="text-xl font-bold text-textMain mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-textMuted max-w-md">
                                Choose a conversation from the sidebar to view messages and reply to users.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportInbox;
