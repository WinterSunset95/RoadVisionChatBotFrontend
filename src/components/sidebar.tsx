/**
 * @file The main sidebar component. Manages chat list state and user interactions.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Chat } from '@/types';
import { ChatHistory } from './chat-history';
import { Plus, Sun, Moon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToasts } from '@/lib/hooks/use-toasts';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { 
  createNewChat, 
  deleteChat, 
  renameChat, 
  setInitialChats,
  selectAllChats,
} from '@/lib/redux/chatSlice';

/**
 * The main sidebar component containing the new chat button and chat history.
 */
export function Sidebar({ initialChats, isMobileOpen, onMobileClose, isCollapsed }: { initialChats: Chat[], isMobileOpen: boolean, onMobileClose: () => void, isCollapsed: boolean }) {
  const router = useRouter();
  const params = useParams();
  const dispatch: AppDispatch = useDispatch();
  const { addToast } = useToasts();
  const { theme, setTheme } = useTheme();
  
  const chats = useSelector(selectAllChats);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Hydrate the store with server-side fetched data
    dispatch(setInitialChats(initialChats));
  }, [initialChats, dispatch]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = async () => {
    try {
      const newChat = await dispatch(createNewChat()).unwrap();
      router.push(`/c/${newChat.id}`);
    } catch (error) {
      addToast('error', 'Failed to create chat', error as string);
      console.error("Failed to create new chat", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await dispatch(deleteChat(chatId)).unwrap();
      addToast('success', 'Chat deleted');
      if (params.chatId === chatId) {
        router.push('/');
      }
    } catch (error) {
      addToast('error', 'Failed to delete chat', error as string);
    }
  };

  const handleSaveEdit = async (chatId: string) => {
    const newTitle = editTitle.trim();
    if (!newTitle) return;
    try {
      await dispatch(renameChat({ chatId, newTitle })).unwrap();
      addToast('success', 'Chat renamed');
    } catch (error) {
      addToast('error', 'Failed to rename chat', error as string);
    } finally {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  return (
    <>
      {isMobileOpen && <div onClick={onMobileClose} className="bg-black/50 fixed inset-0 z-40 lg:hidden" />}
      <aside className={cn(
        "bg-background border-r flex flex-col h-screen transition-all duration-300 z-50 fixed inset-y-0 left-0 w-80",
        "lg:static lg:flex",
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
        isCollapsed ? "lg:w-20" : "lg:w-80"
      )}>
        <div className="p-4 border-b flex flex-col gap-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Button
              variant="default"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-6"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            {!isCollapsed && (
              <Button variant="default" size="icon" className="px-6" onClick={() => { if(isSearching) setSearchQuery(''); setIsSearching(prev => !prev); }}>
                {isSearching ? <X size={20} /> : <Search size={20} />}
              </Button>
            )}
          </div>
        {isSearching && !isCollapsed && (
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        )}
        <Button onClick={handleCreateChat} className="w-full gap-2">
          <Plus size={18} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>
      <div className={cn("flex-1 overflow-y-auto", { 'hidden': isCollapsed })}>
        <ChatHistory
          chats={filteredChats}
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
    </aside>
    </>
  );
}
