/**
 * @file A modal overlay that displays the progress of ongoing file uploads.
 */
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
}

interface UploadProgressOverlayProps {
  uploads: UploadItem[];
  onCancel: (id: string) => void;
}

export function UploadProgressOverlay({ uploads, onCancel }: UploadProgressOverlayProps) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Uploading Files</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {uploads.map((upload) => (
            <div key={upload.id}>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium truncate flex items-center gap-2">
                  <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{upload.file.name}</span>
                </p>
                <p className="text-muted-foreground ml-2">{upload.progress}%</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative h-2 bg-muted rounded-full overflow-hidden flex-1">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-100"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCancel(upload.id)}>
                    <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
