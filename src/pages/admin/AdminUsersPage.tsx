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
  UserPlus,
  Filter,
  Calendar,
  Mail,
  User as UserIcon,
  Award,
  TrendingUp,
  Activity,
  Clock,
  MoreVertical,
  Download,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  },
};

export const AdminUsersPage: React.FC = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleCardClick = (user: User, e: React.MouseEvent) => {
    // Prevent opening edit modal when clicking on delete button
    const target = e.target as HTMLElement;
    if (target.closest('.delete-btn') || target.closest('.edit-btn')) {
      return;
    }
    openEditModal(user);
  };

  const getRoleIcon = (userRole: Role) => {
    if (userRole === 'ADMIN') return <Shield className="w-4 h-4 text-orange-500" />;
    return <Edit3 className="w-4 h-4 text-amber-500" />;
  };

  const getRoleColor = (userRole: Role) => {
    if (userRole === 'ADMIN') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const editorUsers = users.filter(u => u.role === 'EDITOR').length;

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16"
      >
        {/* Header Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <Users className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <Users className="w-3.5 h-3.5" />
                  User Management
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Team Members
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                  Manage your team's access, roles, and permissions across the platform.
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-semibold text-white">{totalUsers}</span>
                    <span>Total</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold text-white">{activeUsers}</span>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold text-white">{adminUsers}</span>
                    <span>Admins</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Edit3 className="w-4 h-4" />
                    <span className="font-semibold text-white">{editorUsers}</span>
                    <span>Editors</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.98] font-['Poppins',sans-serif]"
              >
                <UserPlus className="w-4 h-4" />
                Add Team Member
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5"
        >
          {[
            { label: 'Total Users', value: totalUsers, icon: Users, color: 'orange' },
            { label: 'Active Users', value: activeUsers, icon: Activity, color: 'emerald' },
            { label: 'Admins', value: adminUsers, icon: Shield, color: 'purple' },
            { label: 'Editors', value: editorUsers, icon: Edit3, color: 'amber' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colors = {
              orange: 'bg-orange-50 text-orange-600 border-orange-200',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              amber: 'bg-amber-50 text-amber-600 border-amber-200',
            };
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-stone-500 font-['Inter',sans-serif]">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold font-['Poppins',sans-serif] text-stone-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${colors[stat.color as keyof typeof colors]}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-orange-50/30 border border-stone-200/80 rounded-xl p-1">
                {['All', 'ADMIN', 'EDITOR'].map((label) => {
                  const value = label === 'All' ? '' : label;
                  return (
                    <button
                      key={label}
                      onClick={() => setRoleFilter(value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-['Poppins',sans-serif'] ${
                        roleFilter === value
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-orange-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => fetchUsers()}
                className="p-2.5 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-stone-200/80"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Users Grid */}
        {users.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Poppins',sans-serif] text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                All Team Members
                <span className="text-sm font-normal text-stone-500 font-['Inter',sans-serif]">
                  ({users.length} users)
                </span>
              </h2>
              <span className="text-xs text-stone-400 font-['Inter',sans-serif] flex items-center gap-1">
                <span className="hidden sm:inline">Click any card to edit</span>
                <span className="sm:hidden">Tap to edit</span>
                <Edit className="w-3 h-3" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map((user, idx) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={(e) => handleCardClick(user, e)}
                  className="group bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] hover:border-orange-300 transition-all duration-300 cursor-pointer relative"
                >
                  {/* Click hint - subtle indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-orange-400" />
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl bg-orange-100 object-cover border-2 border-orange-200 shadow-sm"
                      />
                      <div>
                        <h3 className="font-['Poppins',sans-serif] font-semibold text-stone-900 text-sm">
                          {user.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-['Inter',sans-serif] flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Edit button - now styled as a secondary action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(user);
                        }}
                        className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors edit-btn"
                        title="Edit User"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingUser(user);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors delete-btn"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="text-[10px] font-semibold font-['Inter',sans-serif]">{user.role}</span>
                        </div>
                        <Badge variant={user.isActive ? 'success' : 'danger'} size="sm" className={`font-['Inter',sans-serif] text-[10px] ${
                          user.isActive 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-stone-400 font-['Inter',sans-serif] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Hover overlay indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
              <EmptyState
                title="No users found"
                description="No user accounts match your search or filter parameters."
                actionText="Create User"
                onAction={openCreateModal}
              />
            </div>
          </motion.div>
        )}

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
          <form onSubmit={handleSaveUser} className="space-y-5 font-['Inter',sans-serif]">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl text-stone-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl text-stone-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl text-stone-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
              >
                <option value="EDITOR">EDITOR (Assigned Lesson Content Editor)</option>
                <option value="ADMIN">ADMIN (Full Portal Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                Password {editingUser && '(Leave blank to keep unchanged)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl text-stone-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
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
                  className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 bg-orange-50/30 cursor-pointer"
                />
                <label htmlFor="user-active-toggle" className="text-sm font-semibold text-stone-700 cursor-pointer font-['Inter',sans-serif]">
                  Account Active
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2.5 border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-sm transition-all shadow-sm font-['Inter',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 font-['Poppins',sans-serif]"
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
      </motion.div>
    </div>
  );
};