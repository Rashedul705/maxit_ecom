import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  ShoppingBag,
  Award,
  Image as ImageIcon,
  MessageSquare,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { usePermission } from '../context/PermissionContext';
import { adminApi } from '../api';
import logoImg from '../assets/logo.png';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onLogout }) => {
  const { hasPermission } = usePermission();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    const checkUnread = () => {
      adminApi.getComplaints().then(data => {
        const unread = data.filter(c => !c.isRead).length;
        setUnreadMessages(unread);
      }).catch(() => {});
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'reports.view' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'orders.view' },
    { id: 'products', label: 'Products', icon: Package, permission: 'products.view' },
    { id: 'categories', label: 'Categories', icon: Layers, permission: 'categories.view' },
    { id: 'subcategories', label: 'Subcategories', icon: FolderTree, permission: 'categories.view' },
    { id: 'brands', label: 'Brands', icon: Award, permission: 'products.view' },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon, permission: 'banners.view' },
    { id: 'coupons', label: 'Coupons & Deals', icon: Tag, permission: 'coupons.view' },
    { id: 'complaints', label: 'Messages & Support', icon: MessageSquare, permission: 'reviews.view' },
    { id: 'sellers', label: 'Sellers', icon: Users, permission: 'customers.view' },
    { id: 'subscribers', label: 'Subscribers', icon: Mail, permission: 'customers.view' },
    { id: 'moderators', label: 'Moderators & Access', icon: ShieldCheck, permission: 'users.manage' },
    { id: 'pages', label: 'Policy Pages', icon: FileText, permission: 'settings.view' },
    { id: 'settings', label: 'Site Settings', icon: Settings, permission: 'settings.view' },
  ];

  const visibleMenuItems = allMenuItems.filter(item => hasPermission(item.permission));

  return (
    <aside className="admin-sidebar no-print">
      <div className="sidebar-brand">
        <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <img src={logoImg} alt="MAXIT" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <span className="brand-badge">ADMIN</span>
      </div>

      <nav className="sidebar-nav">
        {visibleMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const showBadge = item.id === 'complaints' && unreadMessages > 0;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}
            >
              <Icon size={17} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {showBadge && (
                <span style={{
                  background: '#ff6600',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: 1
                }}>
                  {unreadMessages}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <a
          href="http://localhost:3001"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ padding: '8px 12px', fontSize: '13px' }}
        >
          <ExternalLink size={16} /> Live Storefront
        </a>
        <button
          className="nav-item"
          style={{ color: '#ef4444', padding: '8px 12px', fontSize: '13px' }}
          onClick={onLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};
