/**
 * @file Component for the application's landing page.
 * It's displayed when no active chat is selected.
 */
'use client';

import { useRouter } from 'next/navigation';
import { Bot, MessageSquare, Send, FileText } from 'lucide-react';
import { createNewChat } from '@/lib/api';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Button } from '@/components/ui/button';

export function WelcomeScreen() {
  const router = useRouter();
  const { addToast } = useToasts();

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
    <main className="flex flex-col items-center justify-center bg-background h-full w-full p-2">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Bot className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-6">
        Chat with AI
      </h1>

      <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-center">
        Start a conversation or upload a document to get instant, intelligent responses powered by advanced AI.
      </p>

      <Button
        onClick={handleStartChat}
        className="group h-auto rounded-2xl px-8 py-4 text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
      >
        <span className="flex items-center gap-3">
          Start Chatting
          <div className="w-0 group-hover:w-5 transition-all duration-200 overflow-hidden">
            <Send className="w-5 h-5" />
          </div>
        </span>
      </Button>

      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
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
  );
}
