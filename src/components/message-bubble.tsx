/**
 * @file Renders a single message bubble for either a user or a bot.
 */
'use client';

import { useState } from 'react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, FileText, X } from 'lucide-react';

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function MessageBubble({ message }: { message: Message }) {
  const [showReferences, setShowReferences] = useState(false);

  const bubbleStyles = {
    user: 'bg-blue-500 text-white',
    bot: `bg-white border border-gray-200 text-gray-800 ${message.hasContext ? 'border-purple-200' : ''}`,
    error: 'bg-red-50 border-2 border-red-200 text-red-800',
  };

  const bubbleClass = message.isError ? bubbleStyles.error : bubbleStyles[message.sender];
  const avatarClass = message.sender === 'user' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-600 to-gray-700';

  return (
    <div className={`flex gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${avatarClass}`}>
        {message.sender === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
      </div>

      <div className={`flex-1 max-w-2xl ${message.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
        <div className={`inline-block p-4 rounded-lg shadow-sm text-left ${bubbleClass}`}>
          <div className="prose prose-sm max-w-none text-current prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
          </div>

          {message.hasContext && (
             <div className="mt-3 pt-3 border-t border-purple-200/50">
                <button onClick={() => setShowReferences(!showReferences)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
                    <FileText size={12}/> View Sources
                </button>
             </div>
          )}
        </div>
        
        {showReferences && message.sourceReferences && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-left shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-xs text-gray-700">Sources Used</h4>
                    <button onClick={() => setShowReferences(false)}><X size={14} className="text-gray-400"/></button>
                </div>
                <div className="space-y-2">
                    {message.sourceReferences.map((ref, i) => (
                        <div key={i} className="bg-white p-2 border-l-4 border-purple-300 rounded">
                            <p className="text-xs text-gray-600 leading-relaxed italic">"...{ref.content}..."</p>
                            <p className="text-right text-xs text-gray-400 mt-1">Page {ref.page}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className={`text-xs text-gray-500 mt-1.5 ${message.sender === 'user' ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}