import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Панель управления' },
    { path: '/admin/rooms', icon: '🏨', label: 'Номера' },
    { path: '/admin/bookings', icon: '📅', label: 'Бронирования' },
    { path: '/admin/reviews', icon: '💬', label: 'Отзывы' },
    { path: '/admin/services', icon: '🧾', label: 'Услуги' },
    { path: '/admin/gallery', icon: '📷', label: 'Галерея' },
    { path: '/admin/finance', icon: '💰', label: 'Финансы' },
    { path: '/admin/users', icon: '👥', label: 'Пользователи' },
    { path: '/admin/settings', icon: '⚙️', label: 'Настройки' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-logo">
          <h2>🏨 Hotel Vahdat</h2>
          <p>Админ-панель</p>
        </div>
        
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span className="label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          
          <div className="admin-header-right">
            <div className="admin-user">
              <span>👤 {user?.username}</span>
              <span className="admin-badge">{user?.role === 'admin' ? 'Админ' : user?.role === 'manager' ? 'Менеджер' : 'Редактор'}</span>
            </div>
            
            <div className="admin-notifications">
              🔔
            </div>
            
            <button onClick={handleLogout} className="admin-logout">
              Выход
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

