import { SignedIn, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignedIn>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <header className="flex justify-end mb-8">
            <UserButton />
          </header>
          {children}
        </main>
      </div>
    </SignedIn>
  );
}
