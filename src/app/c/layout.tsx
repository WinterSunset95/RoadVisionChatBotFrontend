/**
 * @file The shared layout for all chat pages (routes under /c/...).
 * It renders the sidebar and provides the main content area for the active chat.
 */
import { Sidebar } from '@/components/sidebar';
import { getChats } from '@/lib/api';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialChats = await getChats();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar initialChats={initialChats} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

