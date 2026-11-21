import React, { useState, useEffect, useRef } from 'react';
import { Complaint, ChatMessage } from '../types';
import { adminApi } from '../api';
import {
  MessageSquare, Send, CheckCircle2, AlertCircle, Clock,
  Phone, Mail, User, Search, RefreshCw, X, ShieldCheck,
  CheckCheck, Check, Paperclip, MessageCircle, FileText
} from 'lucide-react';

const CANNED_REPLIES = [
  'Thank you for reaching out to MaxiTShop Support. We have received your inquiry and are reviewing the details.',
  'Your warranty request has been acknowledged. Our technical team is inspecting the product details.',
  'We have updated your order status. You will receive a follow-up confirmation shortly.',
  'Could you please share your order number or a photo of the product serial number so we can assist you faster?',
  'Your issue has been resolved. If you need any further assistance, please let us know.'
];

export const ComplaintsView: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'investigating' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Chat reply state
  const [replyText, setReplyText] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [sending, setSending] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplaints();
      setComplaints(data);
      // If a complaint is currently opened in modal, keep its active state fresh
      if (selectedComplaint) {
        const fresh = data.find(c => c.id === selectedComplaint.id);
        if (fresh) setSelectedComplaint(fresh);
      }
    } catch (err: any) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // Poll every 30 seconds for live new incoming messages
    const timer = setInterval(() => {
      adminApi.getComplaints().then(data => {
        setComplaints(data);
        if (selectedComplaint) {
          const fresh = data.find(c => c.id === selectedComplaint.id);
          if (fresh) setSelectedComplaint(fresh);
        }
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedComplaint) {
      scrollToBottom();
      setAdminNotes(selectedComplaint.adminNotes || '');
    }
  }, [selectedComplaint?.messages?.length, selectedComplaint?.id]);

  // Open Chat Modal and automatically mark as read
  const handleOpenChat = async (c: Complaint) => {
    setSelectedComplaint(c);
    setReplyText('');
    setAdminNotes(c.adminNotes || '');

    // Default email toggle to true if customer has email
    const hasEmail = !!c.email || /Email:\s*([^\s\n]+)/i.test(c.description || '');
    setSendEmail(hasEmail);

    // If unread, immediately mark read locally & on backend
    if (!c.isRead) {
      setComplaints(prev => prev.map(item => item.id === c.id ? { ...item, isRead: true } : item));
      try {
        await adminApi.markComplaintRead(c.id, true);
      } catch (err) {
        console.warn('Failed to mark read on server:', err);
      }
    }
  };

  // Toggle Read / Unread from table
  const handleToggleRead = async (e: React.MouseEvent, c: Complaint) => {
    e.stopPropagation();
    const newReadState = !c.isRead;
    setComplaints(prev => prev.map(item => item.id === c.id ? { ...item, isRead: newReadState } : item));
    try {
      await adminApi.markComplaintRead(c.id, newReadState);
      if (selectedComplaint?.id === c.id) {
        setSelectedComplaint(prev => prev ? { ...prev, isRead: newReadState } : null);
      }
    } catch (err: any) {
      alert('Failed to update read state: ' + err.message);
    }
  };

  // Update Status
  const handleUpdateStatus = async (cId: string, newStatus: 'new' | 'investigating' | 'resolved') => {
    try {
      const updated = await adminApi.updateComplaintStatus(cId, newStatus);
      setComplaints(prev => prev.map(c => c.id === cId ? { ...c, status: newStatus, isRead: newStatus === 'resolved' ? true : c.isRead } : c));
      if (selectedComplaint?.id === cId) {
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus, isRead: newStatus === 'resolved' ? true : prev.isRead } : null);
      }
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Send Reply from Chat System
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedComplaint || !replyText.trim() || sending) return;

    const messageText = replyText.trim();
    const compId = selectedComplaint.id;
    setSending(true);

    try {
      const res = await adminApi.sendComplaintReply(compId, {
        text: messageText,
        sendEmail,
        sendSms,
        channel: sendEmail ? 'email' : sendSms ? 'sms' : 'web'
      });

      // Optimistic or confirmed update
      setSelectedComplaint(res);
      setComplaints(prev => prev.map(c => c.id === compId ? res : c));
      setReplyText('');
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedComplaint) return;
    try {
      setSavingNotes(true);
      await adminApi.updateComplaintStatus(selectedComplaint.id, selectedComplaint.status, adminNotes);
      setSelectedComplaint(prev => prev ? { ...prev, adminNotes } : null);
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, adminNotes } : c));
    } catch (err: any) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Filter complaints
  const unreadCount = complaints.filter(c => !c.isRead).length;
  const investigatingCount = complaints.filter(c => c.status === 'investigating').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const filteredComplaints = complaints.filter(c => {
    // Tab filter
    if (activeTab === 'unread' && c.isRead) return false;
    if (activeTab === 'investigating' && c.status !== 'investigating') return false;
    if (activeTab === 'resolved' && c.status !== 'resolved') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchId = c.id?.toLowerCase().includes(q);
      const matchOrder = c.orderId?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchMessages = c.messages?.some(m => m.text?.toLowerCase().includes(q));
      return matchName || matchPhone || matchEmail || matchId || matchOrder || matchDesc || matchMessages;
    }
    return true;
  });

  return (
    <div>
      {/* 1. Header & Live Inbox Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Customer Messages &amp; Support Chat
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: '#ff6600',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                letterSpacing: '0.5px'
              }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Unified chat inbox to inspect inquiries, warranty claims, and reply directly to customers.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchComplaints}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* 2. Search & Tab Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '18px'
      }}>
        {/* Segmented Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.15s'
            }}
          >
            All Messages ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'unread' ? '#ff6600' : '#fff7ed',
              color: activeTab === 'unread' ? '#ffffff' : '#ea580c',
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Unread</span>
            <span style={{
              background: activeTab === 'unread' ? 'rgba(255,255,255,0.3)' : '#ffedd5',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {unreadCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('investigating')}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'investigating' ? '#0284c7' : '#f0f9ff',
              color: activeTab === 'investigating' ? '#ffffff' : '#0369a1',
              transition: 'all 0.15s'
            }}
          >
            In Progress ({investigatingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'resolved' ? '#16a34a' : '#f0fdf4',
              color: activeTab === 'resolved' ? '#ffffff' : '#15803d',
              transition: 'all 0.15s'
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px', height: '36px' }}
            placeholder="Search by customer, phone, text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Messages List Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>Status</th>
              <th>Ticket ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Order / Subject</th>
              <th>Latest Message</th>
              <th>Ticket Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && complaints.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>Loading customer messages...</td></tr>
            ) : filteredComplaints.length > 0 ? (
              filteredComplaints.map(c => {
                const isUnread = !c.isRead;
                const lastMsg = c.messages && c.messages.length > 0
                  ? c.messages[c.messages.length - 1]
                  : null;
                const previewText = lastMsg ? lastMsg.text : c.description;

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenChat(c)}
                    style={{
                      cursor: 'pointer',
                      background: isUnread ? '#fffaf5' : undefined,
                      transition: 'background 0.15s'
                    }}
                    className={isUnread ? 'unread-row' : ''}
                  >
                    {/* Unread indicator */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(e, c)}
                        title={isUnread ? 'Mark as read' : 'Mark as unread'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isUnread ? (
                          <span style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#ff6600',
                            boxShadow: '0 0 0 3px rgba(255, 102, 0, 0.2)'
                          }} />
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#cbd5e1'
                          }} />
                        )}
                      </button>
                    </td>

                    {/* Ticket ID */}
                    <td style={{ fontWeight: 700, color: '#ff6600', fontSize: '13px' }}>
                      {c.id}
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: isUnread ? 700 : 600, color: '#0f172a' }}>{c.name}</div>
                      {c.email && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{c.email}</div>
                      )}
                    </td>

                    {/* Phone */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <a
                        href={`tel:${c.phone}`}
                        onClick={e => e.stopPropagation()}
                        style={{ color: '#334155', textDecoration: 'none', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Phone size={12} style={{ color: '#ff6600' }} />
                        <span>{c.phone}</span>
                      </a>
                    </td>

                    {/* Order / Subject */}
                    <td>
                      {c.orderId ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          color: '#334155'
                        }}>
                          {c.orderId}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>General</span>
                      )}
                    </td>

                    {/* Message Preview */}
                    <td style={{ maxWidth: '280px', fontSize: '12px', color: isUnread ? '#0f172a' : '#475569' }}>
                      <div style={{
                        maxHeight: '38px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontWeight: isUnread ? 600 : 400
                      }}>
                        {previewText}
                      </div>
                      {c.messages && c.messages.length > 1 && (
                        <span style={{ fontSize: '10px', color: '#ff6600', fontWeight: 600 }}>
                          {c.messages.length} messages
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge ${c.status === 'resolved' ? 'badge-delivered' : c.status === 'investigating' ? 'badge-confirmed' : 'badge-pending'}`}>
                        {c.status === 'investigating' ? 'In Progress' : c.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(c.lastMessageAt || c.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(c);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '4px 10px'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>Chat / Reply</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No customer messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Center Chat Pop-Up System */}
      {selectedComplaint && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div
            className="modal-content"
            style={{
              width: '780px',
              maxWidth: '96vw',
              height: '88vh',
              maxHeight: '820px',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              background: '#0B1528',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {/* Customer Avatar Circle */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6600, #ff8533)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(255, 102, 0, 0.4)'
                }}>
                  {selectedComplaint.name ? selectedComplaint.name.charAt(0).toUpperCase() : 'C'}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedComplaint.name}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.15)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      color: '#cbd5e1'
                    }}>
                      #{selectedComplaint.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8', marginTop: '3px', flexWrap: 'wrap' }}>
                    <a
                      href={`tel:${selectedComplaint.phone}`}
                      style={{ color: '#cbd5e1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Phone size={12} style={{ color: '#ff6600' }} />
                      <span>{selectedComplaint.phone}</span>
                    </a>
                    {selectedComplaint.email && (
                      <a
                        href={`mailto:${selectedComplaint.email}`}
                        style={{ color: '#cbd5e1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Mail size={12} style={{ color: '#38bdf8' }} />
                        <span>{selectedComplaint.email}</span>
                      </a>
                    )}
                    {selectedComplaint.orderId && (
                      <span style={{ color: '#cbd5e1' }}>
                        Ref: <strong>{selectedComplaint.orderId}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Status Selector Dropdown */}
                <select
                  value={selectedComplaint.status}
                  onChange={(e) => handleUpdateStatus(selectedComplaint.id, e.target.value as any)}
                  style={{
                    background: selectedComplaint.status === 'resolved' ? '#16a34a' : selectedComplaint.status === 'investigating' ? '#0284c7' : '#ff6600',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="new">Status: New</option>
                  <option value="investigating">Status: In Progress</option>
                  <option value="resolved">Status: Resolved</option>
                </select>

                {/* Mark as Unread Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleRead(e, selectedComplaint)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title={selectedComplaint.isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  {selectedComplaint.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Message Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Ticket Created Banner */}
              <div style={{ textAlign: 'center', margin: '4px 0 12px 0' }}>
                <span style={{
                  background: '#e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 12px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={11} />
                  Ticket opened on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Render Message History */}
              {selectedComplaint.messages && selectedComplaint.messages.length > 0 ? (
                selectedComplaint.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id || idx} style={{ textAlign: 'center', margin: '4px 0' }}>
                        <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 10px', borderRadius: '10px' }}>
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Sender Info Line */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: '#64748b',
                        marginBottom: '4px',
                        padding: isAdmin ? '0 4px 0 0' : '0 0 0 4px'
                      }}>
                        {isAdmin ? (
                          <>
                            <ShieldCheck size={12} style={{ color: '#0284c7' }} />
                            <strong>{msg.senderName || 'MaxiTShop Support'}</strong>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.channel === 'email' && (
                              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>
                                via Email
                              </span>
                            )}
                            {msg.channel === 'sms' && (
                              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>
                                via SMS
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <User size={12} style={{ color: '#ff6600' }} />
                            <strong>{msg.senderName || selectedComplaint.name}</strong>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        )}
                      </div>

                      {/* Bubble Card */}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isAdmin ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isAdmin ? '#0B1528' : '#ffffff',
                        color: isAdmin ? '#ffffff' : '#0f172a',
                        border: isAdmin ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {msg.text}

                        {/* Attachments if any */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ marginTop: '10px', borderTop: isAdmin ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9', paddingTop: '8px' }}>
                            {msg.attachments.map((att, aIdx) => (
                              <a
                                key={aIdx}
                                href={att}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  color: isAdmin ? '#38bdf8' : '#ff6600',
                                  textDecoration: 'underline'
                                }}
                              >
                                <Paperclip size={12} />
                                View Attachment {aIdx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback if no messages */
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '13px',
                  lineHeight: 1.6
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedComplaint.description}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Modal Bottom: Quick Canned Replies & Internal Notes Toggle */}
            <div style={{
              background: '#f1f5f9',
              padding: '8px 16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '12px'
            }}>
              {/* Quick Canned Responses */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Quick Reply:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setReplyText(prev => prev ? `${prev}\n${e.target.value}` : e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#334155',
                    maxWidth: '240px'
                  }}
                >
                  <option value="">— Insert template message —</option>
                  {CANNED_REPLIES.map((r, i) => (
                    <option key={i} value={r}>{r.slice(0, 42)}...</option>
                  ))}
                </select>
              </div>

              {/* Delivery Channels Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={e => setSendEmail(e.target.checked)}
                    disabled={!selectedComplaint.email}
                    style={{ accentColor: '#ff6600' }}
                  />
                  <span>Send via Email {selectedComplaint.email ? `(${selectedComplaint.email})` : '(No email)'}</span>
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={e => setSendSms(e.target.checked)}
                    style={{ accentColor: '#ff6600' }}
                  />
                  <span>Send via SMS ({selectedComplaint.phone})</span>
                </label>
              </div>
            </div>

            {/* Modal Footer: Reply Composer */}
            <form onSubmit={handleSendReply} style={{
              padding: '14px 18px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end',
              flexShrink: 0
            }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder={`Type your reply to ${selectedComplaint.name}... (Press Enter to send, Shift+Enter for new line)`}
                rows={2}
                className="form-textarea"
                style={{
                  flex: 1,
                  resize: 'none',
                  fontSize: '13px',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1'
                }}
              />

              <button
                type="submit"
                disabled={!replyText.trim() || sending}
                className="btn btn-primary"
                style={{
                  height: '48px',
                  padding: '0 20px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                <Send size={15} />
                <span>{sending ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </form>

            {/* Internal Resolution Notes Section */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Internal Notes:</span>
              <input
                type="text"
                placeholder="e.g. Called customer on 21/11, replacement arranged."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                style={{
                  flex: 1,
                  height: '30px',
                  fontSize: '12px',
                  padding: '0 10px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px'
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{ height: '30px', padding: '0 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                {savingNotes ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
