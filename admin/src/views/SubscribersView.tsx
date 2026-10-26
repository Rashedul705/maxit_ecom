import React, { useState, useEffect } from 'react';
import { Subscriber } from '../types';
import { adminApi } from '../api';
import { Download, Mail } from 'lucide-react';

export const SubscribersView: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const list = await adminApi.getSubscribers();
      setSubscribers(list);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleExportCSV = () => {
    if (!subscribers.length) return alert('No subscribers to export');
    const csvContent = 'data:text/csv;charset=utf-8,Email,Date\n' +
      subscribers.map(s => `${s.email},${new Date(s.subscribedAt).toISOString()}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `maxitshop_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Newsletter Subscribers</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Customer email list registered via the footer subscribe widget.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      <div className="table-card" style={{ maxWidth: '700px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email Address</th>
              <th>Subscription Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '30px' }}>Loading subscribers...</td></tr>
            ) : subscribers.length > 0 ? (
              subscribers.map((s, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} color="#ff6600" /> {s.email}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(s.subscribedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
