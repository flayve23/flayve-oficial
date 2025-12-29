import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.tsx';
import { LogOut, Home, Video, CreditCard, User, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const streamerLinks = [
    { name: 'Dashboard', path: '/dashboard/streamer', icon: LayoutDashboard },
    { name: 'Ganhos', path: '/dashboard/streamer/earnings', icon: CreditCard },
    { name: 'Perfil', path: '/dashboard/streamer/profile', icon: User },
    { name: 'Verificação', path: '/dashboard/streamer/kyc', icon: User },
  ];

  const viewerLinks = [
    { name: 'Explorar', path: '/dashboard/viewer', icon: Home },
    { name: 'Saldo', path: '/dashboard/viewer/wallet', icon: CreditCard },
  ];

  const links = user?.role === 'streamer' ? streamerLinks : viewerLinks;

  return (
    <div className="min-h-screen bg-dark-900 flex text-gray-100 font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-dark-800 border-r border-dark-700">
        <div className="p-6">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
            FLAYVE
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {user?.role === 'streamer' ? 'Painel Creator' : 'Viewer Area'}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary-600/10 text-primary-400'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
              }`}
            >
              <link.icon className={`h-5 w-5 mr-3 ${isActive(link.path) ? 'text-primary-400' : 'text-gray-500'}`} />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-dark-800 border-b border-dark-700 z-50 px-4 py-3 flex justify-between items-center">
         <h1 className="text-xl font-black text-primary-500">FLAYVE</h1>
         <button onClick={logout} className="text-gray-400">
           <LogOut className="h-6 w-6" />
         </button>
      </div>

      <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-y-auto bg-dark-900 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-dark-800 border-t border-dark-700 flex justify-around p-2 pb-safe z-40">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center p-2 rounded-lg ${
              isActive(link.path) ? 'text-primary-400' : 'text-gray-500'
            }`}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-[10px] mt-1">{link.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
