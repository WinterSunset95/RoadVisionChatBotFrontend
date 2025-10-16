/**
 * @file The shared layout for all chat pages (routes under /c/...).
 * It renders the sidebar and provides the main content area for the active chat.
 */

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

