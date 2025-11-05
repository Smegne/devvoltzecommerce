// components/product-reviews.tsx (Updated)
"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ReviewSubmissionForm } from "@/components/review-submission-form"
import type { Product, Review, ReviewStats } from "@/lib/types"

interface ProductReviewsProps {
  product: Product
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/products/${product.id}/reviews?sort=${sortBy}&page=${page}&limit=5`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      
      if (page === 1) {
        setReviews(data.reviews)
      } else {
        setReviews(prev => [...prev, ...data.reviews])
      }
      
      setStats(data.stats)
      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [product.id, sortBy, page])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleVote = async (reviewId: number, type: 'helpful' | 'not_helpful') => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, userId: 1 }) // For testing
      })
      
      if (response.ok) {
        // Refresh reviews to get updated vote counts
        fetchReviews()
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    // Reset to first page and refresh reviews
    setPage(1)
    fetchReviews()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            Write a Review
          </Button>
        </div>

        {/* Review Submission Form */}
        {showReviewForm && (
          <div className="mb-8">
            <ReviewSubmissionForm 
              productId={product.id}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
        )}

        {/* Rating Summary */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.average_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(stats.average_rating) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/80">Based on {stats.total_reviews} reviews</p>
              </div>
            </div>

            <div className="space-y-3">
              {stats.rating_distribution.map((item) => (
                <div key={item.stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm text-white">{item.stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress 
                    value={stats.total_reviews > 0 ? (item.count / stats.total_reviews) * 100 : 0} 
                    className="flex-1" 
                  />
                  <span className="text-sm text-white/80 w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        {reviews.length > 0 && (
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-white/80">Sort by:</span>
            <div className="flex space-x-2">
              {["newest", "oldest", "highest", "lowest", "helpful"].map((option) => (
                <Button
                  key={option}
                  variant={sortBy === option ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSortBy(option)
                    setPage(1)
                  }}
                  className={sortBy === option 
                    ? "bg-blue-600 text-white border-0" 
                    : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10"
                  }
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="border border-white/20">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(review.user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
       
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-3">
    <span className="font-medium text-white">
      {review.user_name || review.user?.name || 'Anonymous User'}
    </span>
    {review.verified_purchase && (
      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
        Verified Purchase
      </Badge>
    )}
  </div>
  <span className="text-sm text-white/60">
    {formatDate(review.created_at)}
  </span>
</div>

                    <div className="flex items-center space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">{review.title}</h4>
                      <p className="text-white/80">{review.comment}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleVote(review.id, 'helpful')}
                        className="text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpful_count || 0})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleVote(review.id, 'not_helpful')}
                        className="text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Not helpful ({review.not_helpful_count || 0})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {isLoading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}

        {/* No Reviews Message */}
        {reviews.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Star className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
            <p className="text-white/60 mb-4">Be the first to review this product!</p>
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              Write the First Review
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}