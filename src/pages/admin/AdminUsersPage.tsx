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
    if (userRole === 'ADMIN') return <Shield className="w-4 h-4 text-brand-400" />;
    return <Edit3 className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">User Account Management</h1>
          <p className="text-sm text-stone-500 font-sans mt-0.5">Manage administrator and editor accounts and roles.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Create New User
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 placeholder-stone-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['', 'ADMIN', 'EDITOR'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                roleFilter === r
                  ? 'bg-stone-900 border-stone-900 text-stone-50'
                  : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
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
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full bg-stone-200 object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-semibold text-stone-900">{u.name}</p>
                          <p className="text-xs text-stone-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(u.role)}
                        <span className="font-semibold text-xs text-stone-700">{u.role}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
            >
              <option value="EDITOR">EDITOR (Assigned Lesson Content Editor)</option>
              <option value="ADMIN">ADMIN (Full Portal Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Password {editingUser && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
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
                className="w-4 h-4 rounded border-stone-300 bg-white text-stone-900 focus:ring-stone-800"
              />
              <label htmlFor="user-active-toggle" className="text-sm text-stone-700 cursor-pointer">
                Account Active
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
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
