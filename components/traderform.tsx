'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TraderFormData {
  name: string;
  shopName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  shopAddress: string;
  shopDescription: string;
  shopLogo: File | null;
}

interface FormErrors {
  name?: string;
  shopName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  shopAddress?: string;
  shopLogo?: string;
  submit?: string;
}

export default function TraderForm3D() {
  const router = useRouter();
  const [formData, setFormData] = useState<TraderFormData>({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopAddress: '',
    shopDescription: '',
    shopLogo: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Proper ref callback function
  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[index] = el;
  };

  // 3D Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!formRef.current) return;
      
      const { left, top, width, height } = formRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      formRef.current.style.transform = `
        perspective(1000px)
        rotateY(${x * 5}deg)
        rotateX(${y * -5}deg)
        scale3d(1.02, 1.02, 1.02)
      `;

      // Individual card effects
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const delay = index * 100;
          card.style.transform = `
            perspective(1000px)
            rotateY(${x * 8}deg)
            rotateX(${y * -8}deg)
            translateZ(${index * 10}px)
          `;
          card.style.transition = `transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
        }
      });
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('mousemove', handleMouseMove);
      form.addEventListener('mouseleave', () => {
        form.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
        cardRefs.current.forEach((card, index) => {
          if (card) {
            card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
          }
        });
      });
    }

    return () => {
      if (form) {
        form.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.shopAddress.trim()) newErrors.shopAddress = 'Shop address is required';

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password strength
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // File validation
    if (formData.shopLogo) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(formData.shopLogo.type)) {
        newErrors.shopLogo = 'Only JPG and PNG files are allowed';
      }
      if (formData.shopLogo.size > 5 * 1024 * 1024) {
        newErrors.shopLogo = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      shopLogo: file
    }));
    setSelectedFileName(file ? file.name : '');

    if (errors.shopLogo) {
      setErrors(prev => ({
        ...prev,
        shopLogo: undefined
      }));
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);
  setSuccessMessage('');
  setShowLoginPrompt(false);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('shopName', formData.shopName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('shopAddress', formData.shopAddress);
    formDataToSend.append('shopDescription', formData.shopDescription);
    if (formData.shopLogo) {
      formDataToSend.append('shopLogo', formData.shopLogo);
    }

    console.log('🔄 Submitting trader application...');

    const response = await fetch('/api/trader', {
      method: 'POST',
      body: formDataToSend,
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Application submitted successfully');
      setSuccessMessage('🎉 Trader application submitted successfully! You will be notified once approved.');
      setShowLoginPrompt(true);
      setFormData({
        name: '',
        shopName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        shopAddress: '',
        shopDescription: '',
        shopLogo: null,
      });
      setSelectedFileName('');
    } else {
      console.error('❌ Application failed:', result.message);
      setErrors({ 
        ...errors, 
        submit: result.message || 'Registration failed. Please try again.' 
      });
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    setErrors({ 
      ...errors, 
      submit: 'Network error. Please check your connection and try again.' 
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleLoginRedirect = () => {
    router.push('/traderlogin');
  };

  // 3D Floating animation for success message
  const SuccessMessage3D = () => (
    <div className="mb-8 p-8 bg-gradient-to-br from-[#3132DD]/10 to-[#0088CC]/10 border-2 border-[#3132DD]/20 rounded-3xl shadow-2xl backdrop-blur-sm transform transition-all duration-1000 scale-100 hover:scale-105 hover:rotate-1">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[#051933] text-xl font-bold mb-4">{successMessage}</p>
          {showLoginPrompt && (
            <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/20">
              <p className="text-[#051933] text-sm mb-4 font-semibold">
                You can now login to check your application status and start setting up your shop.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLoginRedirect}
                  className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:animate-pulse"
                >
                  🚀 Login to Dashboard
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="bg-gradient-to-r from-[#C0C0C0] to-[#808080] text-white px-8 py-4 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051933] via-[#0a2a4d] to-[#0088CC] py-12 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#3132DD]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-[#0088CC]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 3D Header Section */}
        <div className="text-center mb-16 transform perspective-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-3xl shadow-2xl mb-8 transform transition-transform duration-500 hover:rotate-12 hover:scale-110">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-[#C0C0C0] to-[#0088CC] bg-clip-text text-transparent mb-6 transform transition-transform duration-500 hover:scale-105">
            Start Your Shop on DevVoltz
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful traders and grow your business with our powerful ecommerce platform
          </p>
        </div>

        {/* Success Message */}
        {successMessage && <SuccessMessage3D />}

        {/* Main 3D Form Container */}
        <div 
          ref={formRef}
          className="bg-gradient-to-br from-white/95 to-white/90 rounded-4xl shadow-4xl border-2 border-white/20 backdrop-blur-sm overflow-hidden transform-style-preserve-3d transition-transform duration-500"
        >
          {/* 3D Form Header */}
          <div 
            ref={setCardRef(0)}
            className="bg-gradient-to-r from-[#051933] via-[#3132DD] to-[#0088CC] p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 transform transition-transform duration-300 hover:scale-105">
                Trader Application Form
              </h2>
              <p className="text-blue-100 text-lg opacity-95">
                Fill out the form below to start your journey as a DevVoltz trader
              </p>
            </div>
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-12">
            {/* Personal Information - 3D Card */}
            <div 
              ref={setCardRef(1)}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform transition-all duration-500 hover:shadow-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-12 bg-gradient-to-b from-[#3132DD] to-[#0088CC] rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#051933] to-[#3132DD] bg-clip-text text-transparent">
                  Personal Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Name Input with 3D effect */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="name" className="block text-sm font-bold text-[#051933] mb-3">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.name ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {!errors.name && formData.name && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Shop Name Input with 3D effect */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="shopName" className="block text-sm font-bold text-[#051933] mb-3">
                    Shop Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.shopName ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Enter your shop name"
                    />
                    {!errors.shopName && formData.shopName && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.shopName && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.shopName}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information - 3D Card */}
            <div 
              ref={setCardRef(2)}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform transition-all duration-500 hover:shadow-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-12 bg-gradient-to-b from-[#3132DD] to-[#0088CC] rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#051933] to-[#3132DD] bg-clip-text text-transparent">
                  Contact Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Input */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="email" className="block text-sm font-bold text-[#051933] mb-3">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.email ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Enter your email"
                    />
                    {!errors.email && formData.email && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="phone" className="block text-sm font-bold text-[#051933] mb-3">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.phone ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {!errors.phone && formData.phone && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section - 3D Card */}
            <div 
              ref={setCardRef(3)}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform transition-all duration-500 hover:shadow-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-12 bg-gradient-to-b from-[#3132DD] to-[#0088CC] rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#051933] to-[#3132DD] bg-clip-text text-transparent">
                  Security
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Password Input */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="password" className="block text-sm font-bold text-[#051933] mb-3">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.password ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Create a password"
                    />
                    {!errors.password && formData.password && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#051933] mb-3">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm ${
                        errors.confirmPassword ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Information - 3D Card */}
            <div 
              ref={setCardRef(4)}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform transition-all duration-500 hover:shadow-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-12 bg-gradient-to-b from-[#3132DD] to-[#0088CC] rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#051933] to-[#3132DD] bg-clip-text text-transparent">
                  Shop Information
                </h3>
              </div>
              
              <div className="space-y-8">
                {/* Shop Address */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="shopAddress" className="block text-sm font-bold text-[#051933] mb-3">
                    Shop Address *
                  </label>
                  <div className="relative">
                    <textarea
                      id="shopAddress"
                      name="shopAddress"
                      value={formData.shopAddress}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-6 py-4 bg-white/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm resize-none ${
                        errors.shopAddress ? 'border-red-500 shadow-lg' : 'border-[#C0C0C0]/30 hover:border-[#3132DD]/50'
                      }`}
                      placeholder="Enter your complete shop address including city and country"
                    />
                    {!errors.shopAddress && formData.shopAddress && (
                      <div className="absolute right-4 top-4 text-green-500 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.shopAddress && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.shopAddress}</span>
                    </p>
                  )}
                </div>

                {/* Shop Description */}
                <div className="space-y-3 transform transition-transform duration-300 hover:scale-105">
                  <label htmlFor="shopDescription" className="block text-sm font-bold text-[#051933] mb-3">
                    Shop Description <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="shopDescription"
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-6 py-4 bg-white/80 border-2 border-[#C0C0C0]/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/30 transition-all duration-300 backdrop-blur-sm resize-none hover:border-[#3132DD]/50"
                    placeholder="Tell us about your shop, your products, and what makes you unique..."
                  />
                  <p className="text-gray-500 text-sm font-semibold">
                    {formData.shopDescription.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload - 3D Card */}
            <div 
              ref={setCardRef(5)}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform transition-all duration-500 hover:shadow-3xl"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-12 bg-gradient-to-b from-[#3132DD] to-[#0088CC] rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#051933] to-[#3132DD] bg-clip-text text-transparent">
                  Brand Identity
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <label htmlFor="shopLogo" className="block text-sm font-bold text-[#051933] mb-3">
                    Shop Logo <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 backdrop-blur-sm ${
                    errors.shopLogo ? 'border-red-500 bg-red-50/50' : 'border-[#C0C0C0]/30 bg-white/30 hover:border-[#3132DD] hover:bg-[#3132DD]/5 hover:scale-105'
                  }`}>
                    <input
                      type="file"
                      id="shopLogo"
                      name="shopLogo"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor="shopLogo"
                      className="cursor-pointer flex flex-col items-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-[#3132DD] to-[#0088CC] rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#051933] mb-2">
                          {selectedFileName ? selectedFileName : 'Upload Shop Logo'}
                        </p>
                        <p className="text-gray-600 text-sm font-semibold">
                          PNG, JPG, JPEG files up to 5MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-8 py-3 bg-white border-2 border-[#3132DD] text-[#3132DD] rounded-2xl hover:bg-[#3132DD] hover:text-white transform hover:scale-105 transition-all duration-300 font-bold shadow-lg"
                      >
                        Choose File
                      </button>
                    </label>
                  </div>
                  {errors.shopLogo && (
                    <p className="text-red-600 text-sm flex items-center space-x-2 font-semibold">
                      <span>⚠️</span>
                      <span>{errors.shopLogo}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Error Message */}
            {errors.submit && (
              <div className="p-8 bg-red-50/80 border-2 border-red-200 rounded-3xl backdrop-blur-sm transform transition-all duration-500 scale-100">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-800 font-bold text-lg">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* 3D Submit Button */}
            <div className="pt-8 transform perspective-1000">
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full bg-gradient-to-r from-[#3132DD] via-[#0088CC] to-[#051933] text-white py-6 px-8 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-[#3132DD]/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3132DD] to-[#0088CC] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-center justify-center space-x-4">
                  {isLoading ? (
                    <>
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-bold">Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-xl font-bold">Launch Your Shop Now</span>
                    </>
                  )}
                </div>
                
                {/* 3D Button Edge Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#051933] to-[#3132DD] rounded-b-2xl transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>

            {/* 3D Login Prompt */}
            <div 
              ref={setCardRef(6)}
              className="text-center p-8 bg-gradient-to-r from-[#3132DD]/10 to-[#0088CC]/10 rounded-3xl border-2 border-white/20 backdrop-blur-sm transform transition-all duration-500 hover:scale-105"
            >
              <p className="text-[#051933] text-xl font-bold mb-6">
                Already have a trader account?
              </p>
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="bg-white text-[#3132DD] border-2 border-[#3132DD] px-10 py-4 rounded-2xl hover:bg-[#3132DD] hover:text-white transform hover:scale-110 transition-all duration-300 font-bold shadow-lg hover:shadow-2xl"
              >
                🚀 Access Trader Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}