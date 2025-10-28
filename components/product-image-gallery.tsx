"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, Plus, Upload, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

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
}

export function ProductImageGallery({ images, productName, productId }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()

  // Combine main product images with gallery images
  const allImages = [...images, ...galleryImages.map(img => img.image_url)]

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
        if (selectedImage >= images.length + galleryImages.findIndex(img => img.id === imageId)) {
          setSelectedImage(0)
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
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

            {galleryImages.length === 0 ? (
              <div className="text-center py-6 text-white/60 border-2 border-dashed border-white/20 rounded-lg">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No gallery images yet</p>
                <p className="text-xs mt-1">Upload additional product images</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((galleryImage, index) => (
                  <div key={galleryImage.id} className="relative group">
                    <img
                      src={galleryImage.image_url}
                      alt={galleryImage.alt_text || `${productName} - Gallery ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-white/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGalleryImage(galleryImage.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
            <img
              src={allImages[selectedImage] || "/api/placeholder/600/600?text=Product+Image"}
              alt={`${productName} - Image ${selectedImage + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
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

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm">
              {selectedImage + 1} / {allImages.length}
            </div>
          )}

          {/* Zoom Button */}
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
                  src={allImages[selectedImage] || "/api/placeholder/800/800?text=Product+Image"}
                  alt={`${productName} - Zoomed View`}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                
                {allImages.length > 1 && (
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
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImage + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Thumbnail Images */}
        {allImages.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group ${
                  selectedImage === index 
                    ? "border-[#0088CC] shadow-lg shadow-[#0088CC]/20" 
                    : "border-transparent hover:border-white/50"
                }`}
              >
                <img
                  src={image || "/api/placeholder/100/100?text=Thumb"}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Delete button for gallery images (admin only) */}
                {isAdmin && index >= images.length && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        const galleryIndex = index - images.length
                        deleteGalleryImage(galleryImages[galleryIndex].id)
                      }}
                      className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </button>
            ))}
            
            {/* Add Image Button for Admin */}
            {isAdmin && (
              <div className="relative flex-shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-white/30 hover:border-[#0088CC] transition-colors flex items-center justify-center bg-white/5">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088CC]" />
                  ) : (
                    <Plus className="w-6 h-6 text-white/60" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State for No Images */}
        {allImages.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg bg-white/5">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">No product images available</p>
            {isAdmin && (
              <p className="text-sm text-white/40 mt-2">
                Upload images using the gallery management section above
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}