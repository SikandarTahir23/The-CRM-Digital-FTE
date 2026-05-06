'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Mail,
  MessageSquare,
  Monitor,
  Cloud,
  ArrowLeftRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import './globals.css';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Web Form', href: '/webform', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const channels = [
  { name: 'Email', icon: Mail, status: 'active' },
  { name: 'WhatsApp', icon: MessageSquare, status: 'active' },
  { name: 'Web Form', icon: Monitor, status: 'active' },
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Bloomberg/Vercel style: dark, dense, precise */}
      <motion.aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#070c14] border-r border-[#0f1929] transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo — gradient icon + "CloudManage" with "FTE" in cyan */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#0f1929]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Cloud className="h-7 w-7 text-[#22d3ee] transition-transform duration-200 group-hover:scale-110" />
                <div className="absolute inset-0 h-7 w-7 bg-[#22d3ee]/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-text-primary tracking-tight">CloudManage</span>
                <span className="text-lg font-bold text-[#22d3ee] tracking-tight ml-0.5">FTE</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation — staggered mount, left border accent when active */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Main Menu
              </h3>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } }
                }}
              >
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
                  return (
                    <NavItem key={item.name} item={item} isActive={isActive} />
                  );
                })}
              </motion.div>
            </div>

            <div>
              <h3 className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Channels
              </h3>
              <div className="space-y-0.5">
                {channels.map((item, idx) => (
                  <ChannelItem key={item.name} item={item} delay={idx * 0.05} />
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom section — landing link + dark mode toggle */}
          <div className="p-3 border-t border-[#0f1929] space-y-2">
            {/* Back to landing */}
            <Link href="/">
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-[#111827] hover:text-[#22d3ee] transition-all cursor-pointer"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="text-sm font-medium">Landing Page</span>
              </motion.div>
            </Link>

            {/* Dark mode toggle — smooth icon swap */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg bg-[#0d1117] border border-[#1e2d3d] text-text-muted hover:text-text-primary hover:border-[#22d3ee]/30 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={darkMode ? 'dark' : 'light'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span className="text-sm font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span className="text-sm font-medium">Dark Mode</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top bar — glassmorphism, subtle */}
        <header className="flex items-center justify-between h-16 px-6 bg-[#070c14]/80 backdrop-blur-xl border-b border-[#0f1929] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="text-sm text-text-muted">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page content — fade in on mount */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, isActive }: { item: typeof navigation[0]; isActive: boolean }) {
  return (
    <Link href={item.href}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={clsx(
          'flex items-center px-3 py-2.5 rounded-lg transition-all cursor-pointer mb-0.5 relative',
          isActive
            ? 'bg-[#22d3ee]/10 text-[#22d3ee]'
            : 'text-slate-500 hover:bg-[#111827] hover:text-text-primary'
        )}
      >
        {/* Left border accent — 3px solid cyan when active */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#22d3ee] rounded-r-full" />
        )}
        <item.icon className={clsx('h-4 w-4 mr-3', isActive && 'text-[#22d3ee]')} />
        <span className={clsx('text-sm font-medium', isActive && 'text-[#22d3ee]')}>{item.name}</span>
      </motion.div>
    </Link>
  );
}

function ChannelItem({ item, delay }: { item: typeof channels[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ x: 4 }}
      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-500 hover:bg-[#111827] hover:text-text-primary transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <item.icon className="h-4 w-4" />
        <span className="text-sm font-medium">{item.name}</span>
      </div>
      {/* Pulsing green dot — channel status */}
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
        </span>
      </span>
    </motion.div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">{children}</body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased bg-surface text-text-primary">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
