// Enhanced image utility functions for better production handling

export const FALLBACK_IMAGES = {
  electronics: "/api/placeholder/400/400?text=Electronics",
  fashion: "/api/placeholder/400/400?text=Fashion",
  home: "/api/placeholder/400/400?text=Home+Kitchen",
  sports: "/api/placeholder/400/400?text=Sports",
  books: "/api/placeholder/400/400?text=Books",
  default: "/api/placeholder/400/400?text=DevVoltz+Market"
}

export function getCategoryImage(categoryName: string): string {
  const category = categoryName?.toLowerCase() || ''
  
  if (category.includes('electronic') || category.includes('tech') || category.includes('phone')) {
    return FALLBACK_IMAGES.electronics
  } else if (category.includes('fashion') || category.includes('clothing') || category.includes('wear')) {
    return FALLBACK_IMAGES.fashion
  } else if (category.includes('home') || category.includes('living') || category.includes('kitchen')) {
    return FALLBACK_IMAGES.home
  } else if (category.includes('sport') || category.includes('fitness') || category.includes('outdoor')) {
    return FALLBACK_IMAGES.sports
  } else if (category.includes('book') || category.includes('education') || category.includes('learning')) {
    return FALLBACK_IMAGES.books
  }
  
  return FALLBACK_IMAGES.default
}

export function getProductImageUrl(imagePath: string, productName: string = 'Product', category?: string): string {
  // If no image path, use category-based placeholder
  if (!imagePath || imagePath === '') {
    if (category) {
      return getCategoryImage(category)
    }
    return `/api/placeholder/400/400?text=${encodeURIComponent(productName)}`
  }
  
  // Handle local upload paths (now in public folder)
  if (imagePath.startsWith('/uploads/')) {
    return imagePath // These work in both dev and production
  }
  
  // Handle external placeholder URLs
  if (imagePath.includes('via.placeholder.com') || imagePath.includes('placeholder.com')) {
    return `/api/placeholder/400/400?text=${encodeURIComponent(productName)}`
  }
  
  // Return original URL for other cases
  return imagePath
}

export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('/uploads/')) return true
  if (url.startsWith('/api/placeholder')) return true
  if (url.includes('via.placeholder.com')) return true
  if (url.includes('images.unsplash.com')) return true
  if (url.includes('picsum.photos')) return true
  return false
}