/**
 * @file Renders a single message bubble for either a user or a bot.
 */
'use client';

import { useState } from 'react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function MessageBubble({ message }: { message: Message }) {
  const [showReferences, setShowReferences] = useState(false);

  const bubbleClass = cn(
    'p-4 rounded-lg shadow-sm text-left',
    {
      'bg-primary text-primary-foreground': message.sender === 'user' && !message.isError,
      'bg-card border text-card-foreground': message.sender === 'bot' && !message.isError,
      'border-primary/50': message.hasContext && !message.isError,
      'bg-destructive/10 border-2 border-destructive/20 text-destructive-foreground': message.isError,
    }
  );

  const avatarClass = cn(
    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md',
    {
      'bg-muted text-muted-foreground': message.sender === 'user',
      'bg-primary text-primary-foreground': message.sender === 'bot',
    }
  );

  return (
    <div className={`flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={avatarClass}>
        {message.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={`flex-1 ${message.sender === 'user' ? 'flex flex-col items-end max-w-2xl' : ''}`}>
        <div className={cn(bubbleClass)}>
          <div className="max-w-2xl lg:max-w-4xl w-full text-sm text-current">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => <ul className="my-2 ml-4 list-disc list-inside space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="my-2 ml-4 list-decimal list-inside space-y-1" {...props} />,
                a: ({ node, ...props }) => <a className="font-semibold underline hover:no-underline" {...props} />,
                table: ({ node, ...props }) => <table className="my-2 w-full border-collapse" {...props} />,
                th: ({ node, ...props }) => <th className="border border-primary/20 p-2" {...props} />,
                td: ({ node, ...props }) => <td className="border border-primary/20 p-2" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="my-2 border-l-2 border-primary/20 pl-4 italic" {...props} />,
                h1: ({ node, ...props }) => <h1 className="my-2 text-2xl font-bold" {...props} />,
                h2: ({ node, ...props }) => <h2 className="my-2 text-xl font-bold" {...props} />,
                h3: ({ node, ...props }) => <h3 className="my-2 text-lg font-bold" {...props} />,
                h4: ({ node, ...props }) => <h4 className="my-2 text-md font-bold" {...props} />,
                h5: ({ node, ...props }) => <h5 className="my-2 text-sm font-bold" {...props} />,
                h6: ({ node, ...props }) => <h6 className="my-2 text-xs font-bold" {...props} />,
                pre: ({ node, ...props }) => <pre className="w-full overflow-x-auto" {...props} />,
                code: ({ node, ...props }) => <code className="inline-block rounded bg-accent px-1 py-0.5 font-mono text-sm" {...props} />,
                img: ({ node, ...props }) => <img className="my-2 mx-auto max-w-full rounded-md" {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {message.hasContext && (
             <div className="mt-3 pt-3 border-t border-primary/20">
                <Button onClick={() => setShowReferences(!showReferences)} variant="link" className="h-auto p-0 text-xs gap-1">
                    <FileText size={12}/> View Sources
                </Button>
             </div>
          )}
        </div>
        
        {showReferences && message.sourceReferences && (
            <div className="mt-2 p-3 bg-accent border rounded-lg text-left shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-xs text-foreground">Sources Used</h4>
                    <Button onClick={() => setShowReferences(false)} variant="ghost" size="icon" className="h-6 w-6"><X size={14} /></Button>
                </div>
                <div className="space-y-2">
                    {message.sourceReferences.map((ref, i) => (
                        <div key={i} className="bg-background p-2 border-l-4 border-primary/50 rounded">
                            <p className="text-xs text-muted-foreground leading-relaxed italic">"...{ref.content}..."</p>
                            <p className="text-right text-xs text-muted-foreground mt-1">Page {ref.page}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className={`text-xs text-muted-foreground mt-1.5 ${message.sender === 'user' ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
