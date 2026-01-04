"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Star, Check, X, Eye, Pencil, Trash2, Upload, Video, ImageIcon } from "lucide-react"

const testimonials = [
  {
    id: 1,
    customer: "Rajesh Verma",
    location: "Mumbai",
    product: "VitaMax Pro",
    type: "text",
    content:
      "After 3 months of using VitaMax Pro, I feel like a completely new person. My energy levels are through the roof and my confidence has never been higher. Thank you Naturavya!",
    rating: 5,
    featured: true,
    status: "published",
    date: "2024-01-10",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    customer: "Anita Sharma",
    location: "Delhi",
    product: "SheBalance",
    type: "video",
    content:
      "SheBalance has transformed my life. I struggled with hormonal issues for years, but this product has made such a difference. I highly recommend it to all women.",
    rating: 5,
    featured: true,
    status: "published",
    date: "2024-01-08",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    customer: "Suresh Kumar",
    location: "Bangalore",
    product: "Ashwagandha Plus",
    type: "text",
    content:
      "Great product for stress relief. I've been using it for 2 months and notice a significant improvement in my sleep quality and overall mood.",
    rating: 4,
    featured: false,
    status: "pending",
    date: "2024-01-05",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    customer: "Meera Patel",
    location: "Ahmedabad",
    product: "FemVita",
    type: "before-after",
    content:
      "The before and after difference is incredible. My skin is glowing and I have so much more energy throughout the day.",
    rating: 5,
    featured: false,
    status: "draft",
    date: "2024-01-03",
    image: "/placeholder.svg?height=60&width=60",
  },
]

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.product.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "published" && testimonial.status === "published") ||
      (activeTab === "pending" && testimonial.status === "pending") ||
      (activeTab === "draft" && testimonial.status === "draft")
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "pending":
        return "secondary"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "before-after":
        return <ImageIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer success stories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>Create a new customer testimonial for your website.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-customer">Customer Name</Label>
                  <Input id="test-customer" placeholder="Enter customer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-location">Location</Label>
                  <Input id="test-location" placeholder="City, Country" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-product">Related Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vitamax">VitaMax Pro</SelectItem>
                      <SelectItem value="shebalance">SheBalance</SelectItem>
                      <SelectItem value="ashwagandha">Ashwagandha Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-type">Testimonial Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="before-after">Before/After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-content">Testimonial Content</Label>
                <Textarea id="test-content" placeholder="Enter customer's testimonial" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Photo</Label>
                  <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50">
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-xs text-muted-foreground">Upload photo</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-rating">Rating</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch id="featured" />
                    <Label htmlFor="featured">Featured testimonial</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Testimonial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTestimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.customer}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{testimonial.customer}</span>
                    <span className="text-sm text-muted-foreground">{testimonial.location}</span>
                    {testimonial.featured && (
                      <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary">{testimonial.product}</Badge>
                    {getTypeIcon(testimonial.type) && (
                      <Badge variant="outline" className="gap-1">
                        {getTypeIcon(testimonial.type)}
                        {testimonial.type}
                      </Badge>
                    )}
                    <Badge variant={getStatusColor(testimonial.status)}>{testimonial.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.content}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      {testimonial.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}