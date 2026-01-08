import { Outlet } from 'react-router-dom'
import SiteNavbar from './SiteNavbar'

const Site = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Site