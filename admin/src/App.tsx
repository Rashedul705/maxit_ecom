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
import { ModeratorsView } from './views/ModeratorsView';
import { AccessDeniedView } from './views/AccessDeniedView';
import { PermissionProvider } from './context/PermissionContext';
import { adminApi } from './api';

export const VALID_TABS = [
  'dashboard',
  'orders',
  'products',
  'categories',
  'subcategories',
  'brands',
  'banners',
  'coupons',
  'complaints',
  'sellers',
  'pages',
  'subscribers',
  'moderators',
  'settings'
] as const;

export type AdminTab = typeof VALID_TABS[number];

export const TAB_PERMISSIONS: Record<AdminTab, string> = {
  dashboard: 'reports.view',
  orders: 'orders.view',
  products: 'products.view',
  categories: 'categories.view',
  subcategories: 'categories.view',
  brands: 'products.view',
  banners: 'banners.view',
  coupons: 'coupons.view',
  complaints: 'reviews.view',
  sellers: 'customers.view',
  pages: 'settings.view',
  subscribers: 'customers.view',
  moderators: 'users.manage',
  settings: 'settings.view'
};

function userHasPermission(user: any, permissionKey: string): boolean {
  if (!user) return false;
  if (user.isActive === false) return false;
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  if (!permissionKey) return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.includes(permissionKey);
}

function parseTab(value?: string | null): AdminTab | null {
  if (!value) return null;
  const clean = value.toLowerCase().trim();
  return (VALID_TABS as readonly string[]).includes(clean) ? (clean as AdminTab) : null;
}

function getInitialTab(): AdminTab {
  // 1. From Pathname (e.g. /admin/orders or /admin/subcategories or /orders)
  try {
    const path = window.location.pathname.replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);
    const adminIdx = segments.indexOf('admin');
    if (adminIdx !== -1 && segments[adminIdx + 1]) {
      const parsed = parseTab(segments[adminIdx + 1]);
      if (parsed) return parsed;
    } else if (segments.length > 0) {
      const parsed = parseTab(segments[segments.length - 1]);
      if (parsed) return parsed;
    }
  } catch (_) {}

  // 2. From URL Hash (e.g. #orders or #/orders)
  try {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    const cleanHash = rawHash.split('?')[0].split('/')[0];
    const parsed = parseTab(cleanHash);
    if (parsed) return parsed;
  } catch (_) {}

  // 3. From URL Search Param (e.g. ?tab=orders)
  try {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseTab(params.get('tab'));
    if (parsed) return parsed;
  } catch (_) {}

  // 4. From localStorage
  try {
    const stored = parseTab(localStorage.getItem('maxit_admin_tab'));
    if (stored) return stored;
  } catch (_) {}

  // 5. Default
  return 'dashboard';
}

function updateUrlAndTitle(tab: AdminTab, replace = false) {
  try {
    const isSubPath = tab !== 'dashboard';
    const currentPath = window.location.pathname;
    const hasAdminPrefix = currentPath.startsWith('/admin') || currentPath === '/admin';

    const newPath = hasAdminPrefix
      ? (isSubPath ? `/admin/${tab}` : '/admin')
      : (isSubPath ? `/${tab}` : '/');

    if (window.location.pathname !== newPath) {
      if (replace) {
        window.history.replaceState({ tab }, '', newPath);
      } else {
        window.history.pushState({ tab }, '', newPath);
      }
    }

    const formattedTitle = tab.charAt(0).toUpperCase() + tab.slice(1);
    document.title = `MaxiTShop Admin - ${formattedTitle}`;
  } catch (_) {}
}

export function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<AdminTab>(getInitialTab);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Sync initial URL and title on mount
  useEffect(() => {
    updateUrlAndTitle(currentTab, true);
    try {
      localStorage.setItem('maxit_admin_tab', currentTab);
    } catch (_) {}
  }, []);

  // Listen for browser Back/Forward (popstate) and hash changes
  useEffect(() => {
    const handleUrlChange = (e?: any) => {
      const tabFromState = e && 'state' in e && e.state?.tab ? parseTab(e.state.tab) : null;
      const tab = tabFromState || getInitialTab();
      setCurrentTab(tab);
      try {
        localStorage.setItem('maxit_admin_tab', tab);
      } catch (_) {}
      updateUrlAndTitle(tab, true);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleSelectTab = (tab: string, replace = false) => {
    const valid = parseTab(tab) || 'dashboard';
    setCurrentTab(valid);
    try {
      localStorage.setItem('maxit_admin_tab', valid);
    } catch (_) {}
    updateUrlAndTitle(valid, replace);
  };

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
          const freshUser = res.user || (storedUser ? JSON.parse(storedUser) : { name: 'Admin', email: 'admin@maxitshop.com', role: 'super_admin' });
          setUser(freshUser);
          try {
            localStorage.setItem('maxit_admin_user', JSON.stringify(freshUser));
          } catch (_) {}
        } else {
          localStorage.removeItem('maxit_admin_token');
          localStorage.removeItem('maxit_admin_user');
          localStorage.removeItem('maxit_admin_tab');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('maxit_admin_token');
        localStorage.removeItem('maxit_admin_user');
        localStorage.removeItem('maxit_admin_tab');
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
    localStorage.removeItem('maxit_admin_tab');
    setUser(null);
    updateUrlAndTitle('dashboard', true);
  };

  if (!checkedAuth) return null;

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    const requiredPermission = TAB_PERMISSIONS[currentTab];
    if (requiredPermission && !userHasPermission(user, requiredPermission)) {
      return (
        <AccessDeniedView
          requiredPermission={requiredPermission}
          onNavigate={(tab) => handleSelectTab(tab)}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => handleSelectTab(tab)} />;
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
      case 'moderators':
        return <ModeratorsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => handleSelectTab(tab)} />;
    }
  };

  return (
    <PermissionProvider user={user}>
      <div className="admin-layout">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => handleSelectTab(tab)}
          onLogout={handleLogout}
        />
        <div className="admin-main">
          <Header user={user} currentTab={currentTab} />
          <main className="admin-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}

export default App;
