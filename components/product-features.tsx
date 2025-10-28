"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Check, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductFeature {
  id: number
  product_id: number
  title: string
  description: string
  icon?: string
  created_at: string
}

interface ProductFeaturesProps {
  productId: number
}

export function ProductFeatures({ productId }: ProductFeaturesProps) {
  const [features, setFeatures] = useState<ProductFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newFeature, setNewFeature] = useState({ title: '', description: '' })
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin')
    }
    fetchFeatures()
  }, [user, productId])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/features`)
      
      if (response.ok) {
        const data = await response.json()
        setFeatures(data.features || [])
      }
    } catch (error) {
      console.error('Error fetching features:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFeature = async () => {
    if (!newFeature.title.trim()) return

    try {
      const response = await fetch(`/api/products/${productId}/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newFeature)
      })

      if (response.ok) {
        setNewFeature({ title: '', description: '' })
        fetchFeatures() // Refresh the list
      }
    } catch (error) {
      console.error('Error adding feature:', error)
    }
  }

  const deleteFeature = async (featureId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/features/${featureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchFeatures() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-4 border border-white/20 rounded-lg">
                <Skeleton className="w-6 h-6 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Check className="w-5 h-5 text-[#0088CC]" />
          Product Features
        </CardTitle>
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="border-[#0088CC] text-[#0088CC] hover:bg-[#0088CC] hover:text-white"
          >
            {editing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Manage Features
              </>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {/* Add Feature Form (Admin Only) */}
        {editing && isAdmin && (
          <div className="mb-6 p-4 border border-[#0088CC]/30 rounded-lg bg-[#0088CC]/10">
            <h4 className="font-semibold mb-3 text-[#0088CC]">Add New Feature</h4>
            <div className="space-y-3">
              <Input
                placeholder="Feature title (e.g., Fast Charging)"
                value={newFeature.title}
                onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder-white/50"
              />
              <Input
                placeholder="Feature description"
                value={newFeature.description}
                onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder-white/50"
              />
              <Button
                onClick={addFeature}
                disabled={!newFeature.title.trim()}
                className="bg-[#0088CC] hover:bg-[#0088CC]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>
        )}

        {/* Features List */}
        {features.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No features added yet.</p>
            {isAdmin && !editing && (
              <p className="text-sm mt-2">Click "Manage Features" to add product features.</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="flex items-start space-x-3 p-4 border border-white/20 rounded-lg hover:border-[#0088CC]/50 transition-colors group"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-[#0088CC] rounded-full flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-white group-hover:text-[#0088CC] transition-colors">
                      {feature.title}
                    </h4>
                    
                    {editing && isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFeature(feature.id)}
                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/20 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {feature.description && (
                    <p className="text-white/70 text-sm mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feature Count Badge */}
        {features.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <Badge variant="secondary" className="bg-[#0088CC]/20 text-[#0088CC] border-[#0088CC]/30">
              {features.length} feature{features.length !== 1 ? 's' : ''} included
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}