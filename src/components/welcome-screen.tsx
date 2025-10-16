/**
 * @file Component for the application's landing page.
 * It's displayed when no active chat is selected.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Send, FileText } from 'lucide-react';
import { createNewChat, getChats } from '@/lib/api';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';
import { Chat } from '@/types';

export function WelcomeScreen() {
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
    <div className="flex h-screen w-full">
      <Sidebar initialChats={chats} />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 h-full">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25">
            <Bot className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Chat with AI
        </h1>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Start a conversation or upload a document to get instant, intelligent responses powered by advanced AI.
        </p>

        <Button
          onClick={handleStartChat}
          className="group px-8 py-4 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
        >
          <span className="flex items-center gap-3">
            Start Chatting
            <div className="w-0 group-hover:w-5 transition-all duration-200 overflow-hidden">
              <Send className="w-5 h-5" />
            </div>
          </span>
        </Button>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>PDF Support</span>
            </div>
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Multi-Chat</span>
            </div>
        </div>
      </main>
    </div>
  );
}
