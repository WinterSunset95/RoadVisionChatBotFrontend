/**
 * @file The text input area for the user to send messages.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      // Max height of ~6 lines
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSend = () => {
    if (disabled || !inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setInputMessage('');
    }
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border-t p-4 pb-1">
        <div className="flex flex-col gap-2 border rounded-lg p-2 focus-within:border-primary transition-all">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full focus:outline-none resize-none overflow-hidden"
            disabled={disabled}
            rows={1}
          >Ask me anything...</textarea>
          <div className='flex items-center justify-between'>
            <Button
              onClick={handleSend}
              disabled={disabled || !inputMessage.trim()}
              size="icon"
              className=""
            >
              {disabled ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Shift+Enter for new line. Esc to clear.</p>
    </div>
  );
}
