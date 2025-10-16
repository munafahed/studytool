"use client";

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTimerPage = pathname === '/dashboard/timer';

  if (isTimerPage) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container flex flex-col py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
