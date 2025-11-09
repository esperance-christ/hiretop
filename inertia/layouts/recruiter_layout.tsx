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
} from '~/components/ui/sidebar'

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    data-active={currentUrl === item.href ? 'true' : 'false'}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 h-16 border-b bg-white">
          <h1 className="text-lg font-medium">Tableau de Bord</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user?.firstname} {user?.lastname}
            </span>
            <Avatar>
              <AvatarFallback>{user?.firstname?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
