import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File, folder: string = 'devvoltz') {
  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `${folder}/products`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    })
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}