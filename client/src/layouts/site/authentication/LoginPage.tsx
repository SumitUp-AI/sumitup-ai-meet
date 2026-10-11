import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import AOS from "aos";
const LoginPage = () => {
  useEffect(()=> {AOS.refresh()}, [])
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();

  // Redirect if already authenticated — honour ?redirect= param
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password, rememberMe);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex mt-11 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div data-aos="fade-up" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, Let's focus where you left
            </h2>
            <p className="text-gray-600">
              Login into your account.
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div data-aos="fade-up" className="grid grid-cols-2 gap-3 mb-6">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-5 h-5 mr-3"
              />
              Google
            </button>

            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <img 
                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/960px-Microsoft_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail" 
                alt="Microsoft" 
                className="w-5 h-5 mr-3"
              />
              Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div data-aos="fade-up" className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form data-aos="fade-up" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 disabled:bg-gray-50"
              />

              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Remember Me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-800 hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-cyan-600 hover:text-cyan-500"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              &copy; 2025 Sumitup-Labs, All rights and reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:block relative w-0 flex-1 bg-slate-800">
        <div className="absolute inset-0 flex flex-col justify-start pt-16 px-12 xl:px-16 mt-24">
          {/* Testimonial */}
          <div className="max-w-md">
            <blockquote className="text-lg font-medium text-white mb-6 leading-relaxed">
              "Sumitup saves our team 15 hours a week. It captures the nuance in
              every discussion, so we can focus on decisions, not notes."
            </blockquote>

            {/* Author */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU74dxUJ2qEgHbDCDFHwC0Pt5283saAngzxA&s"
                  alt="Filip Verstratein"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  Filip Verstratein
                </div>
                <div className="text-slate-400 text-xs">
                  Director of Ops at TechFlow
                </div>
              </div>
            </div>
          </div>

          {/* Bottom indicators */}
          <div className="absolute bottom-8 left-12 flex space-x-2">
            <div className="w-6 h-1 bg-cyan-600 rounded-full"></div>
            <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
            <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
