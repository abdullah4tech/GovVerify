"use client";

import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HomeIcon,
  CloudArrowUpIcon,
  UsersIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/upload", label: "Upload", icon: CloudArrowUpIcon },
    { href: "/users", label: "Users", icon: UsersIcon },
    {
      href: "/whatsapp",
      label: "WhatsApp",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      href: "/escalation",
      label: "Escalation",
      icon: ExclamationTriangleIcon,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen fixed left-0 top-0 flex flex-col p-4 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
          <BuildingLibraryIcon className="w-8 h-8 text-blue-600" />
          <span>GovVerify</span>
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-500">
          GovVerify Admin Portal
          <br />
          v1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
