"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useStore } from "@/components/StoreProvider"
import { Search, Filter, X, ArrowLeft, ArrowDownUp } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FurnitureFilterSidebar } from "@/components/FurnitureFilterSidebar"

type Product = { id: string, name: string, inStock: boolean, imageUrls: string[], brand: string, categoryId: string }
type Category = { id: string, name: string }

export default function ListingClient({ 
  products, 
  categories,
  storeType
}: { 
  products: Product[]
  categories: Category[]
  storeType: "appliances" | "furniture"
}) {
  const { setActiveStore } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const categoryParam = searchParams.get("category")
  const roomParam = searchParams.get("room")

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Sync the context with the URL (so if they land directly on /furniture, the header tabs update)
  useEffect(() => {
    setActiveStore(storeType)
  }, [storeType, setActiveStore])

  // Sync selected category from URL
  useEffect(() => {
    if (categoryParam) {
      const cat = categories.find(c => c.name.toLowerCase() === categoryParam.toLowerCase())
      if (cat) {
        setSelectedCategory(cat.id)
      }
    } else {
      setSelectedCategory(null)
    }
  }, [categoryParam, categories])

  // Helper to update URL when category is selected
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId)
      if (cat) {
        params.set("category", cat.name)
      }
    } else {
      params.delete("category")
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("sort", e.target.value)
    } else {
      params.delete("sort")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentSort = searchParams.get("sort") || ""

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("brand", e.target.value)
    } else {
      params.delete("brand")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentBrand = searchParams.get("brand") || ""

  const uniqueBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean)
    return Array.from(new Set(brands)).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesCategory = true
      
      if (selectedCategory) {
        matchesCategory = p.categoryId === selectedCategory
      } else if (roomParam) {
        let roomGroups = []
        if (storeType === "appliances") {
          roomGroups = [
            { name: "Kitchen", items: ["Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers"] },
            { name: "Laundry Room", items: ["Washing Machines"] },
            { name: "Living Room", items: ["Televisions", "Fans", "Coolers", "Air Coolers"] },
            { name: "Bedroom", items: ["Air Conditioners", "Laptops", "Mobiles", "Others"] }
          ]
        } else {
          roomGroups = [
            { name: "Living Room", items: ["Sofas", "Chairs"] },
            { name: "Bedroom", items: ["Beds/Cots", "Wardrobes", "Mattresses"] },
            { name: "Dining Room", items: ["Dining Tables", "Chairs"] },
            { name: "Study/Office", items: ["Chairs"] } // Add more specific ones if needed
          ]
        }
        
        const room = roomGroups.find(g => g.name.toLowerCase() === roomParam.toLowerCase())
        if (room) {
          const categoryForProduct = categories.find(c => c.id === p.categoryId)
          if (categoryForProduct) {
            matchesCategory = room.items.some(itemName => 
              categoryForProduct.name.toLowerCase() === itemName.toLowerCase() || 
              (itemName === "Coolers" && categoryForProduct.name.toLowerCase() === "air coolers") ||
              (itemName === "Beds/Cots" && categoryForProduct.name.toLowerCase().includes("bed")) ||
              (itemName === "Sofas" && categoryForProduct.name.toLowerCase().includes("sofa"))
            )
            
            // If room is Bedroom (Appliances), it should also include unmapped categories as "Others"
            if (!matchesCategory && room.name === "Bedroom" && storeType === "appliances") {
              const allMappedNames = [
                "Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers",
                "Washing Machines", "Televisions", "Fans", "Coolers", "Air Coolers", "Air Conditioners", "Laptops", "Mobiles", "Others"
              ].map(n => n.toLowerCase());
              
              if (!allMappedNames.includes(categoryForProduct.name.toLowerCase())) {
                matchesCategory = true;
              }
            }
          } else {
            matchesCategory = false
          }
        }
      }

      let matchesBrand = true
      if (currentBrand) {
        matchesBrand = p.brand.toLowerCase() === currentBrand.toLowerCase()
      }

      return matchesSearch && matchesCategory && matchesBrand
    })

    if (currentSort === "brand_asc") {
      result = [...result].sort((a, b) => a.brand.localeCompare(b.brand))
    } else if (currentSort === "brand_desc") {
      result = [...result].sort((a, b) => b.brand.localeCompare(a.brand))
    }

    return result
  }, [products, searchQuery, selectedCategory, roomParam, categories, storeType, currentSort, currentBrand])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </div>
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">{storeType}</h1>
          <p className="text-gray-500 mt-1">Showing {filteredProducts.length} products</p>
        </div>
        
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden flex items-center bg-gray-100 px-4 py-2 rounded-md font-medium"
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`
          ${isMobileFiltersOpen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden md:block w-64 flex-shrink-0"}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)}><X className="w-6 h-6" /></button>
          </div>

          {storeType === "furniture" ? (
            <FurnitureFilterSidebar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
            />
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center"><Search className="w-4 h-4 mr-2" /> Search</h3>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                
                <div className="space-y-4">
                  <button 
                    className={`block w-full text-left px-2 py-1.5 rounded text-sm ${selectedCategory === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    onClick={() => handleCategorySelect(null)}
                  >
                    All Categories
                  </button>
                  
                  {[
                    { name: "Kitchen", items: ["Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers"] },
                    { name: "Laundry Room", items: ["Washing Machines"] },
                    { name: "Living Room", items: ["Televisions", "Fans", "Coolers", "Air Coolers"] },
                    { name: "Bedroom", items: ["Air Conditioners", "Laptops", "Mobiles", "Others"] }
                  ].map(group => {
                    const groupCats = group.items
                      .map(itemName => categories.find(c => c.name.toLowerCase() === itemName.toLowerCase() || (itemName === "Coolers" && c.name.toLowerCase() === "air coolers")))
                      .filter(Boolean) as Category[];
                      
                    // Also find any unmapped categories and put them in Bedroom -> Others if we are rendering Bedroom
                    const isBedroom = group.name === "Bedroom";
                    let unmappedCats: Category[] = [];
                    if (isBedroom) {
                      const allMappedNames = [
                        "Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers",
                        "Washing Machines", "Televisions", "Fans", "Coolers", "Air Coolers", "Air Conditioners", "Laptops", "Mobiles", "Others"
                      ].map(n => n.toLowerCase());
                      unmappedCats = categories.filter(c => !allMappedNames.includes(c.name.toLowerCase()));
                    }
                    
                    const combinedCats = [...groupCats, ...unmappedCats];
                    
                    if (combinedCats.length === 0) return null;

                    return (
                      <div key={group.name} className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 pl-2 mt-4">{group.name}</h4>
                        {combinedCats.map(cat => (
                          <button 
                            key={cat.id}
                            className={`block w-full text-left px-2 py-1.5 rounded text-sm flex items-center ${selectedCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                            onClick={() => handleCategorySelect(cat.id)}
                          >
                            <span className="text-gray-400 mr-2 text-lg leading-none">&bull;</span>
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {/* Top Bar for Sorting (Only for Furniture for now, or both) */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500 hidden md:block">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
            </p>
            <div className="flex items-center ml-auto gap-4">
              <div className="flex items-center">
                <label htmlFor="brand-filter" className="text-sm font-medium text-gray-700 mr-3 hidden sm:flex items-center">
                  Brand:
                </label>
                <select 
                  id="brand-filter" 
                  className="border-gray-300 rounded-md text-sm pl-3 pr-8 py-2 focus:ring-blue-500 focus:border-blue-500 border bg-white"
                  value={currentBrand}
                  onChange={handleBrandChange}
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-3 hidden sm:flex items-center">
                  <ArrowDownUp className="w-4 h-4 mr-1.5" /> Sort by:
                </label>
                <select 
                  id="sort" 
                  className="border-gray-300 rounded-md text-sm pl-3 pr-8 py-2 focus:ring-blue-500 focus:border-blue-500 border bg-white"
                  value={currentSort}
                  onChange={handleSortChange}
                >
                  <option value="">Newest Arrivals</option>
                  <option value="brand_asc">Brand (A-Z)</option>
                  <option value="brand_desc">Brand (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
              <p className="text-gray-500">No products found matching your filters.</p>
              <button 
                onClick={() => { setSearchQuery(""); handleCategorySelect(null) }}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block">
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col h-full">
                    <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-4">
                      {product.imageUrls[0] ? (
                        <img src={product.imageUrls[0]} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition duration-300" />
                      ) : (
                        <span className="text-gray-300">No Image</span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">{product.brand}</span>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 flex-grow">{product.name}</h3>
                      <div className="flex items-center justify-between mt-auto pt-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">View</span>
                    </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
