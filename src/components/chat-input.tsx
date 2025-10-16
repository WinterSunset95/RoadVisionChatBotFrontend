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
    <div className="bg-background/80 backdrop-blur-sm border-t p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full pr-14 resize-none"
            disabled={disabled}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !inputMessage.trim()}
            size="icon"
            className="absolute right-3 bottom-2.5"
          >
            {disabled ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Shift+Enter for new line. Esc to clear.</p>
      </div>
    </div>
  );
}
