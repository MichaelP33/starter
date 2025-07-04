import { ChatInterface } from '@/components/chat/ChatInterface';

export default function AppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <ChatInterface />
    </main>
  );
} 