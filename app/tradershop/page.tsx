'use client';

import { useRef, useEffect, useState } from 'react';
import TraderForm from '@/components/traderform';

export default function TraderShopPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images data
  const carouselImages = [
    {
      id: 1,
      image: '/images/trader4.avif', // Replace with your actual image paths
      title: 'Start Your E-commerce Journey',
      description: 'Join thousands of successful traders on DevVoltz',
      gradient: 'from-[#3132DD]/80 to-[#0088CC]/80'
    },
    {
      id: 2,
      image: '/images/trader3.avif', // Replace with your actual image paths
      title: 'Grow Your Business',
      description: 'Scale your sales with our powerful platform tools',
      gradient: 'from-[#051933]/80 to-[#3132DD]/80'
    },
    {
      id: 3,
      image: '/images/trader2.jpg', // Replace with your actual image paths
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your business',
      gradient: 'from-[#0088CC]/80 to-[#051933]/80'
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // 3D parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      const elements = containerRef.current.querySelectorAll('.parallax-element');
      elements.forEach((element, index) => {
        const speed = (index + 1) * 10;
        (element as HTMLElement).style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#051933] via-[#0a2a4d] to-[#0088CC] py-12 px-4 relative overflow-hidden"
    >

     
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#3132DD]/20 to-transparent rounded-full blur-3xl animate-pulse parallax-element"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-[#0088CC]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000 parallax-element"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3132DD]/10 rounded-full blur-2xl animate-bounce parallax-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0088CC]/10 rounded-full blur-2xl animate-bounce delay-500 parallax-element"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 3D Carousel Banner */}
        <div className={`mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="relative h-96 md:h-[500px] rounded-4xl overflow-hidden shadow-4xl border-2 border-white/20 backdrop-blur-sm parallax-element">
            {/* Carousel Slides */}
            {carouselImages.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 transform translate-x-0'
                    : 'opacity-0 transform translate-x-full'
                }`}
              >
                {/* Background Image with Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-10000 ease-linear hover:scale-110"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} mix-blend-multiply`} />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
                  <div className="max-w-4xl transform transition-all duration-1000 delay-300">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-lg opacity-90">
                      {slide.description}
                    </p>
                    <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl border-2 border-white/30 hover:bg-white hover:text-[#051933] transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-2xl">
                      Get Started Today
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white hover:text-[#051933] transition-all duration-300 shadow-2xl z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white hover:text-[#051933] transition-all duration-300 shadow-2xl z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* 3D Border Effect */}
            <div className="absolute inset-0 rounded-4xl border-2 border-white/10 pointer-events-none"></div>
          </div>
        </div>

        {/* 3D Header Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-3xl shadow-2xl mb-8 transform transition-transform duration-500 hover:rotate-12 hover:scale-110 parallax-element">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-[#C0C0C0] to-[#0088CC] bg-clip-text text-transparent mb-6 transform transition-transform duration-500 hover:scale-105 parallax-element">
            Join DevVoltz as a Trader
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed parallax-element">
            Sell your products to thousands of customers and grow your business with our powerful ecommerce platform.
          </p>
        </div>

        {/* 3D Benefits Section */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Benefit 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:border-[#3132DD]/50 parallax-element group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">Zero Registration Fees</h3>
            <p className="text-white/80 text-center text-lg leading-relaxed">
              Start selling without any upfront costs or hidden charges. Grow your business risk-free.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-[#3132DD]/5 to-[#0088CC]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:border-[#0088CC]/50 parallax-element group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0088CC] to-[#051933] rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">Grow Your Business</h3>
            <p className="text-white/80 text-center text-lg leading-relaxed">
              Access thousands of customers and boost your sales with our advanced marketing tools.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0088CC]/5 to-[#051933]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:border-[#3132DD]/50 parallax-element group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">Secure Platform</h3>
            <p className="text-white/80 text-center text-lg leading-relaxed">
              Your data and transactions are protected with enterprise-grade security and encryption.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-[#3132DD]/5 to-[#0088CC]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* 3D Application Form Section */}
        <div className={`transform transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-[#C0C0C0] bg-clip-text text-transparent mb-4 parallax-element">
              Start Your Journey Today
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto parallax-element">
              Join thousands of successful traders who have transformed their business with DevVoltz
            </p>
          </div>
          
          {/* Form Container with 3D Effects */}
          <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-4xl shadow-4xl border-2 border-white/20 backdrop-blur-sm overflow-hidden transform-style-preserve-3d parallax-element">
            <div className="bg-gradient-to-r from-[#051933] via-[#3132DD] to-[#0088CC] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
              <div className="relative z-10 text-center">
                <h3 className="text-3xl font-bold mb-3">Trader Application Form</h3>
                <p className="text-blue-100 text-lg">
                  Fill out the form below to apply as a trader. We'll review your application within 2-3 business days.
                </p>
              </div>
            </div>
            <div className="p-8">
              <TraderForm />
            </div>
          </div>
        </div>

        {/* 3D FAQ Section */}
        <div className={`mt-20 transform transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h3 className="text-4xl font-bold text-white text-center mb-12 parallax-element">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How long does approval take?",
                answer: "We typically review applications within 2-3 business days. You'll receive an email notification once your application is processed."
              },
              {
                question: "What documents do I need?",
                answer: "Just your basic business information. No additional documents required for the initial application process."
              },
              {
                question: "Are there any fees?",
                answer: "No registration fees. We only charge a small commission on successful sales to help us maintain and improve the platform."
              },
              {
                question: "Can I update my shop information?",
                answer: "Yes, you can update your shop details, products, and business information anytime from your trader dashboard."
              },
              {
                question: "What support do you provide?",
                answer: "We offer 24/7 customer support, marketing assistance, and business growth tools to help you succeed."
              },
              {
                question: "Is there a sales limit?",
                answer: "No sales limits! You can list as many products as you want and scale your business without restrictions."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20 shadow-xl transform transition-all duration-500 hover:scale-105 hover:border-[#3132DD]/50 parallax-element group"
              >
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#C0C0C0] transition-colors duration-300">
                  {faq.question}
                </h4>
                <p className="text-white/80 leading-relaxed">
                  {faq.answer}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3132DD]/5 to-[#0088CC]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center mt-20 transform transition-all duration-1000 delay-1200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-[#3132DD]/20 to-[#0088CC]/20 rounded-3xl p-12 border-2 border-white/20 backdrop-blur-sm parallax-element">
            <h3 className="text-3xl font-bold text-white mb-6">
              Ready to Start Your Success Story?
            </h3>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join DevVoltz today and take your business to the next level with our powerful ecommerce platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] text-white px-12 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-lg">
                Apply Now
              </button>
              <button className="bg-white/10 text-white border-2 border-white/30 px-12 py-4 rounded-2xl hover:bg-white hover:text-[#051933] transform hover:scale-105 transition-all duration-300 font-bold text-lg backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}