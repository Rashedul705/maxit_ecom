import React from 'react';
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

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onLogout }) => {
  const { hasPermission } = usePermission();

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'reports.view' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'orders.view' },
    { id: 'products', label: 'Products', icon: Package, permission: 'products.view' },
    { id: 'categories', label: 'Categories', icon: Layers, permission: 'categories.view' },
    { id: 'subcategories', label: 'Subcategories', icon: FolderTree, permission: 'categories.view' },
    { id: 'brands', label: 'Brands', icon: Award, permission: 'products.view' },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon, permission: 'banners.view' },
    { id: 'coupons', label: 'Coupons & Deals', icon: Tag, permission: 'coupons.view' },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare, permission: 'reviews.view' },
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
        <span className="brand-badge">ADMIN</span>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>MaxiTShop</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Management Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
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
