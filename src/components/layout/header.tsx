'use client';

import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="sm:hidden" />
      <div className="relative ml-auto flex-1 md:grow-0" />
      <UserNav />
    </header>
  );
}
