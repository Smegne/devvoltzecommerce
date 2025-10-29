// Image utility functions for better fallback handling

export const FALLBACK_IMAGES = {
  electronics: "/electro2.jpg?text=Electronics",
  fashion: "/api/placeholder/400/400?text=Fashion",
  home: "/api/placeholder/400/400?text=Home+Essentials",
  default: "/api/placeholder/400/400?text=DevVoltz"
}

export function getCategoryImage(categoryName: string): string {
  const category = categoryName?.toLowerCase() || ''
  
  if (category.includes('electronic') || category.includes('tech') || category.includes('phone')) {
    return FALLBACK_IMAGES.electronics
  } else if (category.includes('fashion') || category.includes('clothing') || category.includes('wear')) {
    return FALLBACK_IMAGES.fashion
  } else if (category.includes('home') || category.includes('living') || category.includes('kitchen')) {
    return FALLBACK_IMAGES.home
  }
  
  return FALLBACK_IMAGES.default
}

export function getProductImage(productName: string, category?: string): string {
  if (category) {
    return getCategoryImage(category)
  }
  
  // Try to guess from product name
  const name = productName?.toLowerCase() || ''
  if (name.includes('phone') || name.includes('watch') || name.includes('macbook') || name.includes('laptop')) {
    return FALLBACK_IMAGES.electronics
  } else if (name.includes('shirt') || name.includes('dress') || name.includes('shoe')) {
    return FALLBACK_IMAGES.fashion
  } else if (name.includes('home') || name.includes('kitchen') || name.includes('decor')) {
    return FALLBACK_IMAGES.home
  }
  
  return FALLBACK_IMAGES.default
}