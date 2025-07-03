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
import { Coins } from 'lucide-react';

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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
