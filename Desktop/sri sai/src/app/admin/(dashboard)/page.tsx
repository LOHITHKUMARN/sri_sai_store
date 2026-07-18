import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, AlertTriangle, Layers, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  // Get counts
  const categoriesCount = await prisma.category.count()
  const productsCount = await prisma.product.count()
  
  const newEnquiriesCount = await prisma.enquiry.count({
    where: { status: "NEW" }
  })

  const lowStockProducts = await prisma.product.findMany({
    where: { stockQuantity: { lt: 5 } },
    take: 5,
    orderBy: { stockQuantity: 'asc' }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const visitorsToday = await prisma.visit.count({
    where: { createdAt: { gte: today } }
  })

  // Get recent enquiries
  const recentEnquiries = await prisma.enquiry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views (Today)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitorsToday}</div>
            <p className="text-xs text-muted-foreground">Across all pages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newEnquiriesCount}</div>
            <p className="text-xs text-muted-foreground">Pending follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Items with &lt; 5 stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground">In {categoriesCount} categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No recent enquiries.</p>
            ) : (
              <div className="space-y-4">
                {recentEnquiries.map(enquiry => (
                  <div key={enquiry.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{enquiry.name}</p>
                      <p className="text-xs text-gray-500">{enquiry.phone} • {new Date(enquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Link href="/admin/enquiries" className="text-sm text-blue-600 hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/enquiries" className="text-sm text-blue-600 hover:underline">View all enquiries &rarr;</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">All products are well stocked.</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-semibold">
                        {product.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">Manage inventory &rarr;</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
