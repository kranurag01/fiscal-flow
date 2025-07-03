'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { Header } from './header';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Coins, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
             <Coins className="h-8 w-8 text-primary" />
             <h1 className="text-xl font-bold text-primary">Fiscal Flow</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav pathname={pathname} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <div className="flex-1 overflow-y-auto">{children}</div>
        <Button
          asChild
          size="icon"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50 md:left-[calc(var(--sidebar-width-icon)_+1.5rem)] group-data-[state=expanded]/sidebar-wrapper:md:left-[calc(var(--sidebar-width)_+1.5rem)] transition-[left] duration-200 ease-linear"
        >
          <Link href="/transactions?action=add">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Transaction</span>
          </Link>
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
