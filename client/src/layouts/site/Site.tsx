import { Outlet } from 'react-router-dom'
import SiteNavbar from './SiteNavbar'
import SiteFooter from './SiteFooter'

const Site = () => {
  return (
    <div className="min-h-screen bg-white">
      <SiteNavbar />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default Site