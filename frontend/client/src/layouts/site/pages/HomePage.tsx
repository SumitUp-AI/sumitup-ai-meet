import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-gray-50 transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                {/* Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    🆕 New: Visual Process Mapping v2.0
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl tracking-tight font-bold text-gray-900 sm:text-5xl">
                  <span className="block xl:inline">Turn meetings into</span>{' '}
                  <span className="block text-cyan-600 xl:inline">
                    memory, clarity, and action.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-3 text-xs text-gray-500 sm:mt-5 sm:text-sm sm:max-w-xl sm:mx-auto md:mt-5 lg:mx-0">
                  Never miss a decision. We provide private, secure, and accurate AI summaries for your team, turning hours of talk into actionable insights.
                </p>

                {/* CTA Buttons */}
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 md:py-2 md:text-sm md:px-5 transition-colors"
                    >
                      Start now
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/how-it-works"
                      className="w-full flex items-center justify-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-2 md:px-5 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      See How It Works
                    </Link>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex items-center sm:justify-center lg:justify-start">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                      alt=""
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </div>
                  <div className="ml-3 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Trusted by 2,000+ teams</span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="/heroSectionImage.jpg"
            alt="SumItUp AI meeting summary interface showing video call participants and live summary generation"
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage