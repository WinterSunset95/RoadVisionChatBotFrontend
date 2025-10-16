/**
 * @file The text input area for the user to send messages.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  disabled: boolean;
  isUploading: boolean;
}

export function ChatInput({ onSendMessage, onFileUpload, disabled, isUploading }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border-t p-4 pb-1">
        <div className="flex flex-col gap-4 border rounded-lg p-2 focus-within:border-primary transition-all focus-within:shadow">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full focus:outline-none resize-none overflow-hidden"
            disabled={disabled}
            rows={1}
          ></textarea>
          <div className='flex items-center justify-between'>
            <div>
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    variant="default"
                    className="gap-2"
                >
                    {isUploading ? <Loader className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5" />}
                    <span className="text-sm font-medium">Upload File</span>
                </Button>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </div>
            <Button
              onClick={handleSend}
              disabled={disabled || !inputMessage.trim()}
              size="icon"
              className=""
            >
              {disabled && !isUploading ? (
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
