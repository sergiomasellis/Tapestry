"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
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
import { Menu, CalendarDays, ListTodo, Trophy, Shield, LogIn, UserPlus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 touch-manipulation">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0" aria-label="Tapestry Home">
          <Image
            src="/logo.png"
            alt="Tapestry"
            width={60}
            height={60}
            className="dark:invert"
          />
        </Link>

        {isAuthenticated && (
          <>
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
                    <NavigationMenuLink asChild className="px-3 py-2 rounded-md hover:bg-accent focus:bg-accent outline-none">
                      <Link href="/chores" className="flex items-center gap-2" prefetch={false}>
                        <span className="sr-only">Chores</span>
                        <ListTodo className="size-4" aria-hidden="true" />
                        <span aria-hidden="true">Chores</span>
                      </Link>
                    </NavigationMenuLink>
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
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="flex md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="touch-manipulation" aria-label="Open Menu">
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 sm:w-80">
                    <SheetHeader>
                      <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2 mt-6" role="navigation" aria-label="Mobile Navigation">
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <CalendarDays className="size-5" />
                          <span>Dashboard</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/leaderboard"
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <Trophy className="size-5" />
                          <span>Leaderboard</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/chores"
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <ListTodo className="size-5" />
                          <span>Chores</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <Shield className="size-5" />
                          <span>Admin</span>
                        </Link>
                      </SheetClose>
                      <Separator className="my-2" />
                      <SheetClose asChild>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors text-left w-full"
                        >
                          <LogOut className="size-5" />
                          <span>Logout</span>
                        </button>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="touch-manipulation">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.profile_image_url || undefined} alt={user?.name || "User"} />
                      <AvatarFallback>
                        {user ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      {user?.email && (
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/leaderboard">Leaderboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ThemeToggle />
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;