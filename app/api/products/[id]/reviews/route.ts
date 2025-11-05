// app/api/products/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// Helper function to get current user from JWT token
async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const user = await getAuthUser(token)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper function to execute queries using your pool
async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// GET - Fetch reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'newest'
    const offset = (page - 1) * limit

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Build sort clause
    let sortClause = 'ORDER BY r.created_at DESC'
    switch (sort) {
      case 'oldest':
        sortClause = 'ORDER BY r.created_at ASC'
        break
      case 'highest':
        sortClause = 'ORDER BY r.rating DESC, r.created_at DESC'
        break
      case 'lowest':
        sortClause = 'ORDER BY r.rating ASC, r.created_at DESC'
        break
      case 'helpful':
        sortClause = 'ORDER BY (helpful_count - not_helpful_count) DESC, r.created_at DESC'
        break
    }

    // Check if reviews exist
    const tableCheckQuery = `SELECT COUNT(*) as review_count FROM product_reviews WHERE product_id = ?`
    const tableCheck = await query(tableCheckQuery, [productId])
    const reviewCount = (tableCheck as any)[0]?.review_count || 0

    let reviews = []
    let stats = {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ]
    }

    if (reviewCount > 0) {
      // Get reviews with user info and vote counts
      const reviewsQuery = `
        SELECT 
          r.*,
          COALESCE(u.name, 'Anonymous User') as user_name,
          COALESCE(u.email, '') as user_email,
          COALESCE(v.helpful_count, 0) as helpful_count,
          COALESCE(v.not_helpful_count, 0) as not_helpful_count,
          COALESCE(uv.vote_type, '') as user_vote
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN (
          SELECT 
            review_id,
            COUNT(CASE WHEN vote_type = 'helpful' THEN 1 END) as helpful_count,
            COUNT(CASE WHEN vote_type = 'not_helpful' THEN 1 END) as not_helpful_count
          FROM review_votes 
          GROUP BY review_id
        ) v ON r.id = v.review_id
        LEFT JOIN review_votes uv ON r.id = uv.review_id AND uv.user_id = ?
        WHERE r.product_id = ?
        ${sortClause}
        LIMIT ${limit} OFFSET ${offset}
      `

      // Get current user for user_vote data
      const currentUser = await getCurrentUser(request)
      const userId = currentUser?.id || 0

      reviews = await query(reviewsQuery, [userId, productId])

      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM product_reviews WHERE product_id = ?'
      const countResult = await query(countQuery, [productId])
      const total = (countResult as any)[0]?.total || 0

      // Get rating statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM product_reviews 
        WHERE product_id = ?
      `

      const statsResult = await query(statsQuery, [productId])
      const statsData = (statsResult as any)[0]

      stats = {
        average_rating: parseFloat(statsData?.average_rating) || 0,
        total_reviews: statsData?.total_reviews || 0,
        rating_distribution: [
          { stars: 5, count: statsData?.five_star || 0 },
          { stars: 4, count: statsData?.four_star || 0 },
          { stars: 3, count: statsData?.three_star || 0 },
          { stars: 2, count: statsData?.two_star || 0 },
          { stars: 1, count: statsData?.one_star || 0 },
        ]
      }
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: reviewCount,
        hasMore: reviewCount > page * limit
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Submit a new review for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ 
        error: 'You must be logged in to submit a review' 
      }, { status: 401 })
    }

    const { id } = await params
    const productId = parseInt(id)
    
    const { rating, title, comment } = await request.json()

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title is required and must be at least 3 characters' }, { status: 400 })
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment is required and must be at least 10 characters' }, { status: 400 })
    }

    // Check if user already reviewed this product
    const existingReviewQuery = 'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?'
    const existingReviews = await query(existingReviewQuery, [productId, user.id])
    
    if ((existingReviews as any).length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Check if user purchased the product
    const purchaseQuery = `
      SELECT oi.id 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'paid'
    `
    const purchases = await query(purchaseQuery, [user.id, productId])
    const verified_purchase = (purchases as any).length > 0

    // Insert review
    const insertQuery = `
      INSERT INTO product_reviews (product_id, user_id, rating, title, comment, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const result = await query(insertQuery, [
      productId,
      user.id,
      rating,
      title.trim(),
      comment.trim(),
      verified_purchase
    ])

    // Update product rating and review count
    const updateProductQuery = `
      UPDATE products 
      SET 
        rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = ?),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = ?)
      WHERE id = ?
    `
    await query(updateProductQuery, [productId, productId, productId])

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      reviewId: (result as any).insertId 
    })

  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}