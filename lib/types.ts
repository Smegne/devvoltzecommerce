// Unified Product Type
export interface Product {
  id: number
  name: string
  title: string
  description: string
  price: number
  discountPrice?: number // Added missing property
  original_price?: number
  category: string
  subcategory?: string
  brand?: string
  stock_quantity: number
  stockCount: number
  availability: 'in_stock' | 'out_of_stock' | 'pre_order'
  inStock: boolean
  images: string[]
  rating: number
  review_count: number
  reviewCount: number
  tags: string[]
  featured: boolean
  published: boolean
  created_at: string
  createdAt: string
}

// Unified Category Type
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  subcategories: string[]
  product_count?: number
}

// Order Types
export interface Order {
  id: number
  order_number: string
  user_id: number
  
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  user?: User
}

// User Types
export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  email_verified: boolean
  created_at: string
}

// FIXED: Helper function to convert database product to component product
export function convertToProductComponent(product: any): Product {
  console.log(`🔄 Converting product ${product.id}:`, {
    title: product.title,
    category: product.category,
    images: product.images,
    published: product.published
  })

  // Handle images - could be array, JSON string, or undefined
  let images: string[] = []
  try {
    if (Array.isArray(product.images)) {
      images = product.images
    } else if (typeof product.images === 'string') {
      // Try to parse JSON string
      const parsed = JSON.parse(product.images)
      images = Array.isArray(parsed) ? parsed : [parsed]
    } else if (product.images) {
      images = [product.images]
    }
  } catch (error) {
    console.error(`❌ Error parsing images for product ${product.id}:`, error)
    images = []
  }
  
  // If no images, use placeholder
  if (images.length === 0) {
    const productName = encodeURIComponent(product.title || product.name || 'Product')
    images = [`/api/placeholder/400/400?text=${productName}`]
  }

  // Handle tags - could be array, JSON string, or undefined
  let tags: string[] = []
  try {
    if (Array.isArray(product.tags)) {
      tags = product.tags
    } else if (typeof product.tags === 'string') {
      const parsed = JSON.parse(product.tags)
      tags = Array.isArray(parsed) ? parsed : [parsed]
    }
  } catch (error) {
    console.error(`❌ Error parsing tags for product ${product.id}:`, error)
    tags = []
  }

  // Handle stock and availability
  const stockCount = Number(product.stock_quantity) || 0
  const inStock = product.availability === 'in_stock' && stockCount > 0
  
  // Handle rating and reviews with defaults
  const rating = Number(product.rating) || 4.5
  const reviewCount = Number(product.review_count) || Math.floor(Math.random() * 50) + 5

  // Handle price values
  const price = Number(product.price) || 0
  const originalPrice = product.original_price ? Number(product.original_price) : undefined

  console.log(`✅ Converted product ${product.id}:`, {
    name: product.title,
    price,
    stockCount,
    inStock,
    imagesCount: images.length
  })

  return {
    id: Number(product.id),
    name: product.title || product.name || 'Unnamed Product',
    title: product.title || product.name || 'Unnamed Product',
    description: product.description || 'No description available',
    price: price,
    discountPrice: product.discountPrice || product.discounted_price || product.sale_price,
    original_price: originalPrice,
    category: product.category || 'Uncategorized',
    subcategory: product.subcategory || null,
    brand: product.brand || null,
    stock_quantity: stockCount,
    stockCount: stockCount,
    availability: product.availability || (inStock ? 'in_stock' : 'out_of_stock'),
    inStock: inStock,
    images: images,
    rating: rating,
    review_count: reviewCount,
    reviewCount: reviewCount,
    tags: tags,
    featured: Boolean(product.featured),
    published: product.published !== false && product.published !== 0,
    created_at: product.created_at || new Date().toISOString(),
    createdAt: product.created_at || new Date().toISOString()
  }
}

