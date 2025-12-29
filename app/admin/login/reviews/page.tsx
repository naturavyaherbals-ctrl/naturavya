"use client"

export const dynamic = "force-dynamic";


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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Star, Check, X, Eye, Flag, ThumbsUp, MessageSquare, Filter } from "lucide-react"

const reviews = [
  {
    id: 1,
    product: "VitaMax Pro",
    productImage: "/vitamax-pro-ayurvedic.jpg",
    customer: "Rahul Sharma",
    rating: 5,
    title: "Amazing results within 2 weeks!",
    content:
      "I've been using VitaMax Pro for 2 weeks now and the results are incredible. My energy levels have improved significantly and I feel more confident. Highly recommend this product to anyone looking for a natural solution.",
    date: "2024-01-15",
    status: "pending",
    verified: true,
    helpful: 12,
  },
  {
    id: 2,
    product: "SheBalance",
    productImage: "/shebalance-ayurvedic-women.jpg",
    customer: "Priya Patel",
    rating: 4,
    title: "Good product but delivery was slow",
    content:
      "The product itself is great and I've noticed improvements in my hormonal balance. However, the delivery took longer than expected. Would appreciate faster shipping in the future.",
    date: "2024-01-14",
    status: "pending",
    verified: true,
    helpful: 5,
  },
  {
    id: 3,
    product: "Ashwagandha Plus",
    productImage: "/ashwagandha-supplement.png",
    customer: "Amit Kumar",
    rating: 5,
    title: "Best stress relief supplement",
    content:
      "After trying multiple supplements, Ashwagandha Plus is by far the best. It has helped me manage stress and sleep better. The quality is top-notch and you can feel the difference.",
    date: "2024-01-13",
    status: "approved",
    verified: true,
    helpful: 28,
  },
  {
    id: 4,
    product: "Energy Booster",
    productImage: "/energy-supplement-orange.jpg",
    customer: "Sneha Gupta",
    rating: 3,
    title: "Average results",
    content:
      "The product is okay but I expected better results based on the reviews. Maybe it takes longer to work for some people. Will continue using for another month before making a final decision.",
    date: "2024-01-12",
    status: "approved",
    verified: false,
    helpful: 3,
  },
  {
    id: 5,
    product: "Shilajit Gold",
    productImage: "/shilajit-gold-supplement.jpg",
    customer: "Vikram Singh",
    rating: 1,
    title: "Did not work for me",
    content:
      "Unfortunately this product did not work for me at all. I used it for a full month with no noticeable effects. Very disappointed with the purchase.",
    date: "2024-01-11",
    status: "flagged",
    verified: true,
    helpful: 1,
  },
]

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])
  const [selectedReview, setSelectedReview] = useState<(typeof reviews)[0] | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && review.status === "pending") ||
      (activeTab === "approved" && review.status === "approved") ||
      (activeTab === "flagged" && review.status === "flagged")
    return matchesSearch && matchesTab
  })

  const toggleSelect = (id: number) => {
    setSelectedReviews((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "flagged":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate customer reviews</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {reviews.filter((r) => r.status === "pending").length} Pending
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {reviews.filter((r) => r.status === "flagged").length} Flagged
          </Badge>
        </div>
      </div>

      {/* Tabs and filters */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All Reviews</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedReviews.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">{selectedReviews.length} reviews selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <Check className="h-4 w-4" />
                Approve All
              </Button>
              <Button variant="destructive" size="sm" className="gap-1">
                <X className="h-4 w-4" />
                Reject All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Checkbox
                  checked={selectedReviews.includes(review.id)}
                  onCheckedChange={() => toggleSelect(review.id)}
                />
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={review.productImage || "/placeholder.svg"}
                    alt={review.product}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{review.product}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <Badge variant={getStatusColor(review.status)}>{review.status}</Badge>
                    {review.verified && (
                      <Badge variant="outline" className="gap-1 text-green-600">
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>by {review.customer}</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {review.helpful} found helpful
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {review.status === "pending" && (
                    <>
                      <Button size="sm" className="gap-1">
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive bg-transparent">
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedReview(review)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review detail dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
                <DialogDescription>Review for {selectedReview.product}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={selectedReview.productImage || "/placeholder.svg"}
                      alt={selectedReview.product}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedReview.product}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                      <Badge variant={getStatusColor(selectedReview.status)}>{selectedReview.status}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="mb-1 font-medium">{selectedReview.title}</h5>
                  <p className="text-sm text-muted-foreground">{selectedReview.content}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>by {selectedReview.customer}</span>
                  <span>{new Date(selectedReview.date).toLocaleDateString()}</span>
                  {selectedReview.verified && (
                    <Badge variant="outline" className="gap-1 text-green-600">
                      <Check className="h-3 w-3" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </div>
              <DialogFooter>
                {selectedReview.status === "pending" && (
                  <>
                    <Button variant="outline" className="gap-1 text-destructive bg-transparent">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button className="gap-1">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedReview.status === "approved" && (
                  <Button variant="destructive" className="gap-1">
                    <Flag className="h-4 w-4" />
                    Flag Review
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}