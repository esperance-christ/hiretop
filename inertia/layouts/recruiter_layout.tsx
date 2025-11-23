import React, { ReactNode } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
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
import { Bell, LogOut } from 'lucide-react'
import Logo from '~/components/logo'

interface menuItem {
  label: string
  href: string
  route: string
}

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const { auth, menuItems: shareMenuItems, currentUrl } = usePage().props as any
  const user = auth

  const menuItems = (shareMenuItems as menuItem[]) ?? []

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

          <SidebarFooter className="p-4 border border-amber-300 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-sm font-semibold">
                  {user?.firstname?.[0]}
                  {user?.lastname?.[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">
                {user?.firstname} {user?.lastname}
              </p>
            </div>
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
