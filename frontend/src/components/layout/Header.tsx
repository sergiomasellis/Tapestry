"use client";

import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Menu, CalendarDays, ListTodo, Trophy, Shield, LogIn, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 touch-manipulation">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0" aria-label="Tapestry Home">
          <Image
            src="/logo.png"
            alt="Tapestry"
            width={60}
            height={60}
            className="dark:invert"
          />
          {/* <span className="font-semibold tracking-tight">Tapestry</span> */}
        </Link>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <nav className="hidden md:block" role="navigation" aria-label="Primary">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 rounded-md hover:bg-accent focus:bg-accent outline-none">
                  <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
                    <span className="sr-only">Dashboard</span>
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <span aria-hidden="true">Dashboard</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 rounded-md hover:bg-accent focus:bg-accent outline-none">
                  <Link href="/leaderboard" className="flex items-center gap-2" prefetch={false}>
                    <span className="sr-only">Leaderboard</span>
                    <Trophy className="size-4" aria-hidden="true" />
                    <span aria-hidden="true">Leaderboard</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ListTodo className="size-4" />
                    <span>Chores</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[360px] gap-1 p-2 sm:w-[420px]">
                    <Link href="/dashboard#chores" className="rounded-sm px-2 py-2 hover:bg-accent focus:bg-accent outline-none">
                      View weekly chores
                    </Link>
                    <Link href="/chores/new" className="rounded-sm px-2 py-2 hover:bg-accent focus:bg-accent outline-none">
                      Create chore
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className="px-3 py-2 rounded-md hover:bg-accent focus:bg-accent outline-none">
                  <Link href="/admin" className="flex items-center gap-2" prefetch={false}>
                    <span className="sr-only">Admin</span>
                    <Shield className="size-4" aria-hidden="true" />
                    <span aria-hidden="true">Admin</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" asChild className="touch-manipulation">
              <Link href="/menu" aria-label="Open Menu">
                <Menu className="size-5" />
              </Link>
            </Button>
          </div>

          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/auth/login">
              <LogIn className="mr-2 size-4" />
              Log in
            </Link>
          </Button>

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/auth/signup">
              <UserPlus className="mr-2 size-4" />
              Sign up
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-manipulation">
                <Avatar className="size-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/family">Family</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/logout">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;