'use client'
import { redirect, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api';
import { Suspense, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Document, ProcessingDocument } from '@/types';
import Loading from './loading';
import { NewFromDrivePage } from './components/NewFromDrivePage';

/**
 * The main page component for the /new-from-drive route.
 * It validates the input and uses a Suspense boundary for a better user experience.
 */
function MainComponent() {
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

  return <NewFromDrivePage driveUrl={driveUrl} chatDocs={chatDocs} />

}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MainComponent />
    </Suspense>
  )
}
