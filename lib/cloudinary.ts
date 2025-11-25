import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dpphit1yt',
  api_key: '328153496631566',
  api_secret: '_2EfSTbOu4lBuxMhG9xeUaEwFx0',
})

export async function uploadToCloudinary(file: File, folder: string = 'devvoltz') {
  try {
    console.log('☁️ Starting Cloudinary upload for file:', file.name, 'Size:', file.size)
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`
    
    console.log('📤 Uploading to Cloudinary folder:', `${folder}/products`)
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `${folder}/products`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize for consistency
        { quality: 'auto:good' } // Optimize quality
      ]
    })
    
    console.log('✅ Cloudinary upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes
    })
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    console.log('✅ Cloudinary image deleted:', publicId)
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}

// Helper to extract public_id from Cloudinary URL
export function getPublicIdFromUrl(url: string): string | null {
  const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/)
  return matches ? matches[1] : null
}