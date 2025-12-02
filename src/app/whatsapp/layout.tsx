import { SignedIn, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignedIn>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <Sidebar />
        <main className="flex-1 ml-64">
          <header className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex justify-end">
            <UserButton />
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </SignedIn>
  );
}
