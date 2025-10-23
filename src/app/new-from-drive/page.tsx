'use client'
import { redirect, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api';
import { Suspense, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Document, ProcessingDocument } from '@/types';

/**
 * The UI to show while the chat is being created on the server.
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Creating your new chat from Google Drive...</h1>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}

interface NewFromDrivePageProps {
  searchParams: Promise<{
    driveUrl?: string;
  }>;
}

/**
 * The main page component for the /new-from-drive route.
 * It validates the input and uses a Suspense boundary for a better user experience.
 */
function NewFromDrivePage() {
  const [driveUrl, setDriveUrl] = useState<string | null | undefined>();
  const [chatDocs, setChatDocs] = useState<{ documents: Document[]; processing: ProcessingDocument[] } | undefined>()
  const searchParams = useSearchParams()

  useEffect(() => {
    const subscribe = async () => {
      const driveUrlFromParams = searchParams.get('driveUrl');
      console.log(driveUrlFromParams);
      setDriveUrl(driveUrlFromParams);
      if (driveUrlFromParams) {
        const newChat = await api.createNewChat(driveUrlFromParams);
        let interval = setInterval(async () => {
          const chatDocsFromApi = await api.getChatDocs(newChat.id);
          setChatDocs(chatDocsFromApi);
          console.log(chatDocsFromApi)
          if (chatDocsFromApi.documents.length > 0) {
            clearInterval(interval);
            redirect(`/c/${newChat.id}`);
          }
        }, 1000);
      }
    };
    subscribe();
  }, [])

  if (driveUrl === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-semibold mb-4">Invalid Link</h1>
        <p className="text-muted-foreground">No Google Drive URL was provided.</p>
      </div>
    );
  }

  if (driveUrl === undefined) {
    return <LoadingState />;
  }

  if (!chatDocs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">Downloading files from Google Drive...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Files are now processing...</h1>
      <p className="text-muted-foreground">You will be redirected as soon as at least one file is processed.</p>
      {chatDocs.processing.map((doc) => (
        <div key={doc.job_id}>
          <p>{doc.name}</p>
          <p>{doc.status}</p>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewFromDrivePage />
    </Suspense>
  )
}
