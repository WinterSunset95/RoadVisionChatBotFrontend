/**
 * @file Displays and manages documents associated with the active chat.
 */
'use client';

import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, Loader, Trash2, X } from 'lucide-react';

interface DocumentPanelProps {
  docs: Document[];
  isLoading: boolean;
  onClose: () => void;
  onDelete: (docName: string) => void;
}

export function DocumentPanel({ docs, isLoading, onClose, onDelete }: DocumentPanelProps) {
  return (
    <div className="max-w-4xl mx-auto my-4 p-4 bg-accent/50 rounded-xl border animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Documents ({docs.length})
        </h3>
        <Button onClick={onClose} variant="ghost" size="icon" className="w-6 h-6"><X size={16} /></Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin text-primary mr-2" />
          Loading documents...
        </div>
      ) : docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-3 bg-background rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary/10 rounded-md"><FileText size={16} className="text-primary" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.chunks} sections indexed</p>
                </div>
              </div>
              <Button onClick={() => onDelete(doc.name)} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">No documents uploaded for this chat.</p>
      )}
    </div>
  );
}
