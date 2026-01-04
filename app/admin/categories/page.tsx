"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Package, Upload, GripVertical } from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Men's Wellness",
    slug: "mens-wellness",
    description: "Premium Ayurvedic supplements designed for men's vitality and wellness",
    productCount: 12,
    status: "Active",
    image: "/mens-wellness-ayurvedic-products-green.jpg",
  },
  {
    id: 2,
    name: "Women's Wellness",
    slug: "womens-wellness",
    description: "Natural solutions for women's health, hormonal balance, and beauty",
    productCount: 15,
    status: "Active",
    image: "/womens-wellness-ayurvedic-products-pink.jpg",
  },
  {
    id: 3,
    name: "General Health",
    slug: "general-health",
    description: "Everyday wellness supplements for immunity, energy, and vitality",
    productCount: 18,
    status: "Active",
    image: "/general-health-ayurvedic-products.jpg",
  },
  {
    id: 4,
    name: "Immunity Boosters",
    slug: "immunity-boosters",
    description: "Powerful Ayurvedic formulations to strengthen your immune system",
    productCount: 8,
    status: "Active",
    image: "/immunity-booster-ayurvedic-products-orange.jpg",
  },
  {
    id: 5,
    name: "Stress & Sleep",
    slug: "stress-sleep",
    description: "Natural remedies for better sleep, relaxation, and stress management",
    productCount: 6,
    status: "Draft",
    image: "/stress-relief-sleep-ayurvedic-products-blue.jpg",
  },
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category to organize your products.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input id="cat-name" placeholder="Enter category name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input id="cat-slug" placeholder="category-slug" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-description">Description</Label>
                <Textarea id="cat-description" placeholder="Enter category description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to upload</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative h-32">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  <p className="text-xs text-white/80">/{category.slug}</p>
                </div>
                <Badge variant={category.status === "Active" ? "default" : "secondary"}>{category.status}</Badge>
              </div>
              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Products
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{category.productCount} products</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drag hint */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            <span>Drag categories to reorder them</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}