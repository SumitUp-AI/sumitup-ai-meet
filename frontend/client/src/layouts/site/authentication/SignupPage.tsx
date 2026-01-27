import { Link } from 'react-router-dom'
import React, { useState } from 'react'

const SignupPage = () => {

  interface SignupUser {
    name: string,
    email: string,
    password: string
  }

  const registerUser: SignupUser = {
    name: "",
    email: "",
    password: "",
  }

  const [user, setUser] = useState<SignupUser>(registerUser)
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prev: any) => {
      return {...prev, [e.target.name] : e.target.value}
    })
  }
  const handleUserRegistration = async (e: React.FormEvent<HTMLFormElement>) : Promise<void> => {
    e.preventDefault()
    try {
      const baseUrl = "http://localhost:8000/api/v1/signup"
      await fetch(baseUrl, {
        "method": "POST"
      })
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex mt-24">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Get started with SumItUp
            </h2>
            <p className="text-gray-600 mb-1">
              Join thousands of teams saving time with AI meeting notes.
            </p>
            <p className="text-gray-600 mb-8">
              No credit card required.
            </p>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-5 h-5 mr-3"
              />
              Sign up with Google
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
               <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDiQXGMUd-boRykgZmJXW-MG1JD2x8GHwIyw&s" 
                alt="Google" 
                className="w-5 h-5 mr-3"
              />
              Sign up with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">OR SIGN UP WITH EMAIL</span>
            </div>
          </div>

          {/* Email Form */}
          <form className="space-y-6" onSubmit={handleUserRegistration}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={onChangeHandler}
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email or Workspace
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={onChangeHandler}
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="emailorworkspace@domain.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={onChangeHandler}
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create Account
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an Account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Login here
                </Link>
              </p>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By clicking "Create Account", you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>.
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:flex lg:flex-1 lg:items-start lg:justify-center bg-white pt-16">
        <div className="max-w-md p-8">
          {/* Stars */}
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Testimonial */}
          <blockquote className="text-base text-gray-900 mb-5 leading-relaxed">
            "SumItUp has completely transformed how we document our product meetings. The AI summaries are shockingly accurate and save us hours of manual work every week."
          </blockquote>

          {/* Author */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">ER</span>
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">Elena Rodriguez</div>
              <div className="text-xs text-gray-600">VP of Product @ TechFlow</div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-700">SOC2 Type II Compliant Security</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Integration with Zoom, Teams & Meet</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Unlimited meeting summaries for free trial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage