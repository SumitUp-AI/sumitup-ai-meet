import { Link } from 'react-router-dom'
import SumitupBg from '../../../public/sumitup-typography.svg';
import { useAuth } from '../../context/AuthContext';
const SiteNavbar = () => {

  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-30 flex items-center justify-center">
                <img src={SumitupBg} />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                How it Works
              </Link>
              <Link 
                to="/features" 
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

         {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* If user is logged in, show Dashboard */
              <>
                <Link 
                  to="/dashboard" // Changed from /signup to /dashboard
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              /* If user is NOT logged in, show Auth links */
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default SiteNavbar