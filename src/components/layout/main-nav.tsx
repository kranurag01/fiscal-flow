'use client';

import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Target,
  BarChart3,
  Bot,
  Settings,
  BellRing,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface MainNavProps {
  pathname: string;
}

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/reminders', label: 'Reminders', icon: BellRing },
  { href: '/reports', label: 'Analytics', icon: BarChart3 },
  { href: '/predictions', label: 'Predictions', icon: Bot },
  { href: '/configuration', label: 'Configuration', icon: Settings },
];

export function MainNav({ pathname }: MainNavProps) {
  return (
    <nav className="flex flex-col p-2">
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className="w-full justify-start"
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
