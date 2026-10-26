import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { adminApi } from '../api';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const ComplaintsView: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<'new' | 'investigating' | 'resolved'>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolveModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setStatus(c.status);
    setAdminNotes(c.adminNotes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setUpdating(true);
      await adminApi.updateComplaintStatus(selectedComplaint.id, status, adminNotes);
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Customer Complaints & Disputes</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Resolve customer warranty issues, courier damage claims, and inquiries.</p>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Order Ref</th>
              <th>Complaint Details</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>Loading complaints...</td></tr>
            ) : complaints.length > 0 ? (
              complaints.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#ff6600' }}>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>📞 {c.phone}</td>
                  <td>{c.orderId ? <strong>{c.orderId}</strong> : <span style={{ color: '#94a3b8' }}>None</span>}</td>
                  <td style={{ maxWidth: '280px', fontSize: '13px' }}>
                    <div style={{ maxHeight: '44px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'resolved' ? 'badge-delivered' : c.status === 'investigating' ? 'badge-confirmed' : 'badge-pending'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openResolveModal(c)}>
                      Review / Status
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No complaints filed.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Review Complaint #{selectedComplaint.id}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', marginBottom: '4px' }}>Customer: <strong>{selectedComplaint.name}</strong> ({selectedComplaint.phone})</p>
                  <p style={{ fontSize: '13px', marginBottom: '4px' }}>Order ID: <strong>{selectedComplaint.orderId || 'N/A'}</strong></p>
                  <p style={{ fontSize: '13px', marginTop: '10px', color: '#334155' }}>Problem Description:</p>
                  <blockquote style={{ background: '#fff', borderLeft: '3px solid #ff6600', padding: '10px 14px', margin: '6px 0', fontSize: '13px' }}>
                    {selectedComplaint.description}
                  </blockquote>
                  {selectedComplaint.image && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Attached Image:</p>
                      <a href={selectedComplaint.image} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#ff6600' }}>
                        View Attachment &rarr;
                      </a>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                  >
                    <option value="new">New (Unreviewed)</option>
                    <option value="investigating">Investigating / In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Resolution Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. Called customer on 26/10, warranty replacement dispatched."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
