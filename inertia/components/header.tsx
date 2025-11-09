import React from 'react'
import { Separator } from './ui/separator'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Link, router, usePage } from '@inertiajs/react'
import Logo from './logo'
import { LogOut } from 'lucide-react'

const Header = () => {
  const { auth } = usePage().props as any
  const user = auth

  const handleLogout = () => {
    router.delete('/auth/logout')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-gray-900">
              Contact
            </Link>
            <Link href="/about" className="hover:text-gray-900">
              À propos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-linear-to-br from-orange-400 to-pink-500 text-white text-xs">
                    {user.firstname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <Avatar>
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
  )
}

export default Header
