// app/api/reviews/[id]/vote/route.ts
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ 
        error: 'You must be logged in to vote on reviews' 
      }, { status: 401 })
    }

    // Await the params
    const { id } = await params
    const reviewId = parseInt(id)
    
    const { type } = await request.json()

    if (!['helpful', 'not_helpful'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Check if review_votes table exists, if not create it
    try {
      await query('SELECT 1 FROM review_votes LIMIT 1')
    } catch (error) {
      console.log('review_votes table might not exist, skipping vote functionality')
      return NextResponse.json({ 
        message: 'Vote functionality not available yet',
        note: 'The review_votes table needs to be created first'
      })
    }

    // Check if user already voted
    const existingVoteQuery = 'SELECT vote_type FROM review_votes WHERE review_id = ? AND user_id = ?'
    const existingVotes = await query(existingVoteQuery, [reviewId, user.id])
    
    if ((existingVotes as any).length > 0) {
      const existingVote = (existingVotes as any)[0]
      if (existingVote.vote_type === type) {
        // Remove vote if clicking same type again
        await query('DELETE FROM review_votes WHERE review_id = ? AND user_id = ?', [reviewId, user.id])
      } else {
        // Update vote if different type
        await query(
          'UPDATE review_votes SET vote_type = ? WHERE review_id = ? AND user_id = ?',
          [type, reviewId, user.id]
        )
      }
    } else {
      // Insert new vote
      await query(
        'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)',
        [reviewId, user.id, type]
      )
    }

    return NextResponse.json({ message: 'Vote recorded successfully' })

  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}