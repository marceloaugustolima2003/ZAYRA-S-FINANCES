import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { UserAccount } from './types/finance';
import { getActiveUserId, setActiveUserId, clearActiveUserId, getUserById } from './data/mockData';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getActiveUserId());
  const [authView, setAuthView] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/register' || hash === '#register') return 'register';
    }
    return 'login';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/login' || hash === '#login' || path === '/register' || hash === '#register') {
        return false;
      }
    }
    const initialId = getActiveUserId();
    return !!initialId && !!getUserById(initialId);
  });

  // Handle URL hash and popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/register' || hash === '#register') {
        setIsAuthenticated(false);
        setAuthView('register');
      } else if (path === '/login' || hash === '#login') {
        setIsAuthenticated(false);
        setAuthView('login');
      } else {
        const id = getActiveUserId();
        if (id && getUserById(id)) {
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUserId(user.id);
    setActiveUserId(user.id);
    setIsAuthenticated(true);
    if (window.location.hash === '#login' || window.location.hash === '#register') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleRegisterSuccess = (newUser: UserAccount) => {
    setCurrentUserId(newUser.id);
    setActiveUserId(newUser.id);
    setIsAuthenticated(true);
    if (window.location.hash === '#register' || window.location.hash === '#login') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    setActiveUserId(userId);
  };

  const handleOpenRegister = () => {
    setIsAuthenticated(false);
    setAuthView('register');
    window.location.hash = 'register';
  };

  const handleGoToLogin = () => {
    setIsAuthenticated(false);
    setAuthView('login');
    window.location.hash = 'login';
  };

  const handleLogout = () => {
    clearActiveUserId();
    setCurrentUserId(null);
    setIsAuthenticated(false);
    setAuthView('login');
    window.location.hash = 'login';
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {isAuthenticated && currentUserId ? (
        <Dashboard
          currentUserId={currentUserId}
          onSwitchUser={handleSwitchUser}
          onOpenRegister={handleOpenRegister}
          onLogout={handleLogout}
        />
      ) : authView === 'register' ? (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={handleGoToLogin}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={handleOpenRegister}
        />
      )}
    </div>
  );
}
