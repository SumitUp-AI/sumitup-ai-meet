import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Site from './layouts/site/Site'
import HomePage from './layouts/site/pages/HomePage'
import AboutPage from './layouts/site/pages/AboutPage'
import HowItWorksPage from './layouts/site/pages/HowItWorksPage'
import FeaturesPage from './layouts/site/pages/FeaturesPage'
import PricingPage from './layouts/site/pages/PricingPage'
import LoginPage from './layouts/site/authPages/LoginPage'
import SignupPage from './layouts/site/authPages/SignupPage'
import Dashboard from './features/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Site />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