// FIXED: Helper function to convert database category to component category
export function convertToCategoryComponent(category: any, subcategories: string[] = []): Category {
  console.log(`🔄 Converting category ${category.id}:`, {
    name: category.name,
    slug: category.slug,
    image: category.image || category.image_url
  })

  // Handle both image and image_url columns from database
  let image = category.image || category.image_url
  
  // If no image, use placeholder based on category name
  if (!image) {
    const categoryName = encodeURIComponent(category.name || 'Category')
    image = `/api/placeholder/400/300?text=${categoryName}`
  }

  return {
    id: Number(category.id),
    name: category.name || 'Unnamed Category',
    slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'unnamed-category',
    description: category.description || 'No description available',
    image: image,
    subcategories: subcategories,
    product_count: category.product_count ? Number(category.product_count) : undefined
  }
}

// Cart Types
export interface CartItem {
  productId: string
  quantity: number
  product?: Product
}

// Filter Types
export interface ProductFilters {
  searchQuery: string
  selectedCategory: string
  selectedSubcategory: string
  priceRange: [number, number]
  minRating: number
  sortBy: string
  availability: string[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Pagination Types
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNext: boolean
  hasPrev: boolean
}

// Search Results Type
export interface SearchResults<T> {
  items: T[]
  pagination: PaginationInfo
  filters?: any
}

// Database Result Types for MySQL queries
export interface DatabaseProduct {
  id: number
  title: string
  description: string
  price: number
  discountPrice?: number
  original_price?: number
  category: string
  subcategory?: string
  brand?: string
  stock_quantity: number
  availability: 'in_stock' | 'out_of_stock' | 'pre_order'
  images: string | string[] | null
  rating?: number
  review_count?: number
  tags: string | string[] | null
  featured: boolean | number
  published: boolean | number
  created_at: string
}

export interface DatabaseCategory {
  id: number
  name: string
  slug: string
  description: string
  image_url?: string
  image?: string
  parent_id?: number
  featured: boolean | number
  created_at: string
}

// Form Types for Admin
export interface ProductFormData {
  title: string
  description: string
  price: string
  discountPrice?: string
  original_price?: string
  category: string
  subcategory?: string
  brand?: string
  stock_quantity: string
  availability: 'in_stock' | 'out_of_stock' | 'pre_order'
  tags: string[]
  featured: boolean
  published: boolean
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  image_url: string
  parent_id?: number
  featured: boolean
}

// Utility Types
export type SortOption = 
  | 'featured' 
  | 'newest' 
  | 'price-low' 
  | 'price-high' 
  | 'rating' 
  | 'name'

export type ViewMode = 'grid' | 'list'

export type PriceRange = [number, number]

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

// Cart Context Types
export interface CartContextType {
  items: CartItem[]
  addItem: (productId: string, product?: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getCartCount: () => number
  getCartItems: () => CartItem[]
  getCartTotal: () => number
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

// Auth Context Types
export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

// API Error Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Search and Filter Types
export interface SearchParams {
  query?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  availability?: string[]
  sortBy?: SortOption
  page?: number
  limit?: number
}

// Response Types for API endpoints
export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoriesResponse {
  categories: Category[]
  total: number
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Admin Dashboard Stats
export interface DashboardStats {
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  recentOrders: Order[]
  topProducts: Product[]
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean
  url?: string
  error?: string
}

// Image Upload Types
export interface ImageUpload {
  file: File
  preview: string
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
}

// Settings Types
export interface UserSettings {
  theme: ThemeConfig
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  language: string
  currency: string
}

// Additional types for enhanced functionality
export interface ProductStats {
  totalProducts: number
  outOfStock: number
  lowStock: number
  averageRating: number
  totalRevenue: number
}

export interface CategoryWithProducts extends Category {
  products: Product[]
  featuredProducts: Product[]
}

export interface Review {
  id: number
  productId: number
  userId: number
  userName: string
  rating: number
  comment: string
  created_at: string
  helpful: number
}

export interface WishlistItem {
  id: number
  productId: number
  userId: number
  product: Product
  created_at: string
}

export interface ShippingAddress {
  id?: number
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface PaymentMethod {
  id?: number
  type: 'card' | 'paypal' | 'bank_transfer'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  nameOnCard?: string
  isDefault: boolean
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  product: Product
}

export interface OrderDetails extends Order {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  trackingNumber?: string
  estimatedDelivery?: string
}

// Analytics Types
export interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface ProductPerformance {
  product: Product
  sales: number
  revenue: number
  conversionRate: number
}

// Inventory Types
export interface InventoryAlert {
  product: Product
  currentStock: number
  minimumStock: number
  alertType: 'low_stock' | 'out_of_stock'
}

// Promotion Types
export interface Promotion {
  id: number
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_shipping'
  value: number
  minimumPurchase?: number
  startDate: string
  endDate: string
  active: boolean
  applicableCategories?: string[]
  applicableProducts?: number[]
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: number
  email: string
  name?: string
  subscribed: boolean
  created_at: string
}

// SEO Types
export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonicalUrl: string
  ogImage?: string
  structuredData?: any
}

// Social Media Types
export interface SocialMedia {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

// Store Settings Types
export interface StoreSettings {
  storeName: string
  storeDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  currency: string
  timezone: string
  socialMedia: SocialMedia
  seo: SEOData
  maintenanceMode: boolean
}

// Export all types for easy importing
export type {
  Product as ProductType,
  Category as CategoryType,
  User as UserType,
  Order as OrderType,
  CartItem as CartItemType,
  Review as ReviewType
}

// Type guards
export function isProduct(obj: any): obj is Product {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string'
}

export function isCategory(obj: any): obj is Category {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string'
}

export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string'
}

// Utility functions for type checking
export function hasDiscount(product: Product): boolean {
  return product.discountPrice !== undefined && product.discountPrice < product.price
}

export function getCurrentPrice(product: Product): number {
  return product.discountPrice || product.price
}

export function getDiscountPercentage(product: Product): number {
  if (!hasDiscount(product)) return 0
  return Math.round(((product.price - product.discountPrice!) / product.price) * 100)
}

export function isLowStock(product: Product): boolean {
  return product.stockCount > 0 && product.stockCount <= 10
}

export function isOutOfStock(product: Product): boolean {
  return product.stockCount === 0 || !product.inStock
}

// Price formatting utility
export function formatPrice(price: number, currency: string = 'ETB'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Rating utility
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

// Image utility
export function getProductImage(product: Product, index: number = 0): string {
  return product.images[index] || '/api/placeholder/400/400?text=Product'
}

export function getCategoryImage(category: Category): string {
  return category.image || '/api/placeholder/400/300?text=Category'
}

// NEW: Debug utility to check product conversion
export function debugProductConversion(rawProduct: any): void {
  console.group(`🔍 Debug Product Conversion - ID: ${rawProduct.id}`)
  console.log('Raw product:', rawProduct)
  console.log('Images type:', typeof rawProduct.images)
  console.log('Images value:', rawProduct.images)
  console.log('Published:', rawProduct.published)
  console.log('Stock quantity:', rawProduct.stock_quantity)
  console.log('Availability:', rawProduct.availability)
  console.groupEnd()
}

// NEW: Validate product before conversion
export function validateProductData(product: any): boolean {
  if (!product) return false
  if (!product.id) return false
  if (!product.title && !product.name) return false
  return true
}


// Add these to your existing types
export interface Review {
  id: number
  product_id: number
  user_id: number
  rating: number
  title: string
  comment: string
  verified_purchase: boolean
  created_at: string
  user?: {
    name: string
    email: string
  }
  helpful_count?: number
  not_helpful_count?: number
  user_vote?: 'helpful' | 'not_helpful' | null
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    stars: number
    count: number
  }[]
}

