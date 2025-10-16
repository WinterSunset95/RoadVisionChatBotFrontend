/**
 * @file The root page of the application (route: /).
 * This page simply renders the WelcomeScreen component.
 */
'use client';
import { WelcomeScreen } from '@/components/welcome-screen';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Send, FileText } from 'lucide-react';
import { createNewChat, getChats } from '@/lib/api';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { addToast } = useToasts();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setChats(await getChats());
      } catch (error) {
        addToast('error', 'Could not load chats');
      }
    }
    fetchChats();
  }, [addToast]);

  const handleStartChat = async () => {
    try {
      const newChat = await createNewChat();
      router.push(`/c/${newChat.id}`);
    } catch (error) {
      addToast('error', 'Failed to start chat', 'Please try again later.');
      console.error(error);
    }
  };
  return (
    <div className='flex h-full w-full'>
      <Sidebar initialChats={chats} />
      <WelcomeScreen />;
    </div>
  )
}
