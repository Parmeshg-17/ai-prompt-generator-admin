import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot, LayoutDashboard, FileText, CreditCard,
  Users, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/prompts', icon: <FileText size={18} />, label: 'System Prompts' },
  { to: '/pricing', icon: <CreditCard size={18} />, label: 'Pricing Plans' },
  { to: '/users', icon: <Users size={18} />, label: 'Users' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    const onResize = () => setSideOpen(window.innerWidth > 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sideOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Bot size={24} />
            {sideOpen && <span>AI Admin</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSideOpen(!sideOpen)}>
            {sideOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sideOpen && <span className="nav-label">{item.label}</span>}
              {sideOpen && <ChevronRight size={14} className="nav-arrow" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sideOpen && (
            <div className="user-pill">
              <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
              <span className="user-email">{user?.email}</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {sideOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`main-content ${sideOpen ? 'main-shifted' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
