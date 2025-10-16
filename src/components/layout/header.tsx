"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../theme-toggle';
import { useUser } from '../../firebase.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, User } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const StudyMuneLogo = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 3C10.48 3 6 7.48 6 13C6 17.05 8.44 20.4 12 21.95V24H9V26H15V21.95C18.56 20.4 21 17.05 21 13C21 7.48 16.52 3 16 3ZM16 5C15.45 5 15 5.45 15 6C15 6.55 15.45 7 16 7C16.55 7 17 6.55 17 6C17 5.45 16.55 5 16 5ZM13.5 8C13.22 8 13 8.22 13 8.5C13 8.78 13.22 9 13.5 9H18.5C18.78 9 19 8.78 19 8.5C19 8.22 18.78 8 18.5 8H13.5Z"
        fill="currentColor"
      />
      <path
        d="M12 28H20C21.1 28 22 27.1 22 26V24H10V26C10 27.1 10.9 28 12 28Z"
        fill="currentColor"
      />
    </svg>
  );

  const UserNav = () => {
    const { user, isLoading } = useUser();
    
    if (isLoading) {
        return null;
    }

    if (!user) {
        return (
            <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </>
        )
    }

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <StudyMuneLogo />
            <span className="font-bold text-lg font-headline">StudyMune</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary text-primary/80 font-semibold">Home</Link>
            <Link href="/dashboard/document-tools" className="transition-colors hover:text-primary text-foreground/60">Tools</Link>
            <Link href="#" className="transition-colors hover:text-primary text-foreground/60">Pricing</Link>
            <Link href="#" className="transition-colors hover:text-primary text-foreground/60">About</Link>
        </nav>
        <div className="flex items-center justify-end space-x-2">
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
