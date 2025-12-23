"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-primary/20 selection:text-primary">
      {/* A. Header / Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon icon="lucide:landmark" className="w-6 h-6 text-primary" />
            </div>
            <p className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
              GovVerify
            </p>
          </div>

          <SignInButton mode="modal">
            <button className="px-5 py-2 rounded-xl font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              Admin Login
            </button>
          </SignInButton>
        </div>
      </nav>

      <main className="flex flex-col items-center pt-16">
        {/* B. Hero Section (The Pitch) */}
        <section className="w-full max-w-5xl px-6 py-32 text-center flex flex-col items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-8 border border-zinc-200 dark:border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live System v1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8 leading-tight">
            The Sierra Leone{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Truth Engine
            </span>
            .
          </h1>

          <h2 className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-normal max-w-3xl mb-12 leading-relaxed">
            Combating viral misinformation and cyber scams by centralizing the
            source of truth. A unified tool to instantly verify official
            information.
          </h2>

          <SignInButton mode="modal">
            <button className="group relative px-8 py-4 bg-primary text-white text-lg font-semibold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                Access Secure Portal
                <Icon
                  icon="lucide:arrow-right"
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </SignInButton>

          {/* Stats/Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 w-full max-w-4xl border-t border-zinc-100 dark:border-zinc-800 pt-12">
            {[
              { label: "Verified Documents", value: "10k+" },
              { label: "Active Ministries", value: "24" },
              { label: "Citizen Queries", value: "50k+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* C. Solution Overview (The Ecosystem) */}
        <section className="w-full max-w-7xl px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Secure Upload Platform */}
            <div className="group p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="lucide:cloud-upload" className="w-8 h-8" />
                </div>
                <Icon
                  icon="lucide:arrow-up-right"
                  className="w-6 h-6 text-zinc-300 group-hover:text-primary transition-colors"
                />
              </div>

              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Admin Portal
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Official Document Management
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                A protected portal for government ministries to upload and
                verify official PDFs, establishing the certified
                source-of-truth.
              </p>
            </div>

            {/* Card 2: Citizen Access */}
            <div className="group p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-green-500/50 transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="logos:whatsapp-icon" className="w-8 h-8" />
                </div>
                <Icon
                  icon="lucide:arrow-up-right"
                  className="w-6 h-6 text-zinc-300 group-hover:text-green-500 transition-colors"
                />
              </div>

              <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
                Citizen Access
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                WhatsApp Verification & Reporting
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                The AI Chatbot uses the verified documents to instantly answer
                citizen queries and guide the reporting of scams/fraud.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* D. Footer */}
      <footer className="w-full border-t border-zinc-100 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
            <div className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
              <Icon
                icon="lucide:landmark"
                className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              />
            </div>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              GovVerify
            </span>
          </div>

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} GovVerify Hackathon Project. All
            rights reserved.
          </div>

          <div className="flex gap-8">
            <Link
              href="#"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Icon icon="lucide:github" className="w-4 h-4" />
              GitHub
            </Link>
            <Link
              href="#"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Icon icon="lucide:book" className="w-4 h-4" />
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
