import React, { useState } from "react";
import { User } from "../types";
import { SignOutIcon, UserCircleIcon } from "./icons";
import ThemeToggle from "./ThemeToggle";
import Modal from "./Modal";

interface NavItem {
  name: string;
  icon: React.FC<{ className?: string }>;
  hasNotification?: boolean;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  navItems: NavItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  profileContent?:
    | React.ReactNode
    | ((closeModal: () => void) => React.ReactNode);
}

const getRoleBadge = (role: string) => {
  const base =
    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border";
  switch (role) {
    case "ADMIN":
      return `${base} bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800`;
    case "TEACHER":
      return `${base} bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800`;
    case "PARENT":
      return `${base} bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-200`;
  }
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  navItems,
  activeTab,
  setActiveTab,
  children,
  profileContent,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const NavContent: React.FC<{ isMobile?: boolean }> = ({
    isMobile = false,
  }) => (
    <nav
      className={
        isMobile
          ? "flex justify-around w-full items-center"
          : "flex flex-col space-y-3"
      }
    >
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => setActiveTab(item.name)}
          className={`
            group relative flex items-center rounded-xl transition-all duration-300 ease-out
            ${
              activeTab === item.name
                ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50 dark:bg-slate-700 dark:text-white dark:shadow-slate-900/50 scale-105 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200"
            }
            ${isMobile ? "flex-col p-2 text-[10px]" : "p-3 space-x-4 text-sm"}
          `}
        >
          <div
            className={`relative transition-transform duration-300 ${
              activeTab === item.name ? "scale-110" : "group-hover:scale-110"
            }`}
          >
            <item.icon className={isMobile ? "w-6 h-6 mb-1" : "w-6 h-6"} />
            {item.hasNotification && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white dark:border-slate-800"></span>
              </span>
            )}
          </div>
          <span className={isMobile ? "" : "font-medium"}>{item.name}</span>

          {/* Active Indicator for Desktop */}
          {!isMobile && activeTab === item.name && (
            <div className="absolute right-0 h-6 w-1 bg-rose-500 rounded-l-full"></div>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen max-w-[1920px] mx-auto">
      {/* Sidebar for Desktop (Floating Glass Dock) */}
      <aside className="hidden md:flex flex-col w-72 p-6 fixed h-full z-20">
        <div className="h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col">
          <div className="p-6 flex items-center space-x-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center text-xl">
              🧸
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              TinyToddlers
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            <NavContent />
          </div>

          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div
              className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-3 flex items-center space-x-3 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsProfileOpen(true)}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name.split(" ")[0]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 py-4 sm:px-8 sm:py-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 dark:border-slate-700/30 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                Good{" "}
                {new Date().getHours() < 12
                  ? "Morning"
                  : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
                , {user.name.split(" ")[0]}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isActive ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></span>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {user.role} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setIsProfileOpen(true)}
                className="md:hidden w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
              >
                <UserCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-8 pb-24 md:pb-8 animate-enter">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-40">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 p-2">
          <NavContent isMobile />
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="My Profile"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-3xl flex items-center space-x-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-200/50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-2xl rotate-3 flex items-center justify-center text-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none z-10">
              {user.name.charAt(0)}
            </div>
            <div className="z-10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {user.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {user.email}
              </p>
              <span className={getRoleBadge(user.role)}>{user.role}</span>
            </div>
          </div>

          {/* Specific Content */}
          {profileContent && (
            <div className="animate-enter">
              {typeof profileContent === "function"
                ? profileContent(() => setIsProfileOpen(false))
                : profileContent}
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={onLogout}
              className="w-full btn-3d bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-b-4 border-slate-200 hover:border-rose-200 active:border-b-0 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-900 dark:hover:bg-rose-900/30 dark:hover:border-rose-900/50 rounded-xl py-3 font-bold flex items-center justify-center gap-2"
            >
              <SignOutIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
