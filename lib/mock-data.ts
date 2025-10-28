import type { Product, Category, User } from "./types"

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Latest technology and gadgets",
    image: "/modern-electronics-category.png",
    subcategories: [
      { id: "1-1", name: "Smartphones", slug: "smartphones", description: "Latest mobile devices" },
      { id: "1-2", name: "Laptops", slug: "laptops", description: "Powerful computing devices" },
      { id: "1-3", name: "Headphones", slug: "headphones", description: "Audio equipment" },
      { id: "1-4", name: "Smart Home", slug: "smart-home", description: "Connected home devices" },

      
  { id: "1-5", name: "Tablets", slug: "tablets", description: "Portable touchscreen devices" },
  { id: "1-6", name: "Wearables", slug: "wearables", description: "Smartwatches and fitness trackers" },
  { id: "1-7", name: "Gaming Consoles", slug: "gaming-consoles", description: "PlayStation, Xbox, and more" },
  { id: "1-8", name: "Drones", slug: "drones", description: "Aerial photography and videography" },
  { id: "1-9", name: "Cameras", slug: "cameras", description: "DSLR, mirrorless, and action cams" },
  { id: "1-10", name: "Networking", slug: "networking", description: "Routers, modems, and Wi-Fi systems" },
  { id: "1-11", name: "Monitors", slug: "monitors", description: "High-resolution computer displays" },
  { id: "1-12", name: "Storage Devices", slug: "storage-devices", description: "External HDDs, SSDs, and USB drives" },
  { id: "1-13", name: "Printers & Scanners", slug: "printers-scanners", description: "Office and home printing solutions" },
  { id: "1-14", name: "Computer Accessories", slug: "computer-accessories", description: "Keyboards, mice, and peripherals" }


    ],
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    description: "Trendy clothing and accessories",
    image: "/fashion-clothing-category.png",
    subcategories: [
      { id: "2-1", name: "Men's Clothing", slug: "mens-clothing", description: "Stylish men's wear" },
      { id: "2-2", name: "Women's Clothing", slug: "womens-clothing", description: "Fashionable women's wear" },
      { id: "2-3", name: "Shoes", slug: "shoes", description: "Footwear for all occasions" },
      { id: "2-4", name: "Accessories", slug: "accessories", description: "Fashion accessories" },
      
  { id: "2-5", name: "Watches", slug: "watches", description: "Classic and smartwatches" },
  { id: "2-6", name: "Bags", slug: "bags", description: "Handbags, backpacks, and luggage" },
  { id: "2-7", name: "Jewelry", slug: "jewelry", description: "Rings, necklaces, and bracelets" },
  { id: "2-8", name: "Sportswear", slug: "sportswear", description: "Activewear and gym clothing" },
  { id: "2-9", name: "Outerwear", slug: "outerwear", description: "Jackets, coats, and blazers" },
  { id: "2-10", name: "Traditional Wear", slug: "traditional-wear", description: "Cultural and ethnic outfits" },
  { id: "2-11", name: "Swimwear", slug: "swimwear", description: "Beachwear and swimsuits" },
  { id: "2-12", name: "Kids' Clothing", slug: "kids-clothing", description: "Fashionable wear for children" },
  { id: "2-13", name: "Sleepwear", slug: "sleepwear", description: "Comfortable nightwear" },
  { id: "2-14", name: "Formal Wear", slug: "formal-wear", description: "Suits, dresses, and office outfits" }


    ],
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Everything for your home and garden",
    image: "/home-garden-category.png",
    subcategories: [
      { id: "3-1", name: "Furniture", slug: "furniture", description: "Home furniture" },
      { id: "3-2", name: "Decor", slug: "decor", description: "Home decoration items" },
      { id: "3-3", name: "Kitchen", slug: "kitchen", description: "Kitchen appliances and tools" },
      { id: "3-4", name: "Garden", slug: "garden", description: "Gardening supplies" },

      
  { id: "3-5", name: "Lighting", slug: "lighting", description: "Lamps, chandeliers, and LED lights" },
  { id: "3-6", name: "Bedding", slug: "bedding", description: "Bedsheets, pillows, and blankets" },
  { id: "3-7", name: "Storage & Organization", slug: "storage-organization", description: "Shelves, racks, and organizers" },
  { id: "3-8", name: "Cleaning Supplies", slug: "cleaning-supplies", description: "Household cleaning tools" },
  { id: "3-9", name: "Bathroom Essentials", slug: "bathroom-essentials", description: "Showers, towels, and accessories" },
  { id: "3-10", name: "Home Appliances", slug: "home-appliances", description: "Vacuum cleaners, fans, and more" },
  { id: "3-11", name: "Rugs & Carpets", slug: "rugs-carpets", description: "Floor coverings and mats" },
  { id: "3-12", name: "Curtains & Blinds", slug: "curtains-blinds", description: "Window coverings" },
  { id: "3-13", name: "Dining", slug: "dining", description: "Dining tables, chairs, and sets" },
  { id: "3-14", name: "Home Office", slug: "home-office", description: "Desks, chairs, and accessories" }]

    ,
  },
]

