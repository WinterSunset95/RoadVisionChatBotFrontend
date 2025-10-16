/**
 * @file Renders the scrollable list of messages in the chat view.
 */
'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageBubble } from './message-bubble';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const examplePrompts = [
    { title: "Summarize tender requirements", text: "Summarize the key requirements for the latest infrastructure tender." },
    { title: "Check eligibility criteria", text: "What are the eligibility criteria for the recent IT services proposal?" },
    { title: "Compare tender deadlines", text: "Compare the deadlines for the top 3 construction tenders." },
    { title: "Find renewable energy tenders", text: "Find any tenders related to renewable energy in the last month." },
];

export function MessageList({ messages, isLoading, onSendMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log(messages);
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
        <div className="flex-1 overflow-y-auto bg-muted/50 flex flex-col items-center justify-center">
            <div className="text-center max-w-lg mx-auto p-8">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Bot className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-bold mt-8 mb-4">
                    Chat with AI
                </h1>
                <p className="text-muted-foreground text-lg">
                    Start a conversation or upload a document to get started.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {examplePrompts.map((prompt, i) => (
                        <div key={i} onClick={() => onSendMessage(prompt.text)} className="p-4 bg-card border rounded-lg hover:bg-accent cursor-pointer transition-all">
                            <p className="font-semibold text-sm">{prompt.title}</p>
                            <p className="text-muted-foreground text-sm mt-1">{prompt.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-in slide-in-from-bottom-5 duration-300">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot size={18} />
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}/>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">AI is thinking...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

