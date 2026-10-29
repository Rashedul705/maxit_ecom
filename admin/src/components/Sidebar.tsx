import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
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
  Tag
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'brands', label: 'Brands', icon: Award },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'coupons', label: 'Coupons & Deals', icon: Tag },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'sellers', label: 'Sellers', icon: Users },
    { id: 'pages', label: 'Policy Pages', icon: FileText },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <aside className="admin-sidebar no-print">
      <div className="sidebar-brand">
        <span className="brand-badge">ADMIN</span>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            maxitshop
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Management Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
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
