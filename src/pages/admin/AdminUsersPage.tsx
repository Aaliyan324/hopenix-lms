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
} from 'lucide-react';

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
  const [role, setRole] = useState<Role>('STUDENT');
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
    setRole('STUDENT');
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
    if (userRole === 'ADMIN') return <Shield className="w-4 h-4 text-brand-400" />;
    if (userRole === 'EDITOR') return <Edit3 className="w-4 h-4 text-amber-400" />;
    return <GraduationCap className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Account Management</h1>
          <p className="text-sm text-slate-400">Manage administrator, editor, and student accounts and roles.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Create New User
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['', 'ADMIN', 'EDITOR', 'STUDENT'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                roleFilter === r
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No user accounts match your search or filter parameters."
            actionText="Create User"
            onAction={openCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full bg-slate-800 object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(u.role)}
                        <span className="font-semibold text-xs text-slate-200">{u.role}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="STUDENT">STUDENT (Read-Only Course Visitor)</option>
              <option value="EDITOR">EDITOR (Assigned Lesson Content Editor)</option>
              <option value="ADMIN">ADMIN (Full Portal Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password {editingUser && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
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
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="user-active-toggle" className="text-sm text-slate-300 cursor-pointer">
                Account Active
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
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
