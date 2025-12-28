"use client"

export const dynamic = "force-dynamic";


import { useState } from "react"
import { ImageIcon, Upload, Pencil, Search, Filter, RefreshCw, ExternalLink, Calendar, Maximize2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { websiteImages as initialImages, pageOptions, type WebsiteImage } from "@/lib/website-images-data"

export default function WebsiteImagesPage() {
  const [images, setImages] = useState<WebsiteImage[]>(initialImages)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPage, setSelectedPage] = useState<string>("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<WebsiteImage | null>(null)
  const [newImageUrl, setNewImageUrl] = useState("")

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPage = selectedPage === "all" || img.page === selectedPage
    return matchesSearch && matchesPage
  })

  const groupedImages = filteredImages.reduce(
    (acc, img) => {
      if (!acc[img.page]) acc[img.page] = []
      acc[img.page].push(img)
      return acc
    },
    {} as Record<string, WebsiteImage[]>,
  )

  const handleEditClick = (image: WebsiteImage) => {
    setEditingImage(image)
    setNewImageUrl(image.currentImage)
    setIsEditDialogOpen(true)
  }

  const handlePreviewClick = (image: WebsiteImage) => {
    setEditingImage(image)
    setIsPreviewOpen(true)
  }

  const handleSaveImage = () => {
    if (editingImage && newImageUrl) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id
            ? { ...img, currentImage: newImageUrl, lastUpdated: new Date().toISOString().split("T")[0] }
            : img,
        ),
      )
      setIsEditDialogOpen(false)
      setEditingImage(null)
      setNewImageUrl("")
    }
  }

  const pageStats = pageOptions.map((page) => ({
    page,
    count: images.filter((img) => img.page === page).length,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Images</h1>
          <p className="text-muted-foreground">Manage all images across your website pages</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        {pageStats.map(({ page, count }) => (
          <Badge
            key={page}
            variant={selectedPage === page ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setSelectedPage(selectedPage === page ? "all" : page)}
          >
            {page} ({count})
          </Badge>
        ))}
        <Badge
          variant={selectedPage === "all" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1"
          onClick={() => setSelectedPage("all")}
        >
          All ({images.length})
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images by name, section, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            {pageOptions.map((page) => (
              <SelectItem key={page} value={page}>
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Images Grid by Page */}
      <div className="space-y-8">
        {Object.entries(groupedImages).map(([page, pageImages]) => (
          <Card key={page}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    {page} Page
                  </CardTitle>
                  <CardDescription>{pageImages.length} images</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pageImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Image Preview */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={image.currentImage || "/placeholder.svg"}
                        alt={image.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9"
                          onClick={() => handlePreviewClick(image)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9"
                          onClick={() => handleEditClick(image)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{image.name}</h4>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {image.section}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{image.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{image.dimensions}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {image.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedImages).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Image</DialogTitle>
            <DialogDescription>
              Change the image for "{editingImage?.name}" in {editingImage?.page} page
            </DialogDescription>
          </DialogHeader>

          {editingImage && (
            <div className="space-y-4 py-4">
              {/* Current vs New Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Current Image</Label>
                  <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                    <img
                      src={editingImage.currentImage || "/placeholder.svg"}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">New Image Preview</Label>
                  <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                    {newImageUrl ? (
                      <img
                        src={newImageUrl || "/placeholder.svg"}
                        alt="New"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/image-preview-concept.png"
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Section:</span>
                  <span className="ml-2 font-medium">{editingImage.section}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="ml-2 font-medium">{editingImage.dimensions}</span>
                </div>
              </div>

              {/* New Image URL Input */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">New Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL or upload path"
                  />
                  <Button variant="outline" className="flex-shrink-0 bg-transparent">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended size: {editingImage.dimensions} pixels</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage} disabled={!newImageUrl}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingImage?.name}</DialogTitle>
            <DialogDescription>
              {editingImage?.page} - {editingImage?.section}
            </DialogDescription>
          </DialogHeader>
          {editingImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={editingImage.currentImage || "/placeholder.svg"}
                alt={editingImage.name}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false)
                if (editingImage) handleEditClick(editingImage)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}