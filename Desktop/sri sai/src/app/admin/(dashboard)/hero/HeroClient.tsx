"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UploadCloud, Trash2, ArrowUp, ArrowDown, Loader2, Image as ImageIcon } from "lucide-react"
import { uploadHeroImage, deleteHeroImage, reorderHeroImages } from "./actions"
import { HeroImage } from "@prisma/client"

export default function HeroClient({ initialImages }: { initialImages: HeroImage[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("store") === "Furniture" ? "Furniture" : "Appliances"

  const [images, setImages] = useState(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeImages = useMemo(() => 
    images.filter(img => img.store === activeTab).sort((a, b) => a.order - b.order),
  [images, activeTab])

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
      await uploadHeroImage(activeTab, formData)
      router.refresh()
      setTimeout(() => setIsUploading(false), 1000)
    } catch (error) {
      console.error(error)
      alert("Failed to upload image")
      setIsUploading(false)
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero image?")) return
    setDeletingId(id)
    try {
      await deleteHeroImage(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete image")
    }
    setDeletingId(null)
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === activeImages.length - 1) return

    const newActiveImages = [...activeImages]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newActiveImages[index]
    newActiveImages[index] = newActiveImages[swapIndex]
    newActiveImages[swapIndex] = temp
    
    const reordered = newActiveImages.map((img, i) => ({ ...img, order: i }))
    const newGlobalImages = images.map(img => {
       if (img.store !== activeTab) return img
       const match = reordered.find(r => r.id === img.id)
       return match ? match : img
    })
    setImages(newGlobalImages)

    try {
      await reorderHeroImages(reordered.map(img => ({ id: img.id, order: img.order })))
    } catch (error) {
      console.error(error)
      alert("Failed to reorder images")
      router.refresh()
    }
  }

  // Update state when server sends new initialImages props
  useMemo(() => {
    setImages(initialImages)
  }, [initialImages])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Carousel</h1>
          <p className="text-gray-500">Manage the background images for the storefront hero section.</p>
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
        <div className="mb-6 border-b pb-6 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="max-w-xl">
             <h3 className="text-lg font-medium mb-2">Upload New Image</h3>
             <p className="text-sm text-gray-500 mb-4">
               Recommended: 1920×800px or similar widescreen (landscape) orientation.
               Uploading portrait photos from a phone may result in distorted or cropped backgrounds.
             </p>
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleUpload}
             />
             <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
               {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
               {isUploading ? "Uploading..." : "Select & Upload Image"}
             </Button>
          </div>
          
          {/* Mini live preview */}
          {activeImages.length > 0 && (
            <div className="w-full md:w-64 flex-shrink-0">
               <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Live Preview (First Slide)</h4>
               <div className="aspect-[16/7] rounded-md overflow-hidden border shadow-sm relative">
                  <img src={activeImages[0].url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <span className="text-white text-[10px] font-bold tracking-widest uppercase">Storefront Title</span>
                  </div>
               </div>
            </div>
          )}
        </div>
        
        {activeImages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No images</h3>
            <p className="text-sm text-gray-500 mt-1">
              Currently using the fallback placeholder images on the storefront.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
             <h4 className="text-sm font-medium text-gray-700">Active Carousel Sequence ({activeImages.length})</h4>
             {activeImages.map((img, index) => (
                <div key={img.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm group gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-12 w-20 sm:h-16 sm:w-32 rounded-md overflow-hidden bg-gray-100 border relative">
                    <img src={img.url} alt="Hero" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium">Slide {index + 1}</div>
                    <div className="text-xs text-gray-500 truncate">{img.url}</div>
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
                        disabled={index === activeImages.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                    >
                      {deletingId === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
