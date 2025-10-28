import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, Shield, CreditCard, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-[#051933] text-white relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051933] to-[#3132DD]/10"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-[#0088CC]/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#0088CC]" />
              </div>
            </div>
            <h4 className="font-semibold mb-2 text-white">Secure Payment</h4>
            <p className="text-sm text-white/80">100% protected payments</p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-[#3132DD]/20 rounded-full flex items-center justify-center">
                <Headphones className="w-6 h-6 text-[#3132DD]" />
              </div>
            </div>
            <h4 className="font-semibold mb-2 text-white">24/7 Support</h4>
            <p className="text-sm text-white/80">Always here to help</p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-[#0088CC]/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#0088CC]" />
              </div>
            </div>
            <h4 className="font-semibold mb-2 text-white">Easy Returns</h4>
            <p className="text-sm text-white/80">30-day return policy</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3132DD] to-[#0088CC] flex items-center justify-center shadow-lg">
                <img 
                  src="../logow.jpg" 
                  alt="DevVoltz" 
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  DevVoltz
                </span>
                <p className="text-xs text-white/60">Premium E-Commerce</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed font-light">
              Your trusted destination for premium electronics, fashion, and home essentials. 
              Experience quality products, exceptional service, and innovative solutions.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, color: "hover:bg-white hover:text-[#051933]" },
                { icon: Twitter, color: "hover:bg-white hover:text-[#051933]" },
                { icon: Instagram, color: "hover:bg-white hover:text-[#051933]" },
                { icon: Youtube, color: "hover:bg-white hover:text-[#051933]" }
              ].map((SocialIcon, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="icon"
                  className={`rounded-lg transition-all duration-300 transform hover:scale-110 border border-white/20 text-white/80 ${SocialIcon.color}`}
                >
                  <SocialIcon.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <div className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/shipping", label: "Shipping Info" },
                { href: "/returns", label: "Returns & Exchanges" },
                { href: "/faq", label: "FAQ" }
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="flex items-center text-white/80 hover:text-white transition-all duration-200 group"
                >
                  <ArrowRight className="h-3 w-3 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-2 group-hover:translate-x-0 text-[#0088CC]" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Customer Service
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 group hover:translate-x-1 transition-transform duration-200">
                <div className="w-10 h-10 bg-[#0088CC]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Phone className="h-4 w-4 text-[#0088CC]" />
                </div>
                <div>
                  <div className="font-medium text-white">+251940192676</div>
                  <div className="text-sm text-white/60">Any time we are avaliable</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 group hover:translate-x-1 transition-transform duration-200">
                <div className="w-10 h-10 bg-[#3132DD]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Mail className="h-4 w-4 text-[#3132DD]" />
                </div>
                <div>
                  <div className="font-medium text-white">devvoltztech@gmail.com</div>
                  <div className="text-sm text-white/60">Quick response</div>
                </div>
              </div>
              <div className="flex items-start space-x-4 group hover:translate-x-1 transition-transform duration-200">
                <div className="w-10 h-10 bg-[#0088CC]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mt-1">
                  <MapPin className="h-4 w-4 text-[#0088CC]" />
                </div>
                <div>
                  <div className="font-medium text-white">123 Commerce Street</div>
                  <div className="text-sm text-white/60">San Francisco, CA 94102</div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Stay Updated
            </h3>
            <p className="text-white/80 leading-relaxed font-light">
              Subscribe to our newsletter for exclusive deals, new product launches, and special promotions.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input 
                  placeholder="Enter your email" 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-[#3132DD]/50 transition-all duration-200"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white transition-all duration-200 transform hover:scale-105 shadow-lg border-0">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <p className="text-xs text-white/60">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/60 text-sm">
            © 2024 <span className="font-semibold text-white">DevVoltz</span>. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/cookies", label: "Cookie Policy" }
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-white transition-colors duration-200 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}