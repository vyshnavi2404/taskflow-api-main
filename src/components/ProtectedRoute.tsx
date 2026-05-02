import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token with the API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or API unavailable
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;