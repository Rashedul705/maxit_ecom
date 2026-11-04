import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  History,
  Users,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  Sparkles,
  CheckSquare,
  Square,
  Check,
  X
} from 'lucide-react';
import { ModeratorUser, ActivityLogEntry } from '../types';
import { adminApi } from '../api';
import {
  PERMISSION_GROUPS,
  PERMISSIONS,
  PRESETS,
  ASSIGNABLE_PERMISSIONS,
  ASSIGNABLE_KEYS,
  PermissionItem
} from '../lib/permissions';

export const ModeratorsView: React.FC = () => {
  const [moderators, setModerators] = useState<ModeratorUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'audit'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionFilter, setPermissionFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<ModeratorUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: [] as string[],
    isActive: true
  });

  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getModerators();
      setModerators(data || []);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load moderators');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const logs = await adminApi.getModeratorLogs({ limit: 100 });
      setAuditLogs(logs || []);
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err.message);
    }
  };

  useEffect(() => {
    fetchModerators();
    fetchAuditLogs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMod(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      permissions: [],
      isActive: true
    });
    setPermissionFilter('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mod: ModeratorUser) => {
    setEditingMod(mod);
    setFormData({
      name: mod.name,
      email: mod.email,
      phone: mod.phone || '',
      password: '',
      permissions: [...(mod.permissions || [])],
      isActive: mod.isActive !== false
    });
    setPermissionFilter('');
    setIsModalOpen(true);
  };

  // Dependency rule:
  // - If action is checked, auto-check view
  // - If view is unchecked, auto-uncheck all actions in group
  const togglePermission = (key: string, group: string) => {
    const isCurrentlyChecked = formData.permissions.includes(key);
    let updated = [...formData.permissions];
    const groupViewKey = `${group}.view`;

    if (isCurrentlyChecked) {
      if (key === groupViewKey) {
        const groupKeys = ASSIGNABLE_PERMISSIONS.filter(p => p.group === group).map(p => p.key);
        updated = updated.filter(k => !groupKeys.includes(k));
      } else {
        updated = updated.filter(k => k !== key);
      }
    } else {
      updated.push(key);
      if (key !== groupViewKey && !updated.includes(groupViewKey)) {
        updated.push(groupViewKey);
      }
    }

    setFormData(prev => ({ ...prev, permissions: Array.from(new Set(updated)) }));
  };

  // Group Select All / Deselect All
  const toggleGroupAll = (group: string) => {
    const groupItems = ASSIGNABLE_PERMISSIONS.filter(p => p.group === group);
    const groupKeys = groupItems.map(p => p.key);
    const allChecked = groupKeys.every(k => formData.permissions.includes(k));

    let updated: string[];
    if (allChecked) {
      updated = formData.permissions.filter(k => !groupKeys.includes(k));
    } else {
      updated = Array.from(new Set([...formData.permissions, ...groupKeys]));
    }

    setFormData(prev => ({ ...prev, permissions: updated }));
  };

  // Global Select All / Deselect All
  const handleToggleGlobalAll = () => {
    const allSelected = ASSIGNABLE_KEYS.every(k => formData.permissions.includes(k));
    setFormData(prev => ({
      ...prev,
      permissions: allSelected ? [] : [...ASSIGNABLE_KEYS]
    }));
  };

  // Preset Application
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      permissions: [...preset.permissions]
    }));
  };

  // Quick toggle Active/Inactive from list
  const handleToggleStatusInList = async (mod: ModeratorUser) => {
    if (mod.role === 'super_admin') return;
    try {
      const nextStatus = !mod.isActive;
      const updated = await adminApi.updateModerator(mod.id, { isActive: nextStatus });
      setModerators(prev => prev.map(m => m.id === mod.id ? { ...m, isActive: updated.isActive } : m));
      showNotification('success', `${mod.name} is now ${nextStatus ? 'Active' : 'Inactive'}`);
      fetchAuditLogs();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update status');
    }
  };

  // Submit Create or Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showNotification('error', 'Please provide a valid name and email address');
      return;
    }

    if (!editingMod && !formData.password.trim()) {
      showNotification('error', 'A secure password is required for new moderator accounts');
      return;
    }

    setSubmitting(true);
    try {
      if (editingMod) {
        const updatePayload: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          permissions: formData.permissions,
          isActive: formData.isActive
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }

        const updated = await adminApi.updateModerator(editingMod.id, updatePayload);
        setModerators(prev => prev.map(m => m.id === editingMod.id ? updated : m));
        showNotification('success', `Moderator "${updated.name}" updated successfully!`);
      } else {
        const created = await adminApi.createModerator({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password.trim(),
          permissions: formData.permissions,
          isActive: formData.isActive
        });
        setModerators(prev => [created, ...prev]);
        showNotification('success', `Moderator "${created.name}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchAuditLogs();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save moderator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete moderator "${name}"?`)) return;
    try {
      await adminApi.deleteModerator(id);
      setModerators(prev => prev.filter(m => m.id !== id));
      setDeleteConfirmId(null);
      showNotification('success', 'Moderator account permanently removed');
      fetchAuditLogs();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete moderator');
    }
  };

  // Filtered moderators
  const filteredModerators = useMemo(() => {
    if (!searchQuery) return moderators;
    const q = searchQuery.toLowerCase();
    return moderators.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q))
    );
  }, [moderators, searchQuery]);

  // Filtered permissions for the Modal Search
  const filteredGroups = useMemo(() => {
    const q = permissionFilter.trim().toLowerCase();
    if (!q) {
      return PERMISSION_GROUPS.filter(g => g.id !== 'settings' && g.id !== 'users');
    }

    return PERMISSION_GROUPS.filter(g => {
      if (g.id === 'settings' || g.id === 'users') return false;
      const groupMatch = g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      const hasMatchingPerms = ASSIGNABLE_PERMISSIONS.some(p =>
        p.group === g.id && (p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      );
      return groupMatch || hasMatchingPerms;
    });
  }, [permissionFilter]);

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Toast Alert */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '13.5px',
          fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            marginBottom: '8px'
          }}>
            <ShieldCheck size={13} />
            Super Admin Privilege
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            Moderator Access &amp; Permissions
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Grant customized granular access to staff members, configure feature modules, and review audit history.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '9px 18px' }}>
          <UserPlus size={16} /> Add Moderator
        </button>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('directory')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={14} />
          Moderator Directory
          <span style={{
            background: activeTab === 'directory' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
            color: activeTab === 'directory' ? '#fff' : '#475569',
            fontSize: '11px',
            padding: '1px 6px',
            borderRadius: '9999px',
            fontWeight: 700
          }}>
            {moderators.length}
          </span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <History size={14} />
          Activity &amp; Audit Logs
          <span style={{
            background: activeTab === 'audit' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
            color: activeTab === 'audit' ? '#fff' : '#475569',
            fontSize: '11px',
            padding: '1px 6px',
            borderRadius: '9999px',
            fontWeight: 700
          }}>
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <div>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search moderators by name, email, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role &amp; Status</th>
                  <th>Granted Permissions</th>
                  <th>Active State</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Loading moderators...
                    </td>
                  </tr>
                ) : filteredModerators.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <Users size={32} color="#94a3b8" style={{ display: 'block', margin: '0 auto 8px' }} />
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  filteredModerators.map(mod => {
                    const isSuper = mod.role === 'super_admin';
                    const permCount = Array.isArray(mod.permissions) ? mod.permissions.length : 0;

                    return (
                      <tr key={mod.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isSuper ? '#fef3c7' : '#e0e7ff',
                              color: isSuper ? '#b45309' : '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              flexShrink: 0
                            }}>
                              {mod.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {mod.name}
                                {isSuper && (
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    padding: '1px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Mail size={11} /> {mod.email}
                                </span>
                                {mod.phone && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Phone size={11} /> {mod.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: isSuper ? '#fef3c7' : '#e0e7ff',
                            color: isSuper ? '#b45309' : '#4338ca'
                          }}>
                            {isSuper ? 'Super Admin' : 'Moderator'}
                          </span>
                        </td>

                        <td>
                          {isSuper ? (
                            <span className="badge badge-active">
                              <ShieldCheck size={12} /> Full Platform Access (Unrestricted)
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: permCount > 0 ? '#f1f5f9' : '#fee2e2',
                                color: permCount > 0 ? '#0f172a' : '#b91c1c'
                              }}>
                                <Key size={11} /> {permCount} permission{permCount === 1 ? '' : 's'}
                              </span>
                              {permCount > 0 && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  ({mod.permissions.slice(0, 3).join(', ')}{permCount > 3 ? '...' : ''})
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          {isSuper ? (
                            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Always Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatusInList(mod)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title="Click to toggle active status"
                            >
                              <span className={`badge ${mod.isActive ? 'badge-active' : 'badge-cancelled'}`}>
                                {mod.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </button>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {isSuper ? (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditModal(mod)}
                                title="Edit access permissions"
                              >
                                <Edit2 size={12} /> Edit Access
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(mod.id, mod.name)}
                                title="Delete moderator"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Security &amp; Audit Trail</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Every permission modification and staff status change is logged immutably.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchAuditLogs}>
              Refresh Logs
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Initiator (Super Admin)</th>
                <th>Target Moderator</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id || log._id}>
                    <td style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td>
                      <span style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '11px',
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#334155'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.actor?.name || 'Super Admin'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{log.actor?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.target?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{log.target?.email}</div>
                    </td>
                    <td style={{ maxWidth: '360px' }}>
                      <div style={{ fontSize: '12px', color: '#334155' }}>{log.details}</div>
                      {log.newPermissions && log.newPermissions.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                          Granted: <code style={{ color: '#ff6600', background: '#fff7ed', padding: '1px 4px', borderRadius: '3px' }}>{log.newPermissions.join(', ')}</code>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {editingMod ? `Configure Permissions: ${editingMod.name}` : 'Create New Moderator Account'}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                  Select exactly which modules and operations this moderator has authorization to manage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                {/* Account Credentials Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="#ff6600" /> Moderator Credentials
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shakil Ahmed"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="shakil@maxitshop.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">Phone Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="+880 1712-345678"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        {editingMod ? 'Change Password (Optional)' : 'Login Password *'}
                      </label>
                      <input
                        type="password"
                        required={!editingMod}
                        placeholder={editingMod ? 'Leave blank to keep unchanged' : 'Enter strong password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Active / Inactive Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Account Status</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Deactivated accounts cannot log in or perform any actions.</div>
                    </div>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: formData.isActive ? '#047857' : '#b91c1c' }}>
                        {formData.isActive ? 'Active' : 'Inactive (Disabled)'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Presets Toolbar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="#f59e0b" /> One-Click Presets
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ background: '#fff', borderColor: '#fdba74', color: '#ea580c', fontWeight: 600 }}
                        title={preset.description}
                      >
                        ⚡ {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="btn btn-secondary btn-sm"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Permission Cards Matrix Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Granular Feature Permissions ({formData.permissions.length} selected)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Ticking create, edit or delete automatically includes view permission for that module.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Filter permissions..."
                      value={permissionFilter}
                      onChange={e => setPermissionFilter(e.target.value)}
                      style={{ width: '160px', padding: '5px 10px', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleToggleGlobalAll}
                      className="btn btn-secondary btn-sm"
                    >
                      {ASSIGNABLE_KEYS.every(k => formData.permissions.includes(k)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Grouped Permission Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                  {filteredGroups.map(group => {
                    const groupPerms = ASSIGNABLE_PERMISSIONS.filter(p => p.group === group.id);
                    const groupKeys = groupPerms.map(p => p.key);
                    const allInGroupChecked = groupKeys.length > 0 && groupKeys.every(k => formData.permissions.includes(k));

                    return (
                      <div
                        key={group.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Group Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{group.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{group.description}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleGroupAll(group.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#ff6600',
                                padding: '2px 6px'
                              }}
                            >
                              {allInGroupChecked ? 'Deselect' : 'All'}
                            </button>
                          </div>

                          {/* Checkbox Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {groupPerms.map((perm: PermissionItem) => {
                              const isChecked = formData.permissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermission(perm.key, group.id)}
                                    style={{ marginTop: '2px', accentColor: '#ff6600', cursor: 'pointer' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{perm.label}</span>
                                      <code style={{ fontSize: '10px', color: '#94a3b8', background: '#f8fafc', padding: '1px 4px', borderRadius: '3px' }}>
                                        {perm.key}
                                      </code>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.2, marginTop: '1px' }}>
                                      {perm.description}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Indicator */}
                        <div style={{ borderTop: '1px solid #f8fafc', marginTop: '10px', paddingTop: '6px', fontSize: '10.5px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Module Access</span>
                          <span style={{ fontWeight: 700, color: allInGroupChecked ? '#ff6600' : '#64748b' }}>
                            {groupKeys.filter(k => formData.permissions.includes(k)).length} / {groupKeys.length} active
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: 'auto' }}>
                  Takes effect <strong>immediately</strong> without re-login.
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : (editingMod ? 'Save Changes' : 'Create Moderator')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorsView;
