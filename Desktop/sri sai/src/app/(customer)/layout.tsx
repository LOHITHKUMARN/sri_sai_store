"use client"

import { ReactNode } from "react"
import { StoreProvider, useStore } from "@/components/StoreProvider"
import Link from "next/link"
import { MapPin, Phone, Search, Menu, ShoppingCart, ShieldCheck, Truck, Star, Clock } from "lucide-react"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

function Header() {
  const { activeStore, setActiveStore } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isStoryMode, setIsStoryMode] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Hide header when scrolling into the furniture storytelling sequence (approx 60vh to 480vh)
      if (activeStore === 'furniture' && pathname === '/' && window.scrollY > window.innerHeight * 0.6 && window.scrollY < window.innerHeight * 4.8) {
        setIsStoryMode(true)
      } else {
        setIsStoryMode(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeStore, pathname])

  const handleTabClick = (store: "appliances" | "furniture") => {
    setActiveStore(store)
    if (pathname !== "/" && pathname !== `/${store}`) {
      router.push(`/${store}`)
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-700 ${isStoryMode ? 'opacity-0 -translate-y-full pointer-events-none' : 'bg-white shadow-sm opacity-100 translate-y-0'}`}>
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-4 text-sm flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +91 98765 43210</span>
          <a href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" target="_blank" rel="noreferrer" className="hidden md:flex items-center hover:text-white transition"><MapPin className="w-4 h-4 mr-2" /> Our Showroom</a>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin" className="hover:text-blue-300">Staff Login</Link>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Sri Sai Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold tracking-tighter text-blue-900">
            Sri Sai<span className="text-blue-500">.</span>
          </span>
        </Link>
        
        {/* Store Switcher Tabs - Only show on Home Page */}
        {pathname === "/" && (
          <div className="hidden md:flex bg-slate-100 p-1 rounded-full">
            <button 
              onClick={() => handleTabClick("appliances")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeStore === "appliances" ? "bg-white shadow text-blue-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Home Appliances
            </button>
            <button 
              onClick={() => handleTabClick("furniture")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeStore === "furniture" ? "bg-white shadow text-amber-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Furniture
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full"><Search className="w-5 h-5 text-gray-600" /></button>
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-full"><Menu className="w-5 h-5 text-gray-600" /></button>
        </div>
      </div>

      {/* Mobile Store Switcher Tabs - Only show on Home Page */}
      {pathname === "/" && (
        <div className="md:hidden container mx-auto px-4 pb-4">
          <div className="flex w-full bg-slate-100 p-1 rounded-full text-sm">
            <button 
              onClick={() => handleTabClick("appliances")}
              className={`flex-1 py-2 rounded-full font-medium transition-all ${
                activeStore === "appliances" ? "bg-white shadow text-blue-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Appliances
            </button>
            <button 
              onClick={() => handleTabClick("furniture")}
              className={`flex-1 py-2 rounded-full font-medium transition-all ${
                activeStore === "furniture" ? "bg-white shadow text-amber-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Furniture
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

function Footer() {
  const pathname = usePathname();
  const isProductPage = pathname?.includes('/product/');

  return (
    <>
      {!isProductPage && (
        <>
          {/* Delivery & Service Band */}
      <section className="py-12 bg-blue-50 border-y border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-grow">
              {[
                { title: "Home Delivery", subtitle: "All over the city", icon: <Truck className="w-6 h-6 text-blue-600" /> },
                { title: "Home Service", subtitle: "Expert repairs", icon: <ShieldCheck className="w-6 h-6 text-blue-600" /> },
                { title: "Fast Slots", subtitle: "Same or next day", icon: <Star className="w-6 h-6 text-blue-600" /> },
                { title: "Free Installation", subtitle: "Included on major items", icon: <MapPin className="w-6 h-6 text-blue-600" /> }
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-blue-50/50">
                  <div className="p-3 bg-blue-50 rounded-xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-500">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                Check coverage
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><ShieldCheck className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900">Brand Warranty</h3>
            <p className="text-sm text-gray-500">Official warranty on all products</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><Truck className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Safe and quick delivery to your home</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><MapPin className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900">In-Store Experience</h3>
            <p className="text-sm text-gray-500">Visit us to see products in person</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-50 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Visit Our Showroom</h2>
            <div className="w-12 h-1 bg-blue-600 mx-auto md:mx-0 mt-2 rounded-full"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-5xl mx-auto">
            {/* Left Info Panel */}
            <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight">Sri Sai Home</h3>
                    <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Main Location</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5 border border-gray-100 flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Address</p>
                    <p className="text-sm leading-relaxed text-gray-600">RAILWAY LAYOUT, Kumbarakoppal<br/>Gokulam, Mysuru, KA 570016</p>
                  </div>
                  </div>
                  
                  <div className="flex items-start gap-4 text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5 border border-gray-100 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Store Hours</p>
                      <p className="text-sm text-gray-600">Mon-Sun, 10:00 AM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="aspect-[32/9] w-full rounded-2xl overflow-hidden mb-4 relative border border-gray-200">
                  <img src="/images/srisai.png" alt="Sri Sai Storefront" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 ring-1 ring-inset ring-black/10"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition shadow-md hover:shadow-lg active:translate-y-0">
                    Directions
                  </a>
                  <a href="tel:+919876543210" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" /> Call
                  </a>
                </div>
              </div>
            </div>

            {/* Right Map Panel - Static & Clickable */}
            <a 
              href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" 
              target="_blank" 
              rel="noreferrer"
              className="lg:w-2/3 h-[250px] sm:h-[300px] lg:h-auto relative bg-gray-200 border-t lg:border-t-0 lg:border-l border-gray-100 block cursor-pointer group overflow-hidden"
            >
              {/* Click Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 duration-200">
                  <MapPin className="w-4 h-4 text-blue-600" /> Open in Google Maps
                </div>
              </div>

              <iframe 
                src="https://maps.google.com/maps?q=Sri+Sai+Home+Appliances+and+Furniture,+RAILWAY+LAYOUT,+Kumbarakoppal,+Gokulam,+Mysuru,+Karnataka+570016&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                title="Store Location"
                className="absolute inset-0 grayscale-[0.2] contrast-100 pointer-events-none"
              ></iframe>
            </a>
          </div>
        </div>
      </section>

        </>
      )}

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Sri Sai Home Appliances</h3>
            <p className="mb-4">Your one-stop destination for premium home appliances and elegant furniture. Quality guaranteed.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li>
                <a 
                  href={`https://wa.me/919876543210?text=${encodeURIComponent("Hi, I'd like to enquire about a custom furniture order.")}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#25D366] transition-colors flex items-center"
                >
                  Custom Furniture Orders
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Visit Our Store</h3>
            <a href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" target="_blank" rel="noreferrer" className="flex items-center mb-2 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-4 h-4 mr-2" /> Our Showroom
            </a>
            <p className="flex items-center mb-2"><Phone className="w-4 h-4 mr-2" /> +91 98765 43210</p>
            <p className="mt-4 text-sm text-slate-400">Hours: Mon-Sun, 10:00 AM - 9:00 PM</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          &copy; {new Date().getFullYear()} Sri Sai Home Appliances. All rights reserved.
        </div>
      </footer>
    </>
  )
}

import { Tracker } from "@/components/Tracker"
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton"
import { AIChatFloatingButton } from "@/components/AIChatFloatingButton"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Tracker />
      <div className="min-h-screen flex flex-col bg-gray-50 relative">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <AIChatFloatingButton />
        <WhatsAppFloatingButton />
      </div>
    </StoreProvider>
  )
}
