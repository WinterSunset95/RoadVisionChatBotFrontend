/**
 * @file The main sidebar component. Manages chat list state and user interactions.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Chat } from '@/types';
import { ChatHistory } from './chat-history';
import { Plus, Sun, Moon, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createNewChat, deleteChat, renameChat, getChats } from '@/lib/api';
import { useToasts } from '@/lib/hooks/use-toasts';
import { useTheme } from 'next-themes';

/**
 * The main sidebar component containing the new chat button and chat history.
 */
export function Sidebar({ initialChats }: { initialChats: Chat[] }) {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToasts();
  const { theme, setTheme } = useTheme();
  
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  const fetchChats = async () => {
    try {
      const freshChats = await getChats();
      setChats(freshChats);
    } catch (error) {
       addToast('error', 'Could not refresh chats');
    }
  }

  // Refetch chats when the active chat ID changes to update counts/titles
  useEffect(() => {
    fetchChats();
  }, [params.chatId]);

  const handleCreateChat = async () => {
    try {
      const newChat = await createNewChat();
      setChats(prev => [newChat, ...prev]);
      router.push(`/c/${newChat.id}`);
    } catch (error) {
      addToast('error', 'Failed to create chat');
      console.error("Failed to create new chat", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await deleteChat(chatId);
      addToast('success', 'Chat deleted');
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (params.chatId === chatId) {
        router.push('/');
      }
    } catch (error) {
      addToast('error', 'Failed to delete chat');
    }
  };

  const handleSaveEdit = async (chatId: string) => {
    if (!editTitle.trim()) return;
    try {
      await renameChat(chatId, editTitle);
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: editTitle } : c));
      addToast('success', 'Chat renamed');
    } catch {
      addToast('error', 'Failed to rename chat');
    } finally {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  return (
    <aside className="w-80 bg-background border-r flex flex-col h-screen">
      <div className="p-4 border-b flex flex-col gap-4">
        <div className='flex items-center justify-between'>
          <Button variant="ghost" size="icon" className=""><Menu size={20} /></Button>
          <Button variant="ghost" size="icon" className=""><Search size={20} /></Button>
        </div>
        <Button onClick={handleCreateChat} className="w-full gap-2">
          <Plus size={18} />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatHistory
          chats={chats}
          activeChatId={params.chatId as string}
          editingChatId={editingChatId}
          editTitle={editTitle}
          onEditChange={setEditTitle}
          onStartEdit={(chat) => { setEditingChatId(chat.id); setEditTitle(chat.title); }}
          onCancelEdit={() => setEditingChatId(null)}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDeleteChat}
        />
      </div>
      <div className="p-4 border-t">
        {mounted && (
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full justify-start gap-3"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
