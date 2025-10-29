"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, Plus, Upload, Trash2, Image as ImageIcon, Filter, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  productId: number
}

interface GalleryImage {
  id: number
  image_url: string
  alt_text: string
  sort_order: number
  image_type: 'main' | 'angle' | 'color' | 'lifestyle' | 'detail'
}

type ImageFilter = 'all' | 'angle' | 'color' | 'lifestyle' | 'detail'

export function ProductImageGallery({ images, productName, productId }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [imageFilter, setImageFilter] = useState<ImageFilter>('all')
  const [newImageType, setNewImageType] = useState<GalleryImage['image_type']>('angle')
  const { user } = useAuth()

  // Combine main product images with gallery images
  const allImages = [
    ...images.map((url, index) => ({
      id: `main-${index}`,
      image_url: url,
      alt_text: `${productName} - Main Image ${index + 1}`,
      image_type: 'main' as const,
      sort_order: index
    })),
    ...galleryImages
  ].sort((a, b) => a.sort_order - b.sort_order)

  // Filter images based on selected filter
  const filteredImages = imageFilter === 'all' 
    ? allImages 
    : allImages.filter(img => img.image_type === imageFilter)

  const imageTypeLabels = {
    main: 'Main Images',
    angle: 'Different Angles',
    color: 'Color Variants',
    lifestyle: 'Lifestyle',
    detail: 'Close-up Details'
  }

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin')
    }
    fetchGalleryImages()
  }, [user, productId])

  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/gallery`)
      
      if (response.ok) {
        const data = await response.json()
        setGalleryImages(data.images || [])
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }
    formData.append('imageType', newImageType)

    try {
      const response = await fetch(`/api/products/${productId}/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        await fetchGalleryImages() // Refresh gallery
        // Reset file input
        event.target.value = ''
        // Reset to show all images
        setImageFilter('all')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploading(false)
    }
  }

  const deleteGalleryImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setGalleryImages(prev => prev.filter(img => img.id !== imageId))
        // Reset selected image if it was deleted
        if (selectedImage >= filteredImages.length) {
          setSelectedImage(0)
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const updateImageType = async (imageId: number, newType: GalleryImage['image_type']) => {
    try {
      const response = await fetch(`/api/products/${productId}/gallery/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ image_type: newType })
      })

      if (response.ok) {
        setGalleryImages(prev => prev.map(img => 
          img.id === imageId ? { ...img, image_type: newType } : img
        ))
      }
    } catch (error) {
      console.error('Error updating image type:', error)
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % filteredImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Main Image Skeleton */}
        <div className="aspect-square rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Thumbnails Skeleton */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="w-20 h-20 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin Gallery Management */}
      {isAdmin && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0088CC]" />
                Gallery Management
              </h3>
              
              <div className="flex items-center gap-3">
                <Select value={newImageType} onValueChange={(value: GalleryImage['image_type']) => setNewImageType(value)}>
                  <SelectTrigger className="w-40 border-[#0088CC] text-white">
                    <SelectValue placeholder="Image Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#051933] border-white/20 text-white">
                    <SelectItem value="angle">Different Angles</SelectItem>
                    <SelectItem value="color">Color Variants</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="detail">Close-up Details</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="border-[#0088CC] text-[#0088CC] hover:bg-[#0088CC] hover:text-white"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Add Images
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {galleryImages.length === 0 ? (
              <div className="text-center py-6 text-white/60 border-2 border-dashed border-white/20 rounded-lg">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No gallery images yet</p>
                <p className="text-xs mt-1">Upload additional product images from different angles</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((galleryImage) => (
                  <div key={galleryImage.id} className="relative group">
                    <img
                      src={galleryImage.image_url}
                      alt={galleryImage.alt_text}
                      className="w-full h-20 object-cover rounded-lg border border-white/20"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-1 left-1 text-xs bg-black/70 text-white border-0"
                    >
                      {galleryImage.image_type}
                    </Badge>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Select 
                        value={galleryImage.image_type} 
                        onValueChange={(value: GalleryImage['image_type']) => updateImageType(galleryImage.id, value)}
                      >
                        <SelectTrigger className="h-6 w-20 text-xs border-white/30 bg-black/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#051933] border-white/20 text-white">
                          <SelectItem value="angle">Angle</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="detail">Detail</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGalleryImage(galleryImage.id)}
                        className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Filter for Users */}
      {allImages.length > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">View:</span>
          </div>
          <Select value={imageFilter} onValueChange={(value: ImageFilter) => {
            setImageFilter(value)
            setSelectedImage(0)
          }}>
            <SelectTrigger className="w-40 border-white/20 text-white bg-white/5">
              <SelectValue placeholder="All Images" />
            </SelectTrigger>
            <SelectContent className="bg-[#051933] border-white/20 text-white">
              <SelectItem value="all">All Images</SelectItem>
              <SelectItem value="angle">Different Angles</SelectItem>
              <SelectItem value="color">Color Variants</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="detail">Close-up Details</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Image Gallery */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
            {filteredImages.length > 0 ? (
              <img
                src={filteredImages[selectedImage]?.image_url || "/api/placeholder/600/600"}
                alt={filteredImages[selectedImage]?.alt_text || productName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {filteredImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Image Counter and Type */}
          {filteredImages.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-2">
              <span>{selectedImage + 1} / {filteredImages.length}</span>
              {filteredImages[selectedImage]?.image_type !== 'main' && (
                <Badge variant="secondary" className="text-xs bg-[#0088CC]/80 text-white border-0">
                  {filteredImages[selectedImage]?.image_type}
                </Badge>
              )}
            </div>
          )}

          {/* Zoom Button */}
          {filteredImages.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] bg-[#051933] border-white/20">
                <div className="relative">
                  <img
                    src={filteredImages[selectedImage]?.image_url}
                    alt={filteredImages[selectedImage]?.alt_text}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                  
                  {filteredImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2">
                        <span>{selectedImage + 1} / {filteredImages.length}</span>
                        {filteredImages[selectedImage]?.image_type !== 'main' && (
                          <Badge variant="secondary" className="text-xs bg-[#0088CC]/80 text-white border-0">
                            {filteredImages[selectedImage]?.image_type}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Thumbnail Images */}
        {filteredImages.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Grid3X3 className="w-4 h-4" />
              <span>Click to view different angles and details</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {filteredImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group ${
                    selectedImage === index 
                      ? "border-[#0088CC] shadow-lg shadow-[#0088CC]/20" 
                      : "border-transparent hover:border-white/50"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image type badge */}
                  {image.image_type !== 'main' && (
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0 px-1 py-0">
                        {image.image_type}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Delete button for gallery images (admin only) */}
                  {isAdmin && image.id.toString().startsWith('gallery-') && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteGalleryImage(parseInt(image.id.toString().replace('gallery-', '')))
                        }}
                        className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Filtered Images */}
        {filteredImages.length === 0 && imageFilter !== 'all' && (
          <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg bg-white/5">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">No {imageFilter} images available</p>
            <p className="text-sm text-white/40 mt-2">
              Try selecting a different filter or view all images
            </p>
          </div>
        )}
      </div>
    </div>
  )
}