export const products: Product[] =
  [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    description: "The most advanced iPhone ever with titanium design, A17 Pro chip, and professional camera system.",
    price: 1199,
    originalPrice: 1299,
    category: "Electronics",
    subcategory: "Smartphones",
    images: ["/iphone-15-pro-max-front.png", "/iphone-15-pro-max-back.png", "/iphone-15-pro-max-side.png"],
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
    stockCount: 156,
    tags: ["bestseller", "premium", "new"],
    features: [
      "A17 Pro chip with 6-core GPU",
      "Pro camera system with 5x Telephoto",
      "Titanium design",
      "Action Button",
      "USB-C connectivity",
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR",
      Storage: "256GB",
      Camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
      Battery: "Up to 29 hours video playback",
      Weight: "221 grams",
    },
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: 'MacBook Pro 16"',
    description: "Supercharged by M3 Pro and M3 Max chips. Built for all the ways you work.",
    price: 2499,
    category: "Electronics",
    subcategory: "Laptops",
    images: ["/macbook-pro-16-inch-open.png", "/macbook-pro-16-inch-closed.png", "/macbook-pro-16-ports.png"],
    rating: 4.9,
    reviewCount: 1523,
    inStock: true,
    stockCount: 89,
    tags: ["professional", "premium"],
    features: [
      "M3 Pro or M3 Max chip",
      "16.2-inch Liquid Retina XDR display",
      "Up to 128GB unified memory",
      "Up to 8TB SSD storage",
      "22-hour battery life",
    ],
    specifications: {
      Processor: "Apple M3 Pro 12-core CPU",
      Memory: "18GB unified memory",
      Storage: "512GB SSD",
      Display: "16.2-inch Liquid Retina XDR",
      Weight: "2.16 kg",
    },
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "3",
    name: "AirPods Pro (2nd Gen)",
    description: "Adaptive Audio. Personalized Spatial Audio. Next-level Active Noise Cancellation.",
    price: 249,
    originalPrice: 279,
    category: "Electronics",
    subcategory: "Headphones",
    images: ["https://tinyurl.com/yc5esssu", "https://tinyurl.com/4r75a8aj", "https://tinyurl.com/3xrh4t2c", "/airpods-pro-2-features.png"],
    rating: 4.7,
    reviewCount: 3421,
    inStock: true,
    stockCount: 234,
    tags: ["bestseller", "wireless"],
    features: [
      "Adaptive Audio",
      "Active Noise Cancellation",
      "Transparency mode",
      "Personalized Spatial Audio",
      "Up to 6 hours listening time",
    ],
    specifications: {
      Chip: "H2 chip",
      "Battery Life": "Up to 6 hours (ANC on)",
      "Case Battery": "Up to 30 hours total",
      Connectivity: "Bluetooth 5.3",
      "Water Resistance": "IPX4",
    },
    createdAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "4",
    name: "Premium Cotton T-Shirt",
    description: "Soft, comfortable, and stylish cotton t-shirt perfect for everyday wear.",
    price: 29,
    originalPrice: 39,
    category: "Fashion",
    subcategory: "Men's Clothing",
    images: ["/premium-cotton-t-shirt-front.png", "/premium-cotton-t-shirt-back.png", "/premium-cotton-t-shirt-detail.png"],
    rating: 4.5,
    reviewCount: 892,
    inStock: true,
    stockCount: 456,
    tags: ["comfortable", "everyday"],
    features: [
      "100% organic cotton",
      "Pre-shrunk fabric",
      "Reinforced seams",
      "Available in multiple colors",
      "Machine washable",
    ],
    specifications: {
      Material: "100% Organic Cotton",
      Fit: "Regular fit",
      Care: "Machine wash cold",
      Origin: "Made in USA",
      Sizes: "XS to XXL available",
    },
    createdAt: "2024-01-05T10:00:00Z",
    },
  
  {
    id: "5",
    name: "Samsung Galaxy S24 Ultra",
    description: "Cutting-edge Android smartphone with Snapdragon 8 Gen 3 and 200MP camera.",
    price: 1199,
    originalPrice: 1299,
    category: "Electronics",
    subcategory: "Smartphones",
    images: ["https://tinyurl.com/3f5rk2un", "https://tinyurl.com/bfjbmkn4", "https://tinyurl.com/2p8h3f4m"],
    rating: 4.8,
    reviewCount: 1983,
    inStock: true,
    stockCount: 120,
    tags: ["flagship", "android", "premium"],
    features: [
      "200MP pro-grade camera",
      "Snapdragon 8 Gen 3",
      "S Pen support",
      "5000mAh battery",
      "Dynamic AMOLED 2X"
    ],
    specifications: {
      Display: "6.8-inch QHD+ AMOLED 120Hz",
      Storage: "512GB",
      Camera: "200MP + 12MP + 10MP",
      Battery: "5000mAh",
      Weight: "233g"
    },
    createdAt: "2024-01-20T10:00:00Z"
  },
  {
    id: "6",
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones with superior sound quality.",
    price: 399,
    category: "Electronics",
    subcategory: "Headphones",
    images: ["https://tinyurl.com/bdekswad", "/sony-wh-1000xm5-side.png"],
    rating: 4.9,
    reviewCount: 2874,
    inStock: true,
    stockCount: 75,
    tags: ["wireless", "noise-cancelling", "premium"],
    features: [
      "30-hour battery life",
      "Touch controls",
      "Hi-Res audio support",
      "Adaptive sound control",
      "Quick charge: 3 min = 3 hours"
    ],
    specifications: {
      Chip: "Sony Integrated Processor V1",
      "Battery Life": "30 hours",
      Connectivity: "Bluetooth 5.2",
      Weight: "250g",
      Colors: "Black, Silver"
    },
    createdAt: "2024-01-12T10:00:00Z"
  },
  {
    id: "7",
    name: "Nike Air Zoom Pegasus 40",
    description: "Versatile running shoes for comfort and performance.",
    price: 129,
    originalPrice: 149,
    category: "Fashion",
    subcategory: "Shoes",
    images: ["https://tinyurl.com/3kmewvr8", "/nike-pegasus-40-side.png"],
    rating: 4.6,
    reviewCount: 1342,
    inStock: true,
    stockCount: 300,
    tags: ["sports", "running", "comfort"],
    features: [
      "Breathable mesh upper",
      "Cushioned midsole",
      "Durable rubber outsole",
      "Available in multiple colors"
    ],
    specifications: {
      Material: "Mesh and rubber",
      Weight: "285g",
      Sizes: "US 6 to 13",
      Care: "Hand wash only"
    },
    createdAt: "2024-01-07T10:00:00Z"
  },
  {
    id: "8",
    name: "Luxury Leather Handbag",
    description: "Elegant genuine leather handbag with gold-tone hardware.",
    price: 259,
    category: "Fashion",
    subcategory: "Bags",
    images: ["https://tinyurl.com/4wbtndv6", "/leather-handbag-side.png"],
    rating: 4.7,
    reviewCount: 768,
    inStock: true,
    stockCount: 145,
    tags: ["luxury", "leather", "trending"],
    features: [
      "Genuine cowhide leather",
      "Adjustable strap",
      "Spacious compartments",
      "Premium stitching"
    ],
    specifications: {
      Material: "100% Genuine Leather",
      Dimensions: "30cm x 20cm x 12cm",
      Weight: "850g",
      Colors: "Black, Brown, Beige"
    },
    createdAt: "2024-01-14T10:00:00Z"
  },
  {
    id: "9",
    name: "Modern Wooden Dining Table",
    description: "Stylish 6-seater solid wood dining table for your home.",
    price: 699,
    category: "Home & Living",
    subcategory: "Dining",
    images: ["https://tinyurl.com/bdhnes42", "/wooden-dining-table-detail.png"],
    rating: 4.8,
    reviewCount: 512,
    inStock: true,
    stockCount: 42,
    tags: ["furniture", "dining", "premium"],
    features: [
      "Solid oak wood",
      "Smooth finish",
      "Seating for 6 people",
      "Scratch-resistant coating"
    ],
    specifications: {
      Material: "Solid Oak",
      Dimensions: "180cm x 90cm x 75cm",
      Weight: "38kg",
      Finish: "Natural Wood"
    },
    createdAt: "2024-01-18T10:00:00Z"
  },
  {
    id: "10",
    name: "Smart LED Floor Lamp",
    description: "Minimalist smart floor lamp with adjustable brightness and app control.",
    price: 149,
    originalPrice: 179,
    category: "Home & Living",
    subcategory: "Lighting",
    images: ["https://tinyurl.com/4ewpud48", "/smart-floor-lamp-off.png"],
    rating: 4.6,
    reviewCount: 642,
    inStock: true,
    stockCount: 210,
    tags: ["smart-home", "lighting", "modern"],
    features: [
      "App and voice control",
      "Adjustable color temperature",
      "Energy-efficient LED",
      "Sleek modern design"
    ],
    specifications: {
      Material: "Aluminum & ABS",
      Height: "165cm",
      Weight: "4.2kg",
      Power: "20W LED"
    },
    createdAt: "2024-01-16T10:00:00Z"
  }


]

export const mockUser: User = {
  id: "1",
  email: "john.doe@example.com",
  name: "John Doe",
  avatar: "/diverse-user-avatars.png",
  role: "customer",
  addresses: [
    {
      id: "1",
      name: "Home",
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
      isDefault: true,
    },
  ],
  createdAt: "2024-01-01T10:00:00Z",
}
