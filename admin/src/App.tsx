import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { OrdersView } from './views/OrdersView';
import { ProductsView } from './views/ProductsView';
import { CategoriesView } from './views/CategoriesView';
import { SubcategoriesView } from './views/SubcategoriesView';
import { BrandsView } from './views/BrandsView';
import { BannersView } from './views/BannersView';
import { ComplaintsView } from './views/ComplaintsView';
import { SellersView } from './views/SellersView';
import { PagesView } from './views/PagesView';
import { SubscribersView } from './views/SubscribersView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';
import { CouponsView } from './views/CouponsView';
import { adminApi } from './api';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const handleLogoutEvent = () => setUser(null);
    window.addEventListener('admin-logout', handleLogoutEvent);

    const token = localStorage.getItem('maxit_admin_token');
    const storedUser = localStorage.getItem('maxit_admin_user');

    if (!token) {
      setCheckedAuth(true);
      return () => window.removeEventListener('admin-logout', handleLogoutEvent);
    }

    // Verify token with backend
    adminApi.verify()
      .then(res => {
        if (res && res.valid) {
          const parsedUser = storedUser ? JSON.parse(storedUser) : (res.user || { name: 'Admin', email: 'admin@maxitshop.com' });
          setUser(parsedUser);
        } else {
          localStorage.removeItem('maxit_admin_token');
          localStorage.removeItem('maxit_admin_user');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('maxit_admin_token');
        localStorage.removeItem('maxit_admin_user');
        setUser(null);
      })
      .finally(() => {
        setCheckedAuth(true);
      });

    return () => window.removeEventListener('admin-logout', handleLogoutEvent);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('maxit_admin_token');
    localStorage.removeItem('maxit_admin_user');
    setUser(null);
  };

  if (!checkedAuth) return null;

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'orders':
        return <OrdersView />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'subcategories':
        return <SubcategoriesView />;
      case 'brands':
        return <BrandsView />;
      case 'banners':
        return <BannersView />;
      case 'coupons':
        return <CouponsView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'sellers':
        return <SellersView />;
      case 'pages':
        return <PagesView />;
      case 'subscribers':
        return <SubscribersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onLogout={handleLogout}
      />
      <div className="admin-main">
        <Header user={user} currentTab={currentTab} />
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
