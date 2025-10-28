"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductReviewsProps {
  product: Product
}

// Mock review data
const mockReviews = [
  {
    id: "1",
    author: "John D.",
    avatar: "/placeholder.svg?key=user1",
    rating: 5,
    title: "Excellent product!",
    content:
      "This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommend!",
    date: "2024-01-15",
    verified: true,
    helpful: 12,
    notHelpful: 1,
  },
  {
    id: "2",
    author: "Sarah M.",
    avatar: "/placeholder.svg?key=user2",
    rating: 4,
    title: "Great value for money",
    content:
      "Really happy with this purchase. Good quality and works as described. Only minor issue was the packaging could be better.",
    date: "2024-01-10",
    verified: true,
    helpful: 8,
    notHelpful: 0,
  },
  {
    id: "3",
    author: "Mike R.",
    avatar: "/placeholder.svg?key=user3",
    rating: 5,
    title: "Perfect!",
    content: "Exactly what I was looking for. Fast shipping and excellent customer service. Will definitely buy again.",
    date: "2024-01-08",
    verified: false,
    helpful: 15,
    notHelpful: 2,
  },
]

export function ProductReviews({ product }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState("newest")

  // Calculate rating distribution
  const ratingDistribution = [
    { stars: 5, count: Math.floor(product.reviewCount * 0.6) },
    { stars: 4, count: Math.floor(product.reviewCount * 0.25) },
    { stars: 3, count: Math.floor(product.reviewCount * 0.1) },
    { stars: 2, count: Math.floor(product.reviewCount * 0.03) },
    { stars: 1, count: Math.floor(product.reviewCount * 0.02) },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{product.rating}</div>
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Based on {product.reviewCount} reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm">{item.stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress value={(item.count / product.reviewCount) * 100} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex space-x-2">
            {["newest", "oldest", "highest", "lowest", "helpful"].map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {mockReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{review.author}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
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
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-muted-foreground">{review.content}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Not helpful ({review.notHelpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline">Load More Reviews</Button>
        </div>
      </div>
    </div>
  )
}
