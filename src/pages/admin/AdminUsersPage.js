import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { Plus, Search, Edit, Trash2, Shield, Edit3, GraduationCap, } from 'lucide-react';
export const AdminUsersPage = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    // Form & Modals State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (search)
                query.append('search', search);
            if (roleFilter)
                query.append('role', roleFilter);
            const data = await apiFetch(`/users?${query.toString()}`);
            setUsers(data.users);
        }
        catch (err) {
            toast('Failed to load users.', 'error');
        }
        finally {
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
    const openEditModal = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setIsActive(user.isActive);
    };
    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!name || !email)
            return;
        try {
            setSaving(true);
            if (editingUser) {
                await apiFetch(`/users/${editingUser.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ name, email, role, isActive, password: password || undefined }),
                });
                toast('User profile updated!', 'success');
            }
            else {
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
        }
        catch (err) {
            toast(err.message || 'Operation failed.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteUser = async () => {
        if (!deletingUser)
            return;
        try {
            setSaving(true);
            await apiFetch(`/users/${deletingUser.id}`, { method: 'DELETE' });
            toast('User deleted successfully.', 'success');
            setDeletingUser(null);
            fetchUsers();
        }
        catch (err) {
            toast(err.message || 'Failed to delete user.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const getRoleIcon = (userRole) => {
        if (userRole === 'ADMIN')
            return _jsx(Shield, { className: "w-4 h-4 text-brand-400" });
        if (userRole === 'EDITOR')
            return _jsx(Edit3, { className: "w-4 h-4 text-amber-400" });
        return _jsx(GraduationCap, { className: "w-4 h-4 text-emerald-400" });
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "User Account Management" }), _jsx("p", { className: "text-sm text-slate-400", children: "Manage administrator, editor, and student accounts and roles." })] }), _jsx(Button, { onClick: openCreateModal, variant: "primary", icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Create New User" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4", children: [_jsxs("div", { className: "relative flex-1 w-full", children: [_jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search users by name or email...", className: "w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500" })] }), _jsx("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: ['', 'ADMIN', 'EDITOR', 'STUDENT'].map((r) => (_jsx("button", { onClick: () => setRoleFilter(r), className: `px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${roleFilter === r
                                ? 'bg-brand-600 border-brand-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`, children: r === '' ? 'All Roles' : r }, r))) })] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl", children: loading ? (_jsx("div", { className: "p-6 space-y-4", children: [...Array(5)].map((_, i) => (_jsx(Skeleton, { className: "h-12 w-full rounded-xl" }, i))) })) : users.length === 0 ? (_jsx(EmptyState, { title: "No users found", description: "No user accounts match your search or filter parameters.", actionText: "Create User", onAction: openCreateModal })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider", children: [_jsx("th", { className: "px-6 py-4", children: "User Details" }), _jsx("th", { className: "px-6 py-4", children: "Role" }), _jsx("th", { className: "px-6 py-4", children: "Status" }), _jsx("th", { className: "px-6 py-4", children: "Registered Date" }), _jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/80 text-sm", children: users.map((u) => (_jsxs("tr", { className: "hover:bg-slate-800/40 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`, alt: u.name, className: "w-9 h-9 rounded-full bg-slate-800 object-cover border border-slate-700" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-white", children: u.name }), _jsx("p", { className: "text-xs text-slate-400", children: u.email })] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-1.5", children: [getRoleIcon(u.role), _jsx("span", { className: "font-semibold text-xs text-slate-200", children: u.role })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx(Badge, { variant: u.isActive ? 'success' : 'danger', size: "sm", children: u.isActive ? 'Active' : 'Deactivated' }) }), _jsx("td", { className: "px-6 py-4 text-xs text-slate-400", children: new Date(u.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => openEditModal(u), className: "p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors", title: "Edit User", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeletingUser(u), className: "p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors", title: "Delete User", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, u.id))) })] }) })) }), _jsx(Modal, { isOpen: isCreateOpen || !!editingUser, onClose: () => {
                    setIsCreateOpen(false);
                    setEditingUser(null);
                }, title: editingUser ? `Edit User: ${editingUser.name}` : 'Create New User', maxWidth: "md", children: _jsxs("form", { onSubmit: handleSaveUser, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1", children: "Full Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Doe", className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1", children: "Email Address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "user@example.com", className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1", children: "System Role" }), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500", children: [_jsx("option", { value: "STUDENT", children: "STUDENT (Read-Only Course Visitor)" }), _jsx("option", { value: "EDITOR", children: "EDITOR (Assigned Lesson Content Editor)" }), _jsx("option", { value: "ADMIN", children: "ADMIN (Full Portal Access)" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1", children: ["Password ", editingUser && '(Leave blank to keep unchanged)'] }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500", required: !editingUser })] }), editingUser && (_jsxs("div", { className: "flex items-center gap-3 pt-2", children: [_jsx("input", { type: "checkbox", id: "user-active-toggle", checked: isActive, onChange: (e) => setIsActive(e.target.checked), className: "w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500" }), _jsx("label", { htmlFor: "user-active-toggle", className: "text-sm text-slate-300 cursor-pointer", children: "Account Active" })] })), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-slate-800", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                        setIsCreateOpen(false);
                                        setEditingUser(null);
                                    }, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: saving, children: editingUser ? 'Save Changes' : 'Create User' })] })] }) }), _jsx(ConfirmDialog, { isOpen: !!deletingUser, onClose: () => setDeletingUser(null), onConfirm: handleDeleteUser, title: "Delete User Account", message: `Are you sure you want to delete the account for "${deletingUser?.name}" (${deletingUser?.email})?`, loading: saving })] }));
};
