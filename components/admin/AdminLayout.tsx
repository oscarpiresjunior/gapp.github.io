
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brazil-blue text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold text-brazil-yellow">GApp Admin</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 hover:text-brazil-yellow"
              >
                Dashboard
              </Link>
            </li>
            {/* Add more admin links here if needed */}
          </ul>
        </nav>
        <div className="absolute bottom-6 left-6 w-52">
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
