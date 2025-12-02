"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
} from "@heroui/react";

const API_KEY =
  "b5a5a2b9aadef40dec688ed92b1464e59719deb13b6d7425820b30c16d21392d";
const BASE_URL = "https://whatsapp-server-integration-e9lu.onrender.com";
const CHATBOT_ID = "cmiounofx0003jj043l87laro";

export default function WhatsAppIntegration() {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.IO
    const socketInstance = io(BASE_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    // Listen for QR code
    socketInstance.on(`qr:${CHATBOT_ID}`, (base64: string) => {
      console.log("QR code received");
      setQRCode(base64);
      setStatus("ready");
      setIsLoading(false);
      setError(null);
    });

    // Listen for connection
    socketInstance.on(
      `connected:${CHATBOT_ID}`,
      ({ phoneNumber }: { phoneNumber: string }) => {
        console.log("Connected:", phoneNumber);
        setPhoneNumber(phoneNumber);
        setStatus("connected");
        setQRCode(null);
        setIsLoading(false);
        setError(null);
      }
    );

    // Handle errors
    socketInstance.on("connect_error", (error: Error) => {
      console.error("Connection error:", error);
      setStatus("error");
      setError("Connection error. Please refresh the page.");
      setIsLoading(false);
    });

    // Initialize WhatsApp client
    const initializeWhatsApp = async () => {
      try {
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

        if (data.status === "connected") {
          setPhoneNumber(data.phoneNumber);
          setStatus("connected");
          setIsLoading(false);
        } else if (data.status === "awaiting_qr" && data.qr) {
          setQRCode(data.qr);
          setStatus("ready");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setStatus("error");
        setError("Failed to initialize. Please refresh the page.");
        setIsLoading(false);
      }
    };

    initializeWhatsApp();

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const getStatusChip = () => {
    switch (status) {
      case "connected":
        return (
          <Chip color="success" variant="flat" size="lg">
            Connected
          </Chip>
        );
      case "ready":
        return (
          <Chip color="warning" variant="flat" size="lg">
            Awaiting Scan
          </Chip>
        );
      case "error":
        return (
          <Chip color="danger" variant="flat" size="lg">
            Error
          </Chip>
        );
      default:
        return (
          <Chip color="default" variant="flat" size="lg">
            Initializing
          </Chip>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-icons-outlined text-green-600 text-4xl">
            whatsapp
          </span>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              WhatsApp Integration
            </h1>
            <p className="text-zinc-500 mt-1">
              Connect your WhatsApp account to the chatbot platform
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Instructions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-green-600">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-outlined text-blue-600">
                  info
                </span>
                How to Connect
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-6">
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

              <Divider className="my-6" />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <span className="material-icons-outlined text-blue-600 text-sm">
                    security
                  </span>
                  <strong className="text-sm text-blue-900 dark:text-blue-100">
                    Privacy & Security
                  </strong>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Your messages are end-to-end encrypted. We never store or
                  read your personal messages.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-outlined text-yellow-600">
                  lightbulb
                </span>
                Tips
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-6">
              <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex gap-2">
                  <span className="material-icons-outlined text-xs text-zinc-400">
                    check_circle
                  </span>
                  <span>QR code refreshes automatically every 30 seconds</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-icons-outlined text-xs text-zinc-400">
                    check_circle
                  </span>
                  <span>Keep your phone connected to the internet</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-icons-outlined text-xs text-zinc-400">
                    check_circle
                  </span>
                  <span>
                    You can disconnect anytime from your phone&apos;s linked
                    devices
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: QR Code */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-0 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                  Connection Status
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Scan the QR code to connect
                </p>
              </div>
              {getStatusChip()}
            </CardHeader>
            <CardBody className="px-6 py-8 flex flex-col items-center justify-center min-h-[500px]">
              {isLoading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Initializing connection...
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center max-w-md">
                  <span className="material-icons-outlined text-6xl text-red-500 mb-4">
                    error_outline
                  </span>
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    {error}
                  </p>
                  <Button
                    color="primary"
                    onClick={handleRefresh}
                    startContent={
                      <span className="material-icons-outlined">refresh</span>
                    }
                  >
                    Refresh Page
                  </Button>
                </div>
              )}

              {qrCode && !isLoading && !error && (
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="max-w-xs w-full"
                    />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                    Scan this QR code with WhatsApp
                  </p>
                  <p className="text-sm text-zinc-500">
                    The QR code will refresh automatically if not scanned
                  </p>
                  <Button
                    variant="light"
                    color="primary"
                    onClick={handleRefresh}
                    className="mt-4"
                    startContent={
                      <span className="material-icons-outlined">refresh</span>
                    }
                  >
                    Refresh QR Code
                  </Button>
                </div>
              )}

              {phoneNumber && !isLoading && !error && (
                <div className="text-center max-w-md">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons-outlined text-5xl text-green-600 dark:text-green-400">
                      check_circle
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    Successfully Connected!
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    Your WhatsApp account is now linked to the chatbot platform
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-zinc-500 mb-1">
                      Connected Number
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white font-mono">
                      {phoneNumber}
                    </p>
                  </div>
                  <Button
                    color="success"
                    variant="flat"
                    startContent={
                      <span className="material-icons-outlined">chat</span>
                    }
                  >
                    Start Using Chatbot
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
