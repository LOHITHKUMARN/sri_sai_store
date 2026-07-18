"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, ArrowUp, ArrowDown, Loader2, ImageIcon, Check } from "lucide-react"
import { uploadBrandLogo, deleteBrandLogo, reorderBrandLogos, updateBrandLogoSize } from "./actions"
import { BrandLogo } from "@prisma/client"

export default function BrandClient({ initialLogos }: { initialLogos: BrandLogo[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("store") === "Furniture" ? "Furniture" : "Appliances"

  const [logos, setLogos] = useState(initialLogos)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [brandName, setBrandName] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeLogos = useMemo(() => 
    logos.filter(logo => logo.store === activeTab).sort((a, b) => a.order - b.order),
  [logos, activeTab])

  const handleTabChange = (tab: string) => {
    router.push(`?store=${tab}`)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    
    try {
      await uploadBrandLogo(activeTab, brandName.trim(), formData)
      setBrandName("") // reset
      router.refresh()
      setTimeout(() => setIsUploading(false), 1000)
    } catch (error) {
      console.error(error)
      alert("Failed to upload brand logo")
      setIsUploading(false)
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand logo?")) return
    setDeletingId(id)
    try {
      await deleteBrandLogo(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete logo")
    }
    setDeletingId(null)
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === activeLogos.length - 1) return

    const newActiveLogos = [...activeLogos]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newActiveLogos[index]
    newActiveLogos[index] = newActiveLogos[swapIndex]
    newActiveLogos[swapIndex] = temp
    
    const reordered = newActiveLogos.map((logo, i) => ({ ...logo, order: i }))
    const newGlobalLogos = logos.map(logo => {
       if (logo.store !== activeTab) return logo
       const match = reordered.find(r => r.id === logo.id)
       return match ? match : logo
    })
    setLogos(newGlobalLogos)

    try {
      await reorderBrandLogos(reordered.map(logo => ({ id: logo.id, order: logo.order })))
    } catch (error) {
      console.error(error)
      alert("Failed to reorder logos")
      router.refresh()
    }
  }

  const handleSizeChange = async (id: string, newSize: string) => {
    setUpdatingId(id)
    try {
      await updateBrandLogoSize(id, newSize)
      const newGlobalLogos = logos.map(l => l.id === id ? { ...l, size: newSize } : l)
      setLogos(newGlobalLogos)
      setSuccessId(id)
      setTimeout(() => setSuccessId(null), 2000)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to update size")
    }
    setUpdatingId(null)
  }

  // Update state when server sends new initialLogos props
  useMemo(() => {
    setLogos(initialLogos)
  }, [initialLogos])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Authorised Brands</h1>
          <p className="text-gray-500">Manage the brand logos displayed in the "Leading Brands" section.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
        <button
          onClick={() => handleTabChange("Appliances")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "Appliances" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          }`}
        >
          Appliances
        </button>
        <button
          onClick={() => handleTabChange("Furniture")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "Furniture" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          }`}
        >
          Furniture
        </button>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="mb-6 border-b pb-6">
           <h3 className="text-lg font-medium mb-2">Add New Brand Logo</h3>
           <p className="text-sm text-gray-500 mb-4">
             Upload a tightly-cropped logo (transparent background, minimal padding) for best results — recommended height ~100–200px.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-3">
             <Input 
               placeholder="Brand Name (e.g. Samsung)" 
               value={brandName} 
               onChange={e => setBrandName(e.target.value)}
               className="max-w-xs"
             />
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleUpload}
             />
             <Button 
               onClick={() => {
                 if (!brandName.trim()) {
                   alert("Please enter a brand name first")
                   return
                 }
                 fileInputRef.current?.click()
               }} 
               disabled={isUploading}
             >
               {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
               {isUploading ? "Uploading..." : "Select & Upload Logo"}
             </Button>
           </div>
        </div>
        
        {activeLogos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No logos added</h3>
            <p className="text-sm text-gray-500 mt-1">
              Currently using the fallback placeholder logos on the storefront.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
             <h4 className="text-sm font-medium text-gray-700">Active Brands Sequence ({activeLogos.length})</h4>
             {activeLogos.map((logo, index) => (
                <div key={logo.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm group gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-12 w-20 sm:h-16 sm:w-24 rounded-md overflow-hidden bg-white border relative flex items-center justify-center p-2">
                    <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium">{logo.name}</div>
                    <div className="text-xs text-gray-500 truncate">{logo.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={logo.size}
                        onChange={(e) => handleSizeChange(logo.id, e.target.value)}
                        disabled={updatingId === logo.id}
                        className="text-xs border rounded-md px-2 py-1.5 pr-6 appearance-none bg-white min-w-[90px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="xlarge">Extra Large</option>
                      </select>
                      {updatingId === logo.id ? (
                        <Loader2 className="absolute right-1.5 top-2 h-3 w-3 animate-spin text-gray-400" />
                      ) : successId === logo.id ? (
                        <Check className="absolute right-1.5 top-2 h-3 w-3 text-green-500" />
                      ) : (
                        <div className="absolute right-1.5 top-2.5 w-2 h-2 border-b border-r border-gray-400 transform rotate-45 pointer-events-none" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === activeLogos.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(logo.id)}
                      disabled={deletingId === logo.id}
                    >
                      {deletingId === logo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}
