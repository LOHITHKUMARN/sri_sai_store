"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Image as ImageIcon, UploadCloud, Edit2, AlertTriangle, ArrowUp, Sparkles, Loader2 } from "lucide-react"
import { createProduct, deleteProduct, updateProduct, toggleProductStock } from "./actions"
import { parseProductText } from "./ai-actions"
import { BulkUploadModal } from "./BulkUploadModal"

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

type Store = { id: string, name: string }
type Category = { id: string, name: string, storeId: string }
type Product = {
  id: string
  name: string
  brand: string
  price: number | null
  inStock: boolean
  store: Store | null
  category: Category | null
  imageUrls: string[]
  status: string
  description: string | null
  legacyDescription: string | null
  features: string[]
  whatsInTheBox: string[]
  specs?: any
  material?: string | null
  color?: string | null
  dimensions?: string | null
}

export default function ProductClient({ 
  products, 
  stores,
  categories
}: { 
  products: Product[], 
  stores: Store[],
  categories: Category[]
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL")
  const [storeFilter, setStoreFilter] = useState<string>("ALL")

  // AI State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [aiInputText, setAiInputText] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [aiRawFallback, setAiRawFallback] = useState("")

  // Form State
  const [storeId, setStoreId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("PUBLISHED")
  const [inStock, setInStock] = useState(true)
  
  const [description, setDescription] = useState("")
  const [legacyDescription, setLegacyDescription] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [whatsInTheBox, setWhatsInTheBox] = useState<string[]>([])
  
  const [specs, setSpecs] = useState<{category: string, key: string, value: string}[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [material, setMaterial] = useState("")
  const [color, setColor] = useState("")
  const [dimensions, setDimensions] = useState("")

  // Filter categories by selected store
  const filteredCategories = categories.filter(c => !storeId || c.storeId === storeId)

  const openCreate = () => {
    setEditingProduct(null)
    setStoreId("")
    setCategoryId("")
    setStatus("PUBLISHED")
    setInStock(true)
    setDescription("")
    setLegacyDescription(null)
    setFeatures([])
    setWhatsInTheBox([])
    setSpecs([])
    setExistingImages([])
    setMaterial("")
    setColor("")
    setDimensions("")
    setError("")
    setIsDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setStoreId(product.store?.id || "")
    setCategoryId(product.category?.id || "")
    setStatus(product.status || "PUBLISHED")
    setInStock(product.inStock)
    setDescription(product.description || "")
    setLegacyDescription(product.legacyDescription || null)
    setFeatures(product.features || [])
    setWhatsInTheBox(product.whatsInTheBox || [])
    setExistingImages(product.imageUrls || [])
    setMaterial(product.material || "")
    setColor(product.color || "")
    setDimensions(product.dimensions || "")
    
    if (product.specs) {
      try {
        const parsed = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
        const specsArr: {category: string, key: string, value: string}[] = [];
        
        // Handle migration from old flat specs to new nested specs
        Object.entries(parsed).forEach(([catOrKey, valOrObj]) => {
          if (typeof valOrObj === 'object' && valOrObj !== null) {
            // New nested format
            Object.entries(valOrObj).forEach(([k, v]) => {
              specsArr.push({ category: catOrKey, key: k, value: String(v) })
            })
          } else {
            // Old flat format
            specsArr.push({ category: 'General', key: catOrKey, value: String(valOrObj) })
          }
        });
        setSpecs(specsArr)
      } catch (e) { setSpecs([]) }
    } else {
      setSpecs([])
    }

    setError("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    formData.set('storeId', storeId)
    formData.set('categoryId', categoryId)
    formData.set('status', status)
    formData.set('inStock', inStock ? 'true' : 'false')
    
    formData.set('description', description)
    if (legacyDescription !== null) {
      formData.set('legacyDescription', legacyDescription)
    }
    
    const validFeatures = features.filter(f => f.trim() !== '')
    formData.set('features', JSON.stringify(validFeatures))
    
    const validWhatsInTheBox = whatsInTheBox.filter(w => w.trim() !== '')
    formData.set('whatsInTheBox', JSON.stringify(validWhatsInTheBox))
    
    formData.set('existingImages', JSON.stringify(existingImages))
    
    formData.set('material', material)
    formData.set('color', color)
    formData.set('dimensions', dimensions)

    const specsObj: Record<string, Record<string, string>> = {}
    specs.forEach(s => {
      if (s.category.trim() && s.key.trim() && s.value.trim()) {
        if (!specsObj[s.category.trim()]) specsObj[s.category.trim()] = {}
        specsObj[s.category.trim()][s.key.trim()] = s.value.trim()
      }
    })
    formData.set('specs', JSON.stringify(specsObj))

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
      } else {
        await createProduct(formData)
      }
      setIsDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiParse = async () => {
    if (!aiInputText.trim()) return
    setIsAiLoading(true)
    setAiError("")
    setAiRawFallback("")

    try {
      const result = await parseProductText(aiInputText)
      if (result.success) {
        setDescription(result.data.description || "")
        setFeatures(result.data.features || [])
        setWhatsInTheBox(result.data.whatsInTheBox || [])
        setSpecs(result.data.specs || [])
        setIsAiDialogOpen(false)
        setAiInputText("")
      } else {
        setAiError(result.error)
        if (result.rawText) {
          setAiRawFallback(result.rawText)
        }
      }
    } catch (err: any) {
      setAiError(err.message || "Something went wrong.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
      } catch (err: any) {
        alert("Failed to delete product")
      }
    }
  }

  const filteredProducts = products.filter(p => {
    const statusMatch = filter === "ALL" ? true : p.status === filter;
    const storeMatch = storeFilter === "ALL" ? true : p.store?.id === storeFilter;
    return statusMatch && storeMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="w-full sm:w-auto">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Stock Sheet
          </Button>

          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-center pr-8">
                  <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setIsAiDialogOpen(true)}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                    AI Auto-Fill
                  </Button>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
                
                {legacyDescription && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-yellow-800 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        Legacy Description Migration Needed
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={() => {
                          // Clean the HTML and prepopulate the AI dialog
                          const cleanText = legacyDescription
                            .replace(/&nbsp;/gi, ' ')
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                          setAiInputText(cleanText);
                          setIsAiDialogOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Auto-Migrate with AI
                      </Button>
                    </div>
                    <p className="text-sm text-yellow-700 mb-4">
                      This product uses the legacy description format. Use the <strong>Auto-Migrate</strong> button to automatically extract this into the new structured fields using AI. Once migrated and verified, click "Clear Legacy Data" to finish the migration.
                    </p>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-yellow-800">Legacy Content (Raw)</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLegacyDescription("")} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs">
                        Clear Legacy Data
                      </Button>
                    </div>
                    <Textarea 
                      value={legacyDescription} 
                      onChange={(e) => setLegacyDescription(e.target.value)}
                      className="mt-1 bg-white font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required defaultValue={editingProduct?.name} placeholder="e.g., Samsung 300L Double Door" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" name="brand" required defaultValue={editingProduct?.brand} placeholder="e.g., Samsung" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store">Store {status === 'PUBLISHED' && <span className="text-red-500">*</span>}</Label>
                    <Select value={storeId} onValueChange={(val: string | null) => { if(val){ setStoreId(val); setCategoryId("") } }} required={status === 'PUBLISHED'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store">
                          {stores.find(s => s.id === storeId)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category {status === 'PUBLISHED' && <span className="text-red-500">*</span>}</Label>
                    <Select value={categoryId} onValueChange={(val: string | null) => val && setCategoryId(val)} required={status === 'PUBLISHED'} disabled={!storeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category">
                          {filteredCategories.find(c => c.id === categoryId)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="inStock">Stock Status</Label>
                    <Select value={inStock ? "true" : "false"} onValueChange={(val) => setInStock(val === "true")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">In Stock</SelectItem>
                        <SelectItem value="false">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="status">Publish Status</Label>
                    <Select value={status} onValueChange={(val: string | null) => val && setStatus(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">Published (Visible on Site)</SelectItem>
                        <SelectItem value="DRAFT">Needs Review (Hidden)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  
                  <div className="space-y-2 col-span-2">
                    <Label className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Product Attributes</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material" className="text-xs">Material</Label>
                        <Input id="material" name="material" value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. Solid Wood, Leather" className="text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-xs">Color</Label>
                        <Input id="color" name="color" value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Walnut, Beige" className="text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-xs">Dimensions</Label>
                        <Input id="dimensions" name="dimensions" value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g. 72 x 36 x 30 inches" className="text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <Label>Product Images</Label>
                  
                  {existingImages.length > 0 && (
                    <div className="flex gap-4 flex-wrap mb-4">
                      {existingImages.map((url, idx) => (
                        <div key={idx} className={`relative w-24 h-24 border rounded-md overflow-hidden ${idx === 0 ? 'ring-2 ring-blue-500' : ''}`}>
                          <img src={url} alt="Product" className="object-cover w-full h-full" />
                          <div className="absolute top-0 right-0 p-1 flex gap-1 bg-black/50">
                            {idx !== 0 && (
                              <button type="button" onClick={() => {
                                const newArr = [...existingImages];
                                [newArr[0], newArr[idx]] = [newArr[idx], newArr[0]];
                                setExistingImages(newArr);
                              }} className="text-white hover:text-blue-300" title="Set Primary">
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            )}
                            <button type="button" onClick={() => {
                              setExistingImages(existingImages.filter((_, i) => i !== idx))
                            }} className="text-white hover:text-red-400" title="Remove">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {idx === 0 && <div className="absolute bottom-0 w-full text-center bg-blue-500 text-white text-[10px] py-0.5">Primary</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="images" className="text-xs text-gray-500">Upload New Images (You can select multiple)</Label>
                    <Input id="images" name="images" type="file" accept="image/*" multiple className="cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <Label>Short Overview (Free Text)</Label>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      disabled={!description || isSubmitting}
                      onClick={async () => {
                        const cleanDesc = description
                            .replace(/&nbsp;/gi, ' ')
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        if (!cleanDesc) return;
                        
                        setIsSubmitting(true);
                        try {
                          const result = await parseProductText(cleanDesc);
                          if (result.success) {
                            setDescription(result.data.description || "");
                            setFeatures(result.data.features || []);
                            setWhatsInTheBox(result.data.whatsInTheBox || []);
                            setSpecs(result.data.specs || []);
                          } else {
                            alert("AI parsing failed: " + result.error);
                          }
                        } catch (e: any) {
                          alert("Error: " + e.message);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 h-8 text-xs"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-500" />}
                      AI: Extract Features & Specs
                    </Button>
                  </div>
                  <ReactQuill theme="snow" value={description} onChange={setDescription} className="bg-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 border p-4 rounded-md h-fit">
                    <Label>About this item (Key Features)</Label>
                    {features.map((feature, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <Input placeholder="Feature (e.g. 80W RMS Output)" value={feature} onChange={(e) => {
                          const newArr = [...features]
                          newArr[index] = e.target.value
                          setFeatures(newArr)
                        }} />
                        <Button type="button" variant="ghost" onClick={() => setFeatures(features.filter((_, i) => i !== index))}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, ''])}>
                      <Plus className="w-4 h-4 mr-2" /> Add Feature Bullet
                    </Button>
                  </div>

                  <div className="space-y-2 border p-4 rounded-md h-fit">
                    <Label>What's in the box</Label>
                    {whatsInTheBox.map((item, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <Input placeholder="Item (e.g. 1x Remote Control)" value={item} onChange={(e) => {
                          const newArr = [...whatsInTheBox]
                          newArr[index] = e.target.value
                          setWhatsInTheBox(newArr)
                        }} />
                        <Button type="button" variant="ghost" onClick={() => setWhatsInTheBox(whatsInTheBox.filter((_, i) => i !== index))}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setWhatsInTheBox([...whatsInTheBox, ''])}>
                      <Plus className="w-4 h-4 mr-2" /> Add Box Item
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 border p-4 rounded-md">
                  <Label>Categorized Specifications</Label>
                  {specs.map((spec, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <Input placeholder="Category (e.g. Audio)" value={spec.category} className="w-1/3" onChange={(e) => {
                        const newSpecs = [...specs]
                        newSpecs[index].category = e.target.value
                        setSpecs(newSpecs)
                      }} />
                      <Input placeholder="Key (e.g. Channels)" value={spec.key} className="w-1/3" onChange={(e) => {
                        const newSpecs = [...specs]
                        newSpecs[index].key = e.target.value
                        setSpecs(newSpecs)
                      }} />
                      <Input placeholder="Value (e.g. 2.1)" value={spec.value} className="w-1/3" onChange={(e) => {
                        const newSpecs = [...specs]
                        newSpecs[index].value = e.target.value
                        setSpecs(newSpecs)
                      }} />
                      <Button type="button" variant="ghost" onClick={() => {
                        setSpecs(specs.filter((_, i) => i !== index))
                      }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setSpecs([...specs, {category: '', key: '', value: ''}])}>
                    <Plus className="w-4 h-4 mr-2" /> Add Spec
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex overflow-x-auto space-x-2 bg-slate-100 p-1 rounded-lg w-full sm:w-fit scrollbar-hide shrink-0">
          <button onClick={() => setFilter("ALL")} className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'ALL' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>All Products</button>
          <button onClick={() => setFilter("PUBLISHED")} className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'PUBLISHED' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Published</button>
          <button onClick={() => setFilter("DRAFT")} className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'DRAFT' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Needs Review</button>
        </div>
        
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white">
            <span className="truncate">
              {storeFilter === "ALL" ? "All Stores" : stores.find(s => s.id === storeFilter)?.name || "Filter by Store"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stores</SelectItem>
            {stores.map(store => (
              <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-white hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Store / Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status & Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className={product.status === 'DRAFT' ? 'bg-amber-50/30' : ''}>
                  <TableCell>
                    {product.imageUrls[0] ? (
                      <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-md border">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.brand}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {product.store?.name || 'No Store'}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">{product.category?.name || 'No Category'}</span>
                  </TableCell>
                  <TableCell>{product.price ? `₹${product.price}` : '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1 items-start">
                      {product.status === 'DRAFT' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Needs Review</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 uppercase">Published</span>
                      )}
                      <Select 
                        value={product.inStock ? "true" : "false"}
                        onValueChange={(val) => {
                          const newInStock = val === "true";
                          if (newInStock !== product.inStock) {
                            toggleProductStock(product.id, product.inStock);
                          }
                        }}
                      >
                        <SelectTrigger className={`h-6 text-[10px] font-bold px-2 py-0 border transition uppercase w-fit gap-1 ${product.inStock ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                          <span className="truncate">{product.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true" className="text-xs font-bold text-green-700">IN STOCK</SelectItem>
                          <SelectItem value="false" className="text-xs font-bold text-red-700">OUT OF STOCK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-2">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-white border rounded-lg">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm ${product.status === 'DRAFT' ? 'bg-amber-50/30' : ''}`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 border flex items-center justify-center overflow-hidden">
                  {product.imageUrls[0] ? (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <span className="text-xs text-muted-foreground truncate">{product.brand}</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {product.store?.name || 'No Store'}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {product.category?.name || 'No Category'}
                    </span>
                  </div>
                  <div className="mt-2 font-medium text-sm text-gray-900">
                    {product.price ? `₹${product.price}` : 'Price not set'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex gap-2">
                  {product.status === 'DRAFT' ? (
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Needs Review</span>
                  ) : (
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-green-100 text-green-800 uppercase">Published</span>
                  )}
                  <Select 
                    value={product.inStock ? "true" : "false"}
                    onValueChange={(val) => {
                      const newInStock = val === "true";
                      if (newInStock !== product.inStock) {
                        toggleProductStock(product.id, product.inStock);
                      }
                    }}
                  >
                    <SelectTrigger className={`h-6 text-[10px] font-bold px-2 py-0 border transition uppercase w-fit gap-1 ${product.inStock ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      <span className="truncate">{product.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true" className="text-xs font-bold text-green-700">IN STOCK</SelectItem>
                      <SelectItem value="false" className="text-xs font-bold text-red-700">OUT OF STOCK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEdit(product)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <BulkUploadModal open={isBulkOpen} onOpenChange={setIsBulkOpen} existingProductNames={products.map(p => p.name)} />
      
      {/* AI Auto-Fill Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
              Auto-Fill from Text
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Paste product descriptions, specs, and features from a manufacturer website or Amazon. The AI will extract and structure the information for you. Note: This will overwrite your current form data.
            </p>
            
            <Textarea 
              value={aiInputText}
              onChange={e => setAiInputText(e.target.value)}
              placeholder="Paste raw unstructured product text here..."
              rows={10}
              className="resize-y"
              disabled={isAiLoading}
            />

            {aiError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                <p className="font-bold mb-1">Error processing text:</p>
                <p>{aiError}</p>
              </div>
            )}

            {aiRawFallback && (
              <div className="space-y-2 mt-4">
                <Label className="text-gray-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Raw Output (Parsing Failed)
                </Label>
                <p className="text-xs text-gray-500">The AI returned this response, but it couldn't be parsed automatically. You can copy parts of it if needed.</p>
                <Textarea value={aiRawFallback} readOnly rows={6} className="font-mono text-xs bg-gray-50" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} disabled={isAiLoading}>
              Cancel
            </Button>
            <Button onClick={handleAiParse} disabled={isAiLoading || !aiInputText.trim()}>
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Extract Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
