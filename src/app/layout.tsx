import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GovVerify - Official Document Manager",
  description: "Securely upload and manage official government documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
            rel="stylesheet"
          />
        </head>
        <body className={inter.className}>
          <Providers>
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
            <SignedOut>
              <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-8">GovVerify Admin</h1>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Sign In to Access
                    </button>
                  </SignInButton>
                </div>
              </div>
            </SignedOut>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
