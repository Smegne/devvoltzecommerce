import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const { type } = await request.json()

    if (!['helpful', 'not_helpful'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Get user ID
    const userQuery = 'SELECT id FROM users WHERE email = ?'
    const users = await query(userQuery, [session.user.email])
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already voted
    const existingVoteQuery = 'SELECT vote_type FROM review_votes WHERE review_id = ? AND user_id = ?'
    const existingVotes = await query(existingVoteQuery, [parseInt(reviewId), user.id])
    
    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0]
      if (existingVote.vote_type === type) {
        // Remove vote if clicking same type again
        await query('DELETE FROM review_votes WHERE review_id = ? AND user_id = ?', [parseInt(reviewId), user.id])
      } else {
        // Update vote if different type
        await query(
          'UPDATE review_votes SET vote_type = ? WHERE review_id = ? AND user_id = ?',
          [type, parseInt(reviewId), user.id]
        )
      }
    } else {
      // Insert new vote
      await query(
        'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)',
        [parseInt(reviewId), user.id, type]
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