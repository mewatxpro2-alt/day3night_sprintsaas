import React from 'react';
import { SupportMessage } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { SUPPORT_CONFIG } from '../config/support';

interface MessageBubbleProps {
  message: SupportMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  // System messages (resolved, feedback requests, etc)
  if (message.sender_type === 'system') {
    return (
      <div className="flex justify-center mb-4 animate-fade-in">
        <div className="max-w-[85%] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {message.message}
          </p>
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mt-2 block">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  }

  // Regular user/admin messages
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start items-end gap-2'} mb-4 animate-fade-in px-2`}
    >
      {/* Admin Avatar */}
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 mb-1 shadow-sm">
          {SUPPORT_CONFIG.websiteLogo ? (
            <img
              src={SUPPORT_CONFIG.websiteLogo}
              alt="Admin"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-full h-full text-green-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16L12 4H26L20 16H6Z" fill="currentColor" className="opacity-90" />
                <path d="M26 16L20 28H6L12 16H26Z" fill="currentColor" fillOpacity="0.6" />
              </svg>
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-[20px] px-5 py-3.5 shadow-sm transition-all ${isCurrentUser
          ? 'bg-accent-primary text-black rounded-br-none'
          : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-textMain rounded-bl-none'
          }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.message}
        </p>

        <div className={`flex items-center gap-1.5 mt-1.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[11px] ${isCurrentUser ? 'text-black/60' : 'text-textMuted'}`}>
            {formatTime(message.created_at)}
          </span>

          {isCurrentUser && (
            <span className="text-black/60">
              {message.read_at ? (
                <CheckCheck size={14} className="opacity-70" strokeWidth={2} />
              ) : (
                <Check size={14} className="opacity-50" strokeWidth={2} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
