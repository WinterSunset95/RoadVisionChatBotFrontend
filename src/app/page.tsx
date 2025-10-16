/**
 * @file The root page of the application (route: /).
 * This page simply renders the WelcomeScreen component.
 */
'use client';
import { ChatView } from '@/components/chat-view';
import { useState, useEffect } from 'react';
import { getChats } from '@/lib/api';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Chat } from '@/types';

export default function HomePage() {
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

  return (
      <ChatView initialChats={chats} />
  )
}
