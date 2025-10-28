import Link from "next/link"
import { ArrowRight, Star, TrendingUp, Shield, Truck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#051933] via-[#051933] to-[#3132DD]/10 min-h-[90vh] flex items-center">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3132DD]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0088CC]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3132DD]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="space-y-6">
              <Badge className="w-fit px-4 py-2 text-sm bg-[#3132DD] text-white border-0 animate-in fade-in zoom-in duration-1000">
                <TrendingUp className="w-3 h-3 mr-2 animate-bounce" />
                New Collection 2024
                <div className="ml-2 w-2 h-2 bg-[#0088CC] rounded-full animate-pulse"></div>
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
                Discover
                <span className="text-[#0088CC] block bg-gradient-to-r from-[#3132DD] to-[#0088CC] bg-clip-text text-transparent">
                  Premium Tech
                </span>
                with DevVoltz
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed max-w-lg font-light">
                Experience the future of shopping with cutting-edge electronics, curated fashion, and smart home essentials. Quality meets innovation in every product.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 border-0"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group border-2 border-white/30 text-white hover:border-[#3132DD] hover:bg-[#3132DD]/10 transition-all duration-300 transform hover:scale-105 px-8"
                >
                  Browse Categories
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-[#0088CC]" />
                  <div className="text-2xl font-bold text-white">
                    2-Year
                  </div>
                </div>
                <div className="text-sm text-white/70">Warranty</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Truck className="w-5 h-5 text-[#3132DD]" />
                  <div className="text-2xl font-bold text-white">
                    Free
                  </div>
                </div>
                <div className="text-sm text-white/70">Shipping</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-[#0088CC]" />
                  <div className="text-2xl font-bold text-white">
                    24/7
                  </div>
                </div>
                <div className="text-sm text-white/70">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-in fade-in slide-in-from-right duration-700">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
              <img
                src="/banner for dev store.png?height=600&width=500&text=DevVoltz+Premium+Products"
                alt="DevVoltz Premium Products"
                className="w-full h-auto rounded-3xl shadow-2xl border-8 border-white/10"
              />
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-1000 delay-300">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#0088CC]/20 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-[#0088CC]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Free Delivery</div>
                    <div className="text-sm text-white/70">On orders over $99</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-1000 delay-500">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#3132DD]/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#3132DD]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">2-Year Warranty</div>
                    <div className="text-sm text-white/70">Full protection</div>
                  </div>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-6 right-6 bg-gradient-to-r from-[#3132DD] to-[#0088CC] rounded-2xl p-3 shadow-2xl animate-in fade-in zoom-in duration-1000 delay-700">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-white font-semibold text-sm">4.9/5</div>
                </div>
                <div className="text-white/80 text-xs mt-1">Trusted by 10K+ customers</div>
              </div>
            </div>
            
            {/* Enhanced Background Elements */}
            <div className="absolute -top-8 -right-8 w-80 h-80 bg-[#3132DD]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-[#0088CC]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#3132DD] rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}