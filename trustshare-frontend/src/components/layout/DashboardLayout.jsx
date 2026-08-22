import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference to track clicks outside the menu
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL path

  // Helper function to check if a sidebar link is active
  const isActive = (path) => location.pathname === path;

  // Essential UX: Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout(); // Now awaits the backend cookie clearing
    navigate('/'); 
  };

  return (
    <div className="flex h-screen bg-zinc-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center justify-center border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">TrustShare</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/dashboard" 
            className={`block px-4 py-2.5 rounded-lg transition-all duration-200 ${
              isActive('/dashboard') 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className={`block px-4 py-2.5 rounded-lg transition-all duration-200 ${
              isActive('/profile') 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            Profile
          </Link>
          <Link 
            to="/settings" 
            className={`block px-4 py-2.5 rounded-lg transition-all duration-200 ${
              isActive('/settings') 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm z-0">
          <h2 className="text-lg font-semibold text-zinc-800">
            Welcome back, {user?.name || 'User'}
          </h2>
          
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Notifications
            </button>
            
            {/* User Avatar Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent hover:ring-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>

            {/* The Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-zinc-200 divide-y divide-zinc-100 origin-top-right transform transition-all">
                <div className="px-4 py-3 bg-zinc-50 rounded-t-lg">
                  <p className="text-xs text-zinc-500">Signed in as</p>
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {user?.email || 'user@company.com'}
                  </p>
                </div>
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-blue-600 transition-colors"
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-blue-600 transition-colors"
                  >
                    Settings
                  </Link>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 sm:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}