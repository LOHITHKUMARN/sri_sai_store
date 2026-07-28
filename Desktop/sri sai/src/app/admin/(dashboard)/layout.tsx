import { ReactNode } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  MessageSquare, 
  Settings, 
  LogOut,
  Star,
  Flame,
  Image as ImageIcon,
  Award
} from "lucide-react"

import MobileAdminSidebar from "./MobileAdminSidebar"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  
  // Middleware handles auth protection, so we don't need a manual redirect here.

  return (
    <div className="flex min-h-screen w-full bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <span className="font-bold text-xl text-primary">Sri Sai Admin</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <Layers className="h-5 w-5" />
              <span>Categories</span>
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <ShoppingBag className="h-5 w-5" />
              <span>Products</span>
            </Link>
            <Link href="/admin/featured" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <Star className="h-5 w-5" />
              <span>Featured Arrivals</span>
            </Link>
            <Link href="/admin/bestsellers" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <Flame className="h-5 w-5 text-amber-500" />
              <span>Best Sellers</span>
            </Link>
            <Link href="/admin/hero" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <ImageIcon className="h-5 w-5" />
              <span>Hero Carousel</span>
            </Link>
            <Link href="/admin/brands" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <Award className="h-5 w-5" />
              <span>Brands</span>
            </Link>
            <Link href="/admin/enquiries" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <MessageSquare className="h-5 w-5" />
              <span>Enquiries</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-lg">Sri Sai Admin</span>
          <MobileAdminSidebar />
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
