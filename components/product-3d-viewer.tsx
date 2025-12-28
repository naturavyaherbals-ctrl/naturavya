"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product3DViewerProps {
  images: string[]
  productName: string
}

export function Product3DViewer({ images, productName }: Product3DViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    setRotation((prev) => prev + deltaX * 0.5)
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - startX
    setRotation((prev) => prev + deltaX * 0.5)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5))
  const reset = () => {
    setRotation(0)
    setScale(1)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [])

  return (
    <div className="space-y-4">
      {/* Main Viewer */}
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted",
          "cursor-grab active:cursor-grabbing",
          "select-none",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Effect Container */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `perspective(1000px) rotateY(${rotation}deg) scale(${scale})`,
          }}
        >
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={productName}
            className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* Glow Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + rotation * 0.1}% 50%, rgba(var(--primary), 0.1) 0%, transparent 50%)`,
          }}
        />

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
          Drag to rotate
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={zoomIn} className="w-9 h-9 rounded-full shadow-md">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={zoomOut} className="w-9 h-9 rounded-full shadow-md">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={reset} className="w-9 h-9 rounded-full shadow-md">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                currentImageIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
