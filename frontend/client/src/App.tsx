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
import { DashboardLayout } from './layouts/dashboard/DashboardLayout'
import DashboardOverview from './features/dashboard/DashboardOverview'
import MeetingsPage from './features/dashboard/MeetingsPage'
import NewMeetingPage from './features/dashboard/NewMeetingPage'
import AIChatPage from './features/dashboard/AIChatPage'
import InsightsPage from './features/dashboard/InsightsPage'
import SettingsPage from './features/dashboard/SettingsPage'

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
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="new-meeting" element={<NewMeetingPage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
