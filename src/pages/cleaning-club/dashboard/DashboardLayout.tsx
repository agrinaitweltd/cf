import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from './DashboardLayout.module.css'

const NAV_ITEMS = [
  { to: '/cleaning/dashboard', label: 'Dashboard', end: true },
  { to: '/cleaning/dashboard/membership', label: 'Membership' },
  { to: '/cleaning/dashboard/upcoming-cleans', label: 'Upcoming Cleans' },
  { to: '/cleaning/dashboard/payments', label: 'Payment History' },
  { to: '/cleaning/dashboard/profile', label: 'Profile' },
]

export default function DashboardLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/cleaning')
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.layout}>
          <nav className={styles.sidebar} aria-label="Dashboard navigation">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </nav>
          <div className={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  )
}
