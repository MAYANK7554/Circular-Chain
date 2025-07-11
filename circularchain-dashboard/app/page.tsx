"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Star, Recycle, ArrowRightLeft, Package, Filter, Plus } from "lucide-react"
import Image from "next/image"

// Sample product data
const products = [
  {
    id: 1,
    name: "MacBook Pro 16-inch",
    category: "Electronics",
    condition: "Good",
    value: "$1,299",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "MBP-2023-001",
    lastUpdated: "2 days ago",
    status: "Active",
  },
  {
    id: 2,
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    condition: "Excellent",
    value: "$899",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "HM-AERON-045",
    lastUpdated: "1 week ago",
    status: "Active",
  },
  {
    id: 3,
    name: "iPhone 14 Pro",
    category: "Electronics",
    condition: "Fair",
    value: "$649",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "IP14-PRO-789",
    lastUpdated: "3 days ago",
    status: "Pending",
  },
  {
    id: 4,
    name: "Dell UltraSharp Monitor",
    category: "Electronics",
    condition: "Good",
    value: "$399",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "DELL-US-234",
    lastUpdated: "5 days ago",
    status: "Active",
  },
  {
    id: 5,
    name: "Steelcase Think Chair",
    category: "Furniture",
    condition: "Excellent",
    value: "$599",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "SC-THINK-567",
    lastUpdated: "1 day ago",
    status: "Active",
  },
  {
    id: 6,
    name: "iPad Air",
    category: "Electronics",
    condition: "Good",
    value: "$449",
    image: "/placeholder.svg?height=200&width=300",
    serialNumber: "IPAD-AIR-123",
    lastUpdated: "4 days ago",
    status: "Active",
  },
]

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "Excellent":
      return "bg-green-100 text-green-800 border-green-200"
    case "Good":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Fair":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200"
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <SidebarProvider>
        <AppSidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Inventory</h1>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {products.length} Items
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 w-80 bg-white border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-yellow-50 bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your circular economy assets and track their lifecycle
                </p>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Serial: {product.serialNumber}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${getConditionColor(product.condition)} font-medium`}>
                          {product.condition}
                        </Badge>
                        <Badge variant="outline" className={`${getStatusColor(product.status)} font-medium`}>
                          {product.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xl text-gray-900 dark:text-white">{product.value}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        Updated {product.lastUpdated}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 space-y-2">
                      {/* Like New Button */}
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm font-medium"
                        size="sm"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Mark as Like New
                      </Button>

                      {/* Refurbishment Button */}
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm font-medium"
                        size="sm"
                      >
                        <Recycle className="w-4 h-4 mr-2" />
                        Mark for Refurbishment
                      </Button>

                      {/* Transfer Ownership Button */}
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm font-medium bg-transparent"
                        size="sm"
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Transfer Ownership
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
