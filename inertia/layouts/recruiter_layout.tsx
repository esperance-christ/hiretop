import React, { ReactNode } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { Bell, LogOut, User } from 'lucide-react'
import Logo from '~/components/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'

interface menuItem {
  label: string
  href: string
  route: string
}

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const { auth, menuItems: shareMenuItems, currentUrl } = usePage().props as any
  const user = auth

  const menuItems = (shareMenuItems as menuItem[]) ?? []

  const handleLogout = () => {
    router.delete('/auth/logout', {
      onSuccess: () => router.visit('/auth/login'),
    })
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <div className="fixed -z-10 bg-green-700 w-full h-[200px]"></div>
        <Sidebar className="bg-white p-2">
          <SidebarHeader className="bg-white">
            <div className="">
              <a href="/">
                <Logo className="text-black" />
              </a>
              <span className="w-4 text-xs text-gray-500">Connect Talent & Companies</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="mt-8 bg-white">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={`border-b border-gray-100 py-2 justify-start hover:text-white hover:bg-emerald-800 data-[active=true]:bg-emerald-500 data-[active=true]:text-white transition-all ${
                      currentUrl === item.href ? 'bg-emerald-500' : ''
                    }`}
                  >
                    <Link href={item.href}>
                      {/* {item.icon} */}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t bg-green-600 rounded-xl border-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded-lg hover:bg-emerald-700/60 transition-colors focus:outline-none">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-white/30">
                    <AvatarImage src={user?.profile} />
                    <AvatarFallback className="bg-white text-emerald-700 font-bold text-sm">
                      {user?.firstname?.[0]}
                      {user?.lastname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white leading-none">
                      {user?.firstname} {user?.lastname}
                    </p>
                    <p className="text-xs text-emerald-100 mt-0.5">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/recruiter/configuration"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
            <SidebarTrigger />
            <h1 className="font-semibold">Hiretop</h1>
            <Bell className="h-5 w-5 text-gray-600" />
          </header>

          <main className="flex-1 p-6 lg:p-8">{children}</main>

          <footer className="border-t bg-white py-4 px-6 text-center text-xs text-gray-500">
            © 2025 Hiretop — Tous droits réservés.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
