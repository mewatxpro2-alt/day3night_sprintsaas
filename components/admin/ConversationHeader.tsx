import React from 'react';
import { SupportConversation, ConversationStatus } from '../../types';
import { User, Mail, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ConversationHeaderProps {
    conversation: SupportConversation;
    onStatusChange: (status: ConversationStatus) => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
    conversation,
    onStatusChange,
}) => {
    return (
        <div className="p-4 border-b border-border bg-surface">
            <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                        <User size={24} className="text-accent-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-textMain text-lg truncate">
                            {conversation.name || 'Guest User'}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-textMuted mt-1">
                            <Mail size={14} />
                            <span className="truncate">{conversation.email}</span>
                        </div>

                        {conversation.user_id && (
                            <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                                <CheckCircle size={12} className="text-green-500" />
                                <span>Authenticated User</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                            <Calendar size={12} />
                            <span>
                                Started {format(new Date(conversation.created_at), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                    {conversation.status === 'open' ? (
                        <button
                            onClick={() => onStatusChange('resolved')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Mark as Resolved
                        </button>
                    ) : (
                        <button
                            onClick={() => onStatusChange('open')}
                            className="px-4 py-2 bg-surface border border-border hover:bg-surfaceHighlight text-textMain rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Clock size={16} />
                            Reopen Chat
                        </button>
                    )}

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${conversation.status === 'open'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {conversation.status === 'open' ? 'Active' : 'Resolved'}
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-textMuted">
                <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>ID: {conversation.id.slice(0, 8)}...</span>
                </div>
            </div>
        </div>
    );
};

export default ConversationHeader;
