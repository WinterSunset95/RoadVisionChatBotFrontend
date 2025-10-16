/**
 * @file Renders the list of past chat conversations in the sidebar.
 */
'use client';

import Link from 'next/link';
import { Chat } from '@/types';
import { MessageSquare, FileText, Clock, Edit3, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  chats: Chat[];
  activeChatId: string;
  editingChatId: string | null;
  editTitle: string;
  onEditChange: (title: string) => void;
  onStartEdit: (chat: Chat) => void;
  onCancelEdit: () => void;
  onSaveEdit: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export function ChatHistory({
  chats, activeChatId, editingChatId, editTitle,
  onEditChange, onStartEdit, onCancelEdit, onSaveEdit, onDelete
}: ChatHistoryProps) {

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 h-full flex flex-col items-center justify-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {chats.map((chat) => (
        <Link href={`/c/${chat.id}`} key={chat.id} passHref>
          <div
            className={cn(
              'group relative p-3 rounded-lg cursor-pointer transition-all',
              activeChatId === chat.id ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'hover:bg-gray-100'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${chat.has_pdf ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                {chat.has_pdf ? <FileText size={16} /> : <MessageSquare size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                {editingChatId === chat.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <Input
                        value={editTitle}
                        onChange={(e) => onEditChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEdit(chat.id);
                          if (e.key === 'Escape') onCancelEdit();
                        }}
                        className="h-8"
                        autoFocus
                      />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800 truncate">{chat.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      <span>{formatDate(chat.updated_at)}</span>
                      <span>•</span>
                      <span>{chat.message_count} msgs</span>
                    </div>
                  </>
                )}
              </div>
            </div>
             {editingChatId === chat.id ? (
                <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => {e.stopPropagation(); e.preventDefault();}}>
                    <Button onClick={() => onSaveEdit(chat.id)} variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-green-100"><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                    <Button onClick={onCancelEdit} variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-gray-200"><X className="w-3.5 h-3.5 text-gray-500" /></Button>
                </div>
             ) : (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {e.stopPropagation(); e.preventDefault();}}>
                  <Button onClick={() => onStartEdit(chat)} variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100"><Edit3 className="w-3.5 h-3.5 text-gray-600" /></Button>
                  <Button onClick={() => onDelete(chat.id)} variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5 text-gray-600" /></Button>
                </div>
             )}
          </div>
        </Link>
      ))}
    </div>
  );
}
