'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/auth';

interface NavbarProps {
  user: User;
}

export function NavbarClient({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='bg-background border-b sticky top-0 z-50'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        {/* Logo */}
        <Link
          href='/dashboard'
          className='flex items-center gap-2 font-semibold text-lg'
          onClick={() => setMobileMenuOpen(false)}
        >
          Sadhna Tracker
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-6'>
          <Link
            href='/dashboard'
            className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
          >
            Dashboard
          </Link>
          <Link
            href='/dashboard/tracker'
            className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
          >
            Tracker
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className='hidden md:flex items-center gap-2'>
          <ModeToggle />
          <UserDropdown user={user} />
        </div>

        {/* Mobile Menu Button */}
        <div className='flex md:hidden items-center gap-2'>
          <ModeToggle />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t'>
          <nav className='flex flex-col px-4 py-2 space-y-1'>
            <Link
              href='/dashboard'
              className='px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors'
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href='/dashboard/tracker'
              className='px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors'
              onClick={() => setMobileMenuOpen(false)}
            >
              Tracker
            </Link>
            <div className='pt-2 border-t mt-2'>
              <div className='px-3 py-2'>
                <UserDropdown user={user} />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
