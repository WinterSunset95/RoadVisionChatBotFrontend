/**
 * @file Displays and manages documents associated with the active chat.
 */
'use client';

import { Document } from '@/types';
import { FileText, Loader, Trash2, X } from 'lucide-react';

interface DocumentPanelProps {
  docs: Document[];
  isLoading: boolean;
  onClose: () => void;
  onDelete: (docName: string) => void;
}

export function DocumentPanel({ docs, isLoading, onClose, onDelete }: DocumentPanelProps) {
  return (
    <div className="max-w-4xl mx-auto my-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          Documents ({docs.length})
        </h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-sm text-gray-600">
          <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          Loading documents...
        </div>
      ) : docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-100 rounded-md"><FileText size={16} className="text-blue-600" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.chunks} sections indexed</p>
                </div>
              </div>
              <button onClick={() => onDelete(doc.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500 py-4">No documents uploaded for this chat.</p>
      )}
    </div>
  );
}