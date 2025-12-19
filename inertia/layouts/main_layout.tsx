import { Link, router, usePage } from '@inertiajs/react'
import { LogOut } from 'lucide-react'
import React, { ReactNode } from 'react'
import Footer from '~/components/footer'
import Logo from '~/components/logo'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'

interface menuItem {
  label: string
  href: string
  route: string
}

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { user, menuItems: shareMenuItems } = usePage().props as any

  const menuItems = (shareMenuItems as menuItem[]) ?? []

  const handleLogout = () => {
    router.delete('/auth/logout', {
      onSuccess: () => router.visit('/auth/login')
    })
  }

  return (
    <div className="w-full h-screen">
      <main className="w-full h-full">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center justify-between gap-8">
              <Link href="/" className="flex items-center space-x-2">
                <Logo />
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link href="/jobs" className="text-green-600 border-b-2 border-green-600 pb-1">
                  Trouver un job
                </Link>
                {/* <Link href="/abou" className="hover:text-gray-900">
                  Contact
                </Link>
                <Link href="/about" className="hover:text-gray-900">
                  À propos
                </Link> */}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="w-10 h-10 bg-green-600">
                      <AvatarFallback className="bg-linear-to-br from-orange-400 to-pink-500 text-white text-xs">
                        {user.firstname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 p-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 bg-green-600">
                        <AvatarFallback className="bg-linear-to-br from-orange-400 to-pink-500 text-white">
                          {user.firstname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstname}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          En ligne
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      {menuItems.map((item) => (
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <Separator />
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {children}
        <Footer />
      </main>
    </div>
  )
}

export default MainLayout
