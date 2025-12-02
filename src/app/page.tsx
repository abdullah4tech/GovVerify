"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";
import {
  CloudArrowUpIcon,
  ChatBubbleBottomCenterTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100">
      {/* A. Header / Navigation */}
      <Navbar maxWidth="xl" className="border-b border-zinc-100" isBordered>
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <p className="font-bold text-xl tracking-tight text-zinc-900">
              GovVerify
            </p>
          </div>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <SignInButton mode="modal">
              <Button
                as="button"
                color="primary"
                variant="flat"
                className="font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Admin Login
              </Button>
            </SignInButton>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="flex flex-col items-center">
        {/* B. Hero Section (The Pitch) */}
        <section className="w-full max-w-4xl px-6 py-24 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6">
            GovVerify: The Sierra Leone{" "}
            <span className="text-blue-600">Truth Engine</span>.
          </h1>
          <h2 className="text-xl md:text-2xl text-zinc-500 font-normal max-w-2xl mb-8 leading-relaxed">
            Combating viral misinformation and cyber scams by centralizing the
            source of truth.
          </h2>
          <p className="text-zinc-600 text-lg max-w-xl mb-10">
            Citizens need a unified tool to instantly verify official
            information and report digital threats.
          </p>

          <SignInButton mode="modal">
            <Button
              size="lg"
              color="primary"
              className="bg-blue-600 font-semibold px-8 py-6 text-lg shadow-lg shadow-blue-600/20"
            >
              Access Secure Portal
            </Button>
          </SignInButton>
        </section>

        {/* C. Solution Overview (The Ecosystem) */}
        <section className="w-full max-w-6xl px-6 py-16 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Secure Upload Platform */}
            <Card className="p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex gap-4 px-0 pt-0 pb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <CloudArrowUpIcon className="w-8 h-8" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                    Admin Portal
                  </p>
                  <h3 className="text-xl font-bold text-zinc-900">
                    Official Document Management
                  </h3>
                </div>
              </CardHeader>
              <Divider className="my-2" />
              <CardBody className="px-0 pb-0 pt-2">
                <p className="text-zinc-600 leading-relaxed">
                  A protected portal for government ministries to upload and
                  verify official PDFs, establishing the certified
                  source-of-truth.
                </p>
              </CardBody>
            </Card>

            {/* Card 2: Citizen Access */}
            <Card className="p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex gap-4 px-0 pt-0 pb-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-bold text-green-600 uppercase tracking-wider">
                    Citizen Access
                  </p>
                  <h3 className="text-xl font-bold text-zinc-900">
                    WhatsApp Verification & Reporting
                  </h3>
                </div>
              </CardHeader>
              <Divider className="my-2" />
              <CardBody className="px-0 pb-0 pt-2">
                <p className="text-zinc-600 leading-relaxed">
                  The AI Chatbot uses the verified documents to instantly answer
                  citizen queries and guide the reporting of scams/fraud.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>
      </main>

      {/* D. Footer */}
      <footer className="w-full border-t border-zinc-100 py-12 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-75">
            <ShieldCheckIcon className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-zinc-700">GovVerify</span>
          </div>

          <div className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} GovVerify Hackathon Project. All
            rights reserved.
          </div>

          <div className="flex gap-6">
            <Link
              href="#"
              className="text-zinc-500 hover:text-zinc-900 text-sm"
            >
              GitHub
            </Link>
            <Link
              href="#"
              className="text-zinc-500 hover:text-zinc-900 text-sm"
            >
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
