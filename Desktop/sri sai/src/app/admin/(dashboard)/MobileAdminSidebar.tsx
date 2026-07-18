"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Layers, ShoppingBag, MessageSquare, LogOut, Star, Flame, Image as ImageIcon, Award } from "lucide-react"

export default function MobileAdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/categories", icon: Layers, label: "Categories" },
    { href: "/admin/products", icon: ShoppingBag, label: "Products" },
    { href: "/admin/featured", icon: Star, label: "Featured Arrivals" },
    { href: "/admin/bestsellers", icon: Flame, label: "Best Sellers" },
    { href: "/admin/hero", icon: ImageIcon, label: "Hero Carousel" },
    { href: "/admin/brands", icon: Award, label: "Brands" },
    { href: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <span className="font-bold text-xl text-primary">Sri Sai Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Link 
            href="/api/auth/signout" 
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
