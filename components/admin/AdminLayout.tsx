
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`block py-2.5 px-4 rounded transition duration-200 ${
        isActive 
          ? 'bg-brazil-yellow text-brazil-blue font-semibold' 
          : 'hover:bg-blue-700 hover:text-brazil-yellow'
      }`}
    >
      {children}
    </Link>
  );
};


const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brazil-blue text-white p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-brazil-yellow mb-8">GApp Admin</h1>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <NavLink to="/admin/dashboard">
                Meus GApps
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/conversas">
                Conversas
              </NavLink>
            </li>
            {/* Link to Webhook Simulator, only visible to admin 'gestor' */}
            {user?.email === 'gestor' && (
              <li>
                <NavLink to="/admin/webhook-simulator">
                  Simulador de Webhook
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <div className="mt-auto">
           <button
            onClick={handleLogout}
            className="w-full bg-brazil-yellow text-brazil-blue font-semibold py-2 px-4 rounded transition duration-200 hover:bg-yellow-300"
          >
            Sair (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
};

export default AdminLayout;
