import React from 'react';
import { User, Bell, ExternalLink } from 'lucide-react';

interface HeaderProps {
  user: any;
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ user, currentTab }) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'orders': return 'Customer Orders';
      case 'products': return 'Products Catalog';
      case 'categories': return 'Categories';
      case 'brands': return 'Brands';
      case 'banners': return 'Hero Banners';
      case 'complaints': return 'Complaints & Disputes';
      case 'sellers': return 'Sellers Directory';
      case 'pages': return 'Policy & CMS Pages';
      case 'subscribers': return 'Newsletter Subscribers';
      case 'settings': return 'Site Settings';
      default: return 'Admin Portal';
    }
  };

  return (
    <header className="admin-header no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{getTitle()}</h3>
        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
          Live API: Connected
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a
          href="http://localhost:3001"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={14} /> Open Store
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ff6600',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {user?.name || 'MaxiTShop Administrator'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {user?.email || 'admin@maxitshop.com'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
