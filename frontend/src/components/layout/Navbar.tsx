import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, ListTodo, Zap, Trash2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications';
import { useInvitations } from '../../hooks/useInvitations';
import Button from '../ui/Button';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifData } = useNotifications();
  const { data: invitations = [] } = useInvitations();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const totalNotifications = (notifData?.unreadCount || 0) + invitations.length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: ListTodo }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TaskFlow</span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 status-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500 font-medium">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-96 overflow-y-auto z-20 fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-900">Notifications</span>
                    {notifData?.unreadCount ? (
                      <button
                        onClick={() => markAllAsRead.mutate()}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>

                  {/* Invitations Section */}
                  {invitations.length > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📋</span>
                          <span className="text-sm font-semibold text-indigo-900">
                            Task Invitations ({invitations.length})
                          </span>
                        </div>
                      </div>
                      {invitations.slice(0, 3).map((inv) => (
                        <Link
                          key={inv._id}
                          to="/dashboard"
                          onClick={() => setIsNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-indigo-50 transition-colors border-l-2 border-indigo-500"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm mt-0.5">📋</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 font-medium line-clamp-1">{inv.taskId.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                <span className="font-medium text-indigo-600">{inv.fromUserId.name}</span>
                                <span className="text-gray-500"> wants you to work on this</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {invitations.length > 3 && (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsNotifOpen(false)}
                          className="block px-4 py-2 text-center text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                        >
                          View all {invitations.length} invitations →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Regular Notifications */}
                  {notifData?.notifications?.length ? (
                    notifData.notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id}
                        className={`group px-4 py-3 hover:bg-gray-50 transition-colors relative ${
                          !notif.read ? 'bg-indigo-50/50 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-800 pr-6">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => deleteNotification.mutate(notif._id)}
                          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : invitations.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
