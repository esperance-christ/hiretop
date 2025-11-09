import { Link } from '@inertiajs/react'
import React from 'react'
import Logo from './logo'

const Footer = () => {
  return (
    <footer className="bg-slate-800 mt-12 px-16 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Link href="/">
            <Logo />
          </Link>{' '}
          <p className="mt-4 text-sm text-gray-50">
            Reliez-vous aux bons talents et construisez votre équipe idéale.
          </p>
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold">Ressources</h4>
          <Link href="#" className="text-sm mt-1">
            FAQ
          </Link>
          <Link href="#" className="text-sm mt-1">
            Support
          </Link>
          <Link href="#" className="text-sm mt-1">
            Privacy
          </Link>
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold">Contact</h4>
          <a className="text-sm mt-2">hello@hiretop.example</a>
          <a className="text-sm mt-1">XX XXXXX XXXX</a>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-50 flex justify-between">
          <div>©{new Date().getFullYear()} hireTop. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
