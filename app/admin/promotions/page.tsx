"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Calendar, Sparkles, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { promotions as initialPromotions, type Promotion } from "@/lib/promotions-data"
import { cn } from "@/lib/utils"

const gradientOptions = [
  {
    value: "from-amber-600 via-orange-500 to-yellow-500",
    label: "Summer Gold",
    preview: "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500",
  },
  {
    value: "from-emerald-700 via-green-600 to-teal-500",
    label: "Forest Green",
    preview: "bg-gradient-to-r from-emerald-700 via-green-600 to-teal-500",
  },
  {
    value: "from-rose-600 via-pink-500 to-fuchsia-500",
    label: "Rose Pink",
    preview: "bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500",
  },
  {
    value: "from-primary via-primary/90 to-emerald-600",
    label: "Brand Primary",
    preview: "bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600",
  },
  {
    value: "from-purple-600 via-violet-500 to-indigo-500",
    label: "Royal Purple",
    preview: "bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500",
  },
  {
    value: "from-cyan-600 via-blue-500 to-indigo-500",
    label: "Ocean Blue",
    preview: "bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500",
  },
  {
    value: "from-red-600 via-orange-500 to-amber-500",
    label: "Fire Red",
    preview: "bg-gradient-to-r from-red-600 via-orange-500 to-amber-500",
  },
  {
    value: "from-gray-900 via-gray-800 to-gray-700",
    label: "Elegant Dark",
    preview: "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700",
  },
]

export default function PromotionsPage() {
  const [promotionsList, setPromotionsList] = useState<Promotion[]>(initialPromotions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState<Partial<Promotion>>({
    title: "",
    subtitle: "",
    description: "",
    discount: "",
    code: "",
    buttonText: "Shop Now",
    buttonLink: "/categories",
    image: "",
    bgGradient: gradientOptions[0].value,
    textColor: "light",
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    order: promotionsList.length + 1,
  })

  const handleOpenDialog = (promo?: Promotion) => {
    if (promo) {
      setEditingPromo(promo)
      setFormData(promo)
    } else {
      setEditingPromo(null)
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        discount: "",
        code: "",
        buttonText: "Shop Now",
        buttonLink: "/categories",
        image: "",
        bgGradient: gradientOptions[0].value,
        textColor: "light",
        isActive: true,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        order: promotionsList.length + 1,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingPromo) {
      setPromotionsList((prev) =>
        prev.map((p) => (p.id === editingPromo.id ? ({ ...p, ...formData } as Promotion) : p)),
      )
    } else {
      const newPromo: Promotion = {
        ...formData,
        id: `promo-${Date.now()}`,
      } as Promotion
      setPromotionsList((prev) => [...prev, newPromo])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setPromotionsList((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setPromotionsList((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }

  const handleReorder = (id: string, direction: "up" | "down") => {
    const index = promotionsList.findIndex((p) => p.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === promotionsList.length - 1)) return

    const newList = [...promotionsList]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    const temp = newList[index].order
    newList[index].order = newList[swapIndex].order
    newList[swapIndex].order = temp
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    setPromotionsList(newList)
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotional Offers</h1>
          <p className="text-muted-foreground">Manage homepage banners, sales, and discount campaigns</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPromo ? "Edit Promotion" : "Create New Promotion"}</DialogTitle>
              <DialogDescription>Design an eye-catching promotional banner for your homepage</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Preview Card */}
              <div className="mb-2">
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <div
                  className={cn("relative overflow-hidden rounded-xl p-4", "bg-gradient-to-br", formData.bgGradient)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-white/20 text-white text-xs">{formData.subtitle || "Subtitle"}</Badge>
                      <h3
                        className={cn(
                          "text-lg font-bold font-serif",
                          formData.textColor === "light" ? "text-white" : "text-gray-900",
                        )}
                      >
                        {formData.title || "Promotion Title"}
                      </h3>
                      <p
                        className={cn(
                          "text-xs mt-1 line-clamp-2",
                          formData.textColor === "light" ? "text-white/80" : "text-gray-700",
                        )}
                      >
                        {formData.description || "Your description will appear here..."}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
                        formData.textColor === "light" ? "bg-white text-gray-900" : "bg-gray-900 text-white",
                      )}
                    >
                      {formData.discount || "XX% OFF"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summer Wellness Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Limited Time Offer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get up to 40% off on all Ayurvedic supplements..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Badge *</Label>
                  <Input
                    id="discount"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="40% OFF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SUMMER40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/categories"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Banner Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/promo-banner.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Gradient</Label>
                  <Select
                    value={formData.bgGradient}
                    onValueChange={(value) => setFormData({ ...formData, bgGradient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-4 w-8 rounded", option.preview)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Select
                    value={formData.textColor}
                    onValueChange={(value: "light" | "dark") => setFormData({ ...formData, textColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light (White Text)</SelectItem>
                      <SelectItem value="dark">Dark (Black Text)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">Show this promotion on the homepage</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingPromo ? "Save Changes" : "Create Promotion"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {promotionsList.filter((p) => p.isActive && !isExpired(p.endDate)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotionsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {promotionsList.filter((p) => isExpired(p.endDate)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Drag to reorder how promotions appear in the slideshow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotionsList
              .sort((a, b) => a.order - b.order)
              .map((promo, index) => (
                <div
                  key={promo.id}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4 transition-all",
                    !promo.isActive && "opacity-60",
                    isExpired(promo.endDate) && "bg-muted/50",
                  )}
                >
                  {/* Drag handle & order buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleReorder(promo.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUpDown className="h-3 w-3 rotate-180" />
                    </Button>
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleReorder(promo.id, "down")}
                      disabled={index === promotionsList.length - 1}
                    >
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Preview */}
                  <div
                    className={cn(
                      "h-20 w-32 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center overflow-hidden",
                      promo.bgGradient,
                    )}
                  >
                    {promo.image ? (
                      <img
                        src={promo.image || "/placeholder.svg"}
                        alt={promo.title}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <Sparkles className="h-8 w-8 text-white/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{promo.title}</h3>
                      <Badge variant={promo.isActive ? "default" : "secondary"}>
                        {promo.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {isExpired(promo.endDate) && <Badge variant="destructive">Expired</Badge>}
                      {isUpcoming(promo.startDate) && <Badge variant="outline">Upcoming</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{promo.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {promo.startDate} - {promo.endDate}
                      </span>
                      {promo.code && (
                        <span className="flex items-center gap-1 font-mono bg-muted px-2 py-0.5 rounded">
                          <Copy className="h-3 w-3" />
                          {promo.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleActive(promo.id)}>
                      {promo.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Promotion?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{promo.title}" from your promotions. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(promo.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

            {promotionsList.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No promotions yet</h3>
                <p className="text-muted-foreground mb-4">Create your first promotional banner to attract customers</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Promotion
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}