// components/review-submission-form.tsx
"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ReviewSubmissionFormProps {
  productId: number
  onReviewSubmitted: () => void
}

export function ReviewSubmissionForm({ productId, onReviewSubmitted }: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const getAuthToken = () => {
    // Get token from localStorage or your auth context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    const token = getAuthToken()
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating for the product.",
        variant: "destructive"
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your review.",
        variant: "destructive"
      })
      return
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write a review with at least 10 characters.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          toast({
            title: "Session Expired",
            description: "Please log in again to submit a review.",
            variant: "destructive"
          })
          router.push('/login')
          return
        }
        throw new Error(data.error || "Failed to submit review")
      }

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your review! It will be visible to other customers.",
        variant: "default"
      })

      // Notify parent component to refresh reviews
      onReviewSubmitted()

    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/20 to-purple-950/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-white/60 text-sm">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Review Title *
            </label>
            <Input
              type="text"
              placeholder="Summarize your experience in a few words..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              maxLength={100}
              required
            />
            <div className="text-xs text-white/60 text-right">
              {title.length}/100 characters
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Your Review *
            </label>
            <Textarea
              placeholder="Share your experience with this product. What did you like or dislike? How does it compare to similar products?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
              required
            />
            <div className="text-xs text-white/60 text-right">
              {comment.length} characters (minimum 10)
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !rating || !title.trim() || comment.trim().length < 10}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>

          {/* Help Text */}
          <p className="text-xs text-white/60 text-center">
            Your review will help other customers make informed decisions.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}