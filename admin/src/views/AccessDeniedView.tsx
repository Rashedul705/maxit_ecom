import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';

interface AccessDeniedViewProps {
  requiredPermission?: string;
  onNavigate?: (tab: string) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredPermission,
  onNavigate
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#dc2626',
        marginBottom: '20px'
      }}>
        <ShieldAlert size={38} strokeWidth={2.2} />
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 12px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        background: '#fee2e2',
        color: '#b91c1c',
        marginBottom: '12px'
      }}>
        403 Access Denied
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
        Restricted Access Area
      </h2>

      <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '440px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
        You do not have the required permissions to view or interact with this section of the MaxiTShop Management Portal.
      </p>

      {requiredPermission && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 16px',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#334155',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontWeight: 600, color: '#64748b' }}>Required Privilege:</span>
          <code style={{
            fontFamily: 'monospace',
            background: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            color: '#dc2626',
            fontWeight: 700
          }}>
            {requiredPermission}
          </code>
        </div>
      )}

      {onNavigate && (
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Home size={15} />
            Return to Dashboard
          </button>
        </div>
      )}

      <p style={{ marginTop: '28px', fontSize: '11.5px', color: '#94a3b8' }}>
        Need access? Contact the platform Super Admin to assign this module to your moderator account.
      </p>
    </div>
  );
};

export default AccessDeniedView;
