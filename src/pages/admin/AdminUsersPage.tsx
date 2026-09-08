import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { User, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Edit3,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminUsersPage: React.FC = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Form & Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (roleFilter) query.append('role', roleFilter);

      const data = await apiFetch<{ users: User[] }>(`/users?${query.toString()}`);
      setUsers(data.users);
    } catch (err) {
      toast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('EDITOR');
    setIsActive(true);
    setIsCreateOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setIsActive(user.isActive);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setSaving(true);
      if (editingUser) {
        await apiFetch(`/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, email, role, isActive, password: password || undefined }),
        });
        toast('User profile updated!', 'success');
      } else {
        if (!password) {
          toast('Password is required for new users.', 'error');
          setSaving(false);
          return;
        }
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role }),
        });
        toast('New user created successfully!', 'success');
      }
      setIsCreateOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast(err.message || 'Operation failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setSaving(true);
      await apiFetch(`/users/${deletingUser.id}`, { method: 'DELETE' });
      toast('User deleted successfully.', 'success');
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (userRole: Role) => {
    if (userRole === 'ADMIN') return <Shield className="w-4 h-4 text-orange-500" />;
    return <Edit3 className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              User Management
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              User Account Management
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Manage administrator and editor accounts and roles across the platform.
            </p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create New User
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-editorial">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['', 'ADMIN', 'EDITOR'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                roleFilter === r
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-editorial">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No users found"
              description="No user accounts match your search or filter parameters."
              actionText="Create User"
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl bg-slate-200 object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                        {getRoleIcon(u.role)}
                        <span className="font-semibold text-xs text-slate-700">{u.role}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm" className={u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingUser}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-slate-900 text-sm outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-slate-900 text-sm outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-slate-900 text-sm outline-none transition-all"
            >
              <option value="EDITOR">EDITOR (Assigned Lesson Content Editor)</option>
              <option value="ADMIN">ADMIN (Full Portal Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password {editingUser && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-slate-900 text-sm outline-none transition-all"
              required={!editingUser}
            />
          </div>

          {editingUser && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="user-active-toggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-slate-50 cursor-pointer"
              />
              <label htmlFor="user-active-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Account Active
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingUser(null);
              }}
              className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for "${deletingUser?.name}" (${deletingUser?.email})?`}
        loading={saving}
      />
    </div>
  );
};