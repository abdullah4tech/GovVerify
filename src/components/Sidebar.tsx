"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
    { href: "/upload", label: "Upload", icon: "lucide:cloud-upload" },
    {
      href: "/whatsapp",
      label: "WhatsApp",
      icon: "logos:whatsapp-icon",
    },
    {
      href: "/escalation",
      label: "Escalation",
      icon: "lucide:alert-triangle",
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-sm transition-all duration-300">
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon icon="lucide:landmark" className="w-6 h-6 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            GovVerify
          </span>
        </h1>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 hover:translate-x-1"
              )}
            >
              <Icon
                icon={link.icon}
                className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-white"
                    : "text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-zinc-100 dark:border-zinc-900">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon
                icon="lucide:shield-check"
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Admin Portal
              </p>
              <p className="text-[10px] text-zinc-500">v1.0.0 Stable</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Secure government document verification system.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
