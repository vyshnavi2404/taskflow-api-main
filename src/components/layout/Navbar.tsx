import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  FolderOpen, 
  LogOut, 
  User,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";

interface User {
  fullName: string;
  email: string;
  role: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const showBackButton = location.pathname !== '/dashboard';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
            >
              <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Projects</span>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant={isActive('/profile') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.fullName}</span>
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;