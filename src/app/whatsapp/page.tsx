"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const API_KEY = process.env.NEXT_PUBLIC_GENELINE_X_API_KEY!;
const BASE_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_BASE_URL || "http://localhost:5000";
const CHATBOT_ID = process.env.NEXT_PUBLIC_GENELINE_X_CHATBOT_ID!;

export default function WhatsAppIntegration() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("disconnected");
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    // Check cached status
    const cachedPhone = localStorage.getItem("whatsapp_phone");
    const cachedStatus = localStorage.getItem("whatsapp_status");

    if (cachedPhone && cachedStatus === "connected") {
      setPhoneNumber(cachedPhone);
      setStatus("connected");
    }

    // Initialize Socket.IO
    const socketInstance = io(BASE_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    console.log("🔌 Initializing Socket.IO connection to:", BASE_URL);

    // Listen for QR code
    socketInstance.on(`qr:${CHATBOT_ID}`, (qrCodeBase64: string) => {
      console.log("📱 QR Code received");
      setQRCode(qrCodeBase64);
      setStatus("awaiting_scan");
      setStatusMessage("Scan QR code with WhatsApp");
      setIsLoading(false);
      setError(null);
    });

    // Listen for connection success
    socketInstance.on(
      `connected:${CHATBOT_ID}`,
      (data: { phoneNumber: string }) => {
        console.log("✅ WhatsApp connected!", data.phoneNumber);
        setPhoneNumber(data.phoneNumber);
        setStatus("connected");
        setStatusMessage("WhatsApp connected successfully");
        setQRCode(null);
        setIsLoading(false);
        setError(null);

        // Cache in localStorage
        localStorage.setItem("whatsapp_phone", data.phoneNumber);
        localStorage.setItem("whatsapp_status", "connected");
      }
    );

    // Listen for disconnection
    socketInstance.on(
      `disconnected:${CHATBOT_ID}`,
      (data: { reason: string }) => {
        console.log("❌ WhatsApp disconnected:", data.reason);
        setStatus("disconnected");
        setPhoneNumber(null);
        setQRCode(null);
        setIsLoading(false);

        if (data.reason === "logout") {
          setStatusMessage("Logged out. Click reconnect to get new QR code.");
        } else if (data.reason === "reconnection_failed") {
          setStatusMessage("Connection lost. Please reconnect.");
        } else {
          setStatusMessage("Disconnected from WhatsApp");
        }

        // Clear cache
        localStorage.removeItem("whatsapp_phone");
        localStorage.setItem("whatsapp_status", "disconnected");
      }
    );

    // Listen for status updates
    socketInstance.on(
      `status:${CHATBOT_ID}`,
      (data: {
        status: string;
        message?: string;
        percent?: number;
        phoneNumber?: string;
        state?: string;
      }) => {
        console.log("📊 Status update:", data);
        setStatusMessage(data.message || "");

        if (data.status === "authenticating") {
          setStatus("authenticating");
          setStatusMessage("Authenticating...");
        } else if (data.status === "loading") {
          setStatus("loading");
          setStatusMessage(`Loading WhatsApp... ${data.percent || 0}%`);
        } else if (data.status === "qr_generated") {
          setStatus("awaiting_scan");
        } else if (data.status === "connected") {
          setStatus("connected");
        }
      }
    );

    // Handle Socket.IO connection events
    socketInstance.on("connect", () => {
      console.log("🔌 Socket.IO connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected");
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.error("🔌 Socket.IO connection error:", error);
      setError(
        "Failed to connect to WhatsApp server. Please check if the server is running."
      );
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      console.log("🔌 Cleaning up Socket.IO connection");
      socketInstance.disconnect();
    };
  }, []);

  const handleInitialize = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus("initializing");
      setStatusMessage("Initializing WhatsApp connection...");

      console.log("🚀 Initializing WhatsApp client");

      const response = await fetch(`${BASE_URL}/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ chatbotId: CHATBOT_ID }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Init response:", data);

      if (data.status === "connected") {
        setPhoneNumber(data.phoneNumber);
        setStatus("connected");
        setStatusMessage("Already connected!");
        localStorage.setItem("whatsapp_phone", data.phoneNumber);
        localStorage.setItem("whatsapp_status", "connected");
      } else if (data.status === "awaiting_qr" && data.qr) {
        setQRCode(data.qr);
        setStatus("awaiting_scan");
        setStatusMessage("Scan QR code with WhatsApp");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Initialization error:", error);
      setStatus("error");
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initialize. Please try again."
      );
      setStatusMessage("Failed to initialize");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log("🚪 Logging out from WhatsApp");

      const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      setStatus("disconnected");
      setPhoneNumber(null);
      setQRCode(null);
      setStatusMessage("Logged out successfully");

      // Clear cache
      localStorage.removeItem("whatsapp_phone");
      localStorage.setItem("whatsapp_status", "disconnected");

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Logout error:", error);
      setError(error instanceof Error ? error.message : "Failed to logout");
      setIsLoading(false);
    }
  };

  const getStatusChip = () => {
    const chipBase =
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border";

    switch (status) {
      case "connected":
        return (
          <span
            className={cn(
              chipBase,
              "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
            )}
          >
            <Icon icon="lucide:check-circle-2" className="w-4 h-4" />
            Connected
          </span>
        );
      case "awaiting_scan":
        return (
          <span
            className={cn(
              chipBase,
              "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
            )}
          >
            <Icon icon="lucide:smartphone" className="w-4 h-4" />
            Awaiting Scan
          </span>
        );
      case "authenticating":
        return (
          <span
            className={cn(
              chipBase,
              "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
            )}
          >
            <Icon icon="lucide:lock" className="w-4 h-4" />
            Authenticating
          </span>
        );
      case "loading":
        return (
          <span
            className={cn(
              chipBase,
              "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
            )}
          >
            <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
            Loading
          </span>
        );
      case "initializing":
        return (
          <span
            className={cn(
              chipBase,
              "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
            )}
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4 animate-spin" />
            Initializing
          </span>
        );
      case "error":
        return (
          <span
            className={cn(
              chipBase,
              "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            )}
          >
            <Icon icon="lucide:alert-circle" className="w-4 h-4" />
            Error
          </span>
        );
      case "disconnected":
        return (
          <span
            className={cn(
              chipBase,
              "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
            )}
          >
            <Icon icon="lucide:circle-off" className="w-4 h-4" />
            Disconnected
          </span>
        );
      default:
        return (
          <span
            className={cn(
              chipBase,
              "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
            )}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon="logos:whatsapp-icon" className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              WhatsApp Integration
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Connect your WhatsApp account to the chatbot platform
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Instructions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border-t-4 border-t-green-600 border-x border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
                <Icon icon="lucide:info" className="w-5 h-5 text-blue-600" />
                How to Connect
              </h3>
            </div>
            <div className="px-6 pb-6">
              <ol className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <strong>Open WhatsApp</strong> on your phone
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    Tap <strong>Menu</strong> or <strong>Settings</strong> and
                    select <strong>Linked Devices</strong>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    Tap on <strong>Link a Device</strong>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <div>
                    Point your phone camera at the <strong>QR code</strong> on
                    the right
                  </div>
                </li>
              </ol>

              <div className="my-6 h-px bg-zinc-200 dark:bg-zinc-800" />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <Icon
                    icon="lucide:shield-check"
                    className="w-4 h-4 text-blue-600"
                  />
                  <strong className="text-sm text-blue-900 dark:text-blue-100">
                    Privacy & Security
                  </strong>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Your messages are end-to-end encrypted. We never store or read
                  your personal messages.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
                <Icon
                  icon="lucide:lightbulb"
                  className="w-5 h-5 text-yellow-600"
                />
                Tips
              </h3>
            </div>
            <div className="px-6 pb-6">
              <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="w-4 h-4 text-zinc-400"
                  />
                  <span>QR code refreshes automatically every 30 seconds</span>
                </li>
                <li className="flex gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="w-4 h-4 text-zinc-400"
                  />
                  <span>Keep your phone connected to the internet</span>
                </li>
                <li className="flex gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="w-4 h-4 text-zinc-400"
                  />
                  <span>
                    You can disconnect anytime from your phone&apos;s linked
                    devices
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col">
            <div className="px-6 pt-6 pb-4 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                  Connection Status
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Scan the QR code to connect
                </p>
              </div>
              {getStatusChip()}
            </div>
            <div className="px-6 py-8 flex flex-col items-center justify-center flex-grow min-h-[500px]">
              {isLoading && (
                <div className="text-center">
                  <Icon
                    icon="lucide:loader-2"
                    className="animate-spin h-12 w-12 text-green-600 mb-4 mx-auto"
                  />
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {statusMessage || "Initializing connection..."}
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center max-w-md">
                  <Icon
                    icon="lucide:alert-circle"
                    className="w-16 h-16 text-red-500 mb-4 mx-auto"
                  />
                  <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                  <button
                    onClick={handleInitialize}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
                    Retry Connection
                  </button>
                </div>
              )}

              {status === "disconnected" && !isLoading && !error && !qrCode && (
                <div className="text-center max-w-md">
                  <Icon
                    icon="lucide:smartphone-nfc"
                    className="w-16 h-16 text-zinc-400 mb-4 mx-auto"
                  />
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    WhatsApp Not Connected
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {statusMessage ||
                      "Click the button below to connect your WhatsApp account"}
                  </p>
                  <button
                    onClick={handleInitialize}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg shadow-green-600/20"
                  >
                    <Icon icon="lucide:qr-code" className="w-5 h-5" />
                    Connect WhatsApp
                  </button>
                </div>
              )}

              {qrCode && !isLoading && !error && (
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 inline-block border border-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="max-w-xs w-full"
                    />
                  </div>
                  <p className="text-zinc-900 dark:text-white font-semibold mb-2">
                    Scan this QR code with WhatsApp
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {statusMessage ||
                      "Open WhatsApp → Linked Devices → Link a Device"}
                  </p>
                  <button
                    onClick={handleInitialize}
                    className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                  >
                    <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
                    Refresh QR Code
                  </button>
                </div>
              )}

              {phoneNumber && !isLoading && !error && !qrCode && (
                <div className="text-center max-w-md">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Icon
                      icon="lucide:check-circle-2"
                      className="w-12 h-12 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    Successfully Connected!
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    Your WhatsApp account is now linked to the chatbot platform
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg mb-8 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm text-zinc-500 mb-1">
                      Connected Number
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white font-mono">
                      {phoneNumber}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium">
                      <Icon icon="lucide:message-circle" className="w-4 h-4" />
                      Chatbot Active
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                    >
                      <Icon icon="lucide:log-out" className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                  {statusMessage && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-6">
                      {statusMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
