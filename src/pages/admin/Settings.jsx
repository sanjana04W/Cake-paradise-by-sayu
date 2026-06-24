import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield, Map, FileText, Save, Users, Trash2, Plus, Edit2, X,
  Eye, Power, CheckCircle2, AlertTriangle, ShoppingBag, Package,
  UserCheck, BookOpen, BarChart2, Lock, Tag
} from 'lucide-react';

// ─── All granular permissions grouped by category ──────────────────────────
const ALL_PERMISSION_GROUPS = [
  {
    group: 'Orders',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    items: [
      { id: 'view_orders',         label: 'View Orders' },
      { id: 'update_order_status', label: 'Update Order Status' },
      { id: 'contact_customers',   label: 'Contact Customers via WhatsApp' },
    ],
  },
  {
    group: 'Products & Inventory',
    icon: Package,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    items: [
      { id: 'view_products',    label: 'View Products' },
      { id: 'add_products',     label: 'Add New Products' },
      { id: 'edit_products',    label: 'Edit Existing Products' },
      { id: 'delete_products',  label: 'Delete Products' },
      { id: 'manage_inventory', label: 'Manage Stock & Inventory' },
    ],
  },
  {
    group: 'Customers',
    icon: UserCheck,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    items: [
      { id: 'view_customers', label: 'View Customer Profiles' },
    ],
  },
  {
    group: 'Content Management',
    icon: BookOpen,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    items: [
      { id: 'edit_faq',             label: 'Edit FAQ Content' },
      { id: 'edit_delivery_policy', label: 'Edit Delivery Policy' },
      { id: 'edit_refund_policy',   label: 'Edit Refund Policy' },
    ],
  },
  {
    group: 'Reports & Promos',
    icon: BarChart2,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    items: [
      { id: 'view_reports',   label: 'View Reports & Analytics' },
      { id: 'manage_promos',  label: 'Manage Promotions & Coupons' },
    ],
  },
];

// Built-in roles (locked — cannot be deleted)
const BUILT_IN_ROLES = [
  {
    id: 'order_handler',
    label: 'Order Handler',
    description: 'Manages orders and customer communication.',
    permissions: ['view_orders', 'update_order_status', 'contact_customers', 'view_customers'],
    builtIn: true,
  },
  {
    id: 'inventory_manager',
    label: 'Inventory Manager',
    description: 'Controls products and stock levels.',
    permissions: ['view_products', 'add_products', 'edit_products', 'delete_products', 'manage_inventory'],
    builtIn: true,
  },
  {
    id: 'content_manager',
    label: 'Content Manager',
    description: 'Edits website content and policies.',
    permissions: ['edit_faq', 'edit_delivery_policy', 'edit_refund_policy'],
    builtIn: true,
  },
];

const INITIAL_STAFF = [
  { id: 1, name: 'Sayu (Owner)', role: 'super_admin',       email: 'owner@cakeparadise.lk',    active: true,  permissions: [] },
  { id: 2, name: 'Kasun',        role: 'order_handler',     email: 'kitchen@cakeparadise.lk',  active: true,  permissions: ['view_orders', 'update_order_status', 'contact_customers', 'view_customers'] },
  { id: 3, name: 'Nimal',        role: 'inventory_manager', email: 'stock@cakeparadise.lk',    active: false, permissions: ['view_products', 'add_products', 'edit_products', 'delete_products', 'manage_inventory'] },
  { id: 4, name: 'Ishan',        role: 'content_manager',   email: 'contentk@cakeparadise.lk', active: true,  permissions: ['edit_faq', 'edit_delivery_policy', 'edit_refund_policy'] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const ROLE_BADGE_COLORS = [
  'bg-[#B76E79]/10 text-[#B76E79] border border-[#B76E79]/20',
  'bg-blue-50 text-blue-700 border border-blue-200',
  'bg-green-50 text-green-700 border border-green-200',
  'bg-purple-50 text-purple-700 border border-purple-200',
  'bg-orange-50 text-orange-700 border border-orange-200',
  'bg-teal-50 text-teal-700 border border-teal-200',
  'bg-indigo-50 text-indigo-700 border border-indigo-200',
];

const roleBadgeClass = (roleId, allRoles) => {
  if (roleId === 'super_admin') return 'bg-[#B76E79]/10 text-[#B76E79] border border-[#B76E79]/20';
  const idx = allRoles.findIndex(r => r.id === roleId);
  return ROLE_BADGE_COLORS[(idx + 1) % ROLE_BADGE_COLORS.length] || 'bg-gray-100 text-gray-600 border border-gray-200';
};

const getRoleLabel = (roleId, allRoles) => {
  if (roleId === 'super_admin') return 'Super Admin';
  return allRoles.find(r => r.id === roleId)?.label || roleId;
};

// ─── Permission Checklist (shared by staff and role modals) ─────────────────
const PermissionChecklist = ({ permissions, onChange }) => {
  const togglePermission = (permId) => {
    onChange(
      permissions.includes(permId)
        ? permissions.filter(p => p !== permId)
        : [...permissions, permId]
    );
  };

  const toggleGroup = (groupItems) => {
    const ids = groupItems.map(i => i.id);
    const allSelected = ids.every(id => permissions.includes(id));
    onChange(
      allSelected
        ? permissions.filter(p => !ids.includes(p))
        : [...new Set([...permissions, ...ids])]
    );
  };

  const allIds = ALL_PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Access Permissions</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onChange(allIds)} className="text-xs text-[#B76E79] font-semibold hover:underline">Select All</button>
          <span className="text-gray-300">|</span>
          <button type="button" onClick={() => onChange([])} className="text-xs text-gray-500 font-semibold hover:underline">Clear All</button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {ALL_PERMISSION_GROUPS.map((group, gi) => {
          const GroupIcon = group.icon;
          const allChecked = group.items.every(i => permissions.includes(i.id));
          const someChecked = group.items.some(i => permissions.includes(i.id));
          const selectedCount = group.items.filter(i => permissions.includes(i.id)).length;

          return (
            <div key={gi} className={gi > 0 ? 'border-t border-gray-100' : ''}>
              <div
                className={`flex items-center justify-between px-4 py-2.5 ${group.bg} cursor-pointer select-none`}
                onClick={() => toggleGroup(group.items)}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className={`w-3.5 h-3.5 ${group.color}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.group}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{selectedCount}/{group.items.length} selected</span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${allChecked ? 'bg-[#B76E79] border-[#B76E79]' : someChecked ? 'bg-[#B76E79]/30 border-[#B76E79]/50' : 'border-gray-300 bg-white'}`}>
                    {(allChecked || someChecked) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        {allChecked
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />}
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 space-y-1.5 bg-white">
                {group.items.map(perm => (
                  <label key={perm.id} className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => togglePermission(perm.id)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${permissions.includes(perm.id) ? 'bg-[#B76E79] border-[#B76E79]' : 'border-gray-300 bg-white group-hover:border-[#B76E79]/50'}`}>
                      {permissions.includes(perm.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${permissions.includes(perm.id) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-right">{permissions.length} permission{permissions.length !== 1 ? 's' : ''} granted</p>
    </div>
  );
};

// ─── Role Modal (Create / Edit custom role) ──────────────────────────────────
const RoleModal = ({ mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState(
    initialData
      ? { ...initialData }
      : { label: '', description: '', permissions: [] }
  );
  const isValid = form.label.trim();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display">
              {mode === 'create' ? 'Create New Role' : 'Edit Role'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Define the role and assign its permissions.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none text-sm"
              placeholder="E.g. Kitchen Supervisor"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none text-sm"
              placeholder="Brief description of this role's responsibilities"
            />
          </div>
          <PermissionChecklist
            permissions={form.permissions}
            onChange={perms => setForm({ ...form, permissions: perms })}
          />
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="px-6 py-2 bg-[#B76E79] text-white rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? 'Create Role' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Staff Form Modal ────────────────────────────────────────────────────────
const StaffModal = ({ mode, initialData, allRoles, onSave, onClose }) => {
  const [form, setForm] = useState(
    initialData
      ? { ...initialData }
      : { name: '', email: '', role: allRoles[0]?.id || 'order_handler', active: true, permissions: allRoles[0]?.permissions || [] }
  );
  const isValid = form.name.trim() && form.email.trim();

  const handleRoleChange = (roleId) => {
    const preset = allRoles.find(r => r.id === roleId)?.permissions || [];
    setForm(prev => ({ ...prev, role: roleId, permissions: [...preset] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display">
              {mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Assign a role and choose individual permissions.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none text-sm" placeholder="E.g. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none text-sm" placeholder="jane@cakeparadise.lk" />
            </div>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Account Status</p>
                <p className="text-xs text-gray-500 mt-0.5">Inactive accounts cannot access the admin panel.</p>
              </div>
              <button onClick={() => setForm({ ...form, active: !form.active })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {/* Role selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Role <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-normal text-gray-400">— Selecting a role pre-fills recommended permissions</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {allRoles.map(role => (
                <label key={role.id} className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${form.role === role.id ? 'border-[#B76E79] bg-[#B76E79]/5 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="staffRole" value={role.id} checked={form.role === role.id} onChange={() => handleRoleChange(role.id)} className="accent-[#B76E79]" />
                    <span className="text-sm font-bold text-gray-900 leading-tight">{role.label}</span>
                    {role.builtIn && <Lock className="w-3 h-3 text-gray-400 ml-auto shrink-0" title="Built-in role" />}
                  </div>
                  <p className="text-xs text-gray-500 pl-5 leading-snug">{role.description}</p>
                </label>
              ))}
            </div>
          </div>

          <PermissionChecklist
            permissions={form.permissions}
            onChange={perms => setForm({ ...form, permissions: perms })}
          />
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={() => isValid && onSave(form)} disabled={!isValid} className="px-6 py-2 bg-[#B76E79] text-white rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {mode === 'add' ? '+ Add Staff Member' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── View Staff Modal ────────────────────────────────────────────────────────
const ViewStaffModal = ({ staff, allRoles, onClose }) => {
  const grantedGroups = ALL_PERMISSION_GROUPS.map(g => ({
    ...g, granted: g.items.filter(i => (staff.permissions || []).includes(i.id)),
  })).filter(g => g.granted.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900 font-display">Staff Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#B76E79]/10 flex items-center justify-center text-2xl font-bold text-[#B76E79] shrink-0">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div><p className="text-base font-bold text-gray-900">{staff.name}</p><p className="text-sm text-gray-500">{staff.email}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">Role</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${roleBadgeClass(staff.role, allRoles)}`}>{getRoleLabel(staff.role, allRoles)}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${staff.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${staff.active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />{staff.active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {staff.role === 'super_admin' ? (
            <div className="bg-[#B76E79]/5 border border-[#B76E79]/20 rounded-xl p-4">
              <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider mb-1">Full Access</p>
              <p className="text-xs text-gray-600">Super Admin has unrestricted access to all admin panel features.</p>
            </div>
          ) : grantedGroups.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Granted Permissions</p>
              {grantedGroups.map(g => {
                const GIcon = g.icon;
                return (
                  <div key={g.group} className={`rounded-xl border ${g.border} ${g.bg} p-3`}>
                    <div className="flex items-center gap-1.5 mb-2"><GIcon className={`w-3 h-3 ${g.color}`} /><span className={`text-xs font-bold ${g.color}`}>{g.group}</span></div>
                    <div className="flex flex-wrap gap-1.5">{g.granted.map(p => <span key={p.id} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-full">{p.label}</span>)}</div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400 italic">No permissions granted.</p>}
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteModal = ({ title, message, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
      <div className="p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-500" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Yes, Remove</button>
      </div>
    </div>
  </div>
);

// ─── Main Settings Component ─────────────────────────────────────────────────
const Settings = () => {
  const { adminData } = useAuth();
  const [activeTab, setActiveTab] = useState(adminData?.role === 'super_admin' ? 'access' : 'cms');

  // ── Roles state (built-in + custom)
  const [customRoles, setCustomRoles] = useState([]);
  const allRoles = [...BUILT_IN_ROLES, ...customRoles];
  const [roleModal, setRoleModal] = useState(null); // null | { mode: 'create'|'edit'|'delete', data }

  // ── Staff state
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [staffModal, setStaffModal] = useState(null); // null | { mode: 'add'|'edit'|'view'|'delete', data }

  const [saveToast, setSaveToast] = useState('');
  const showToast = (msg) => { setSaveToast(msg); setTimeout(() => setSaveToast(''), 3000); };

  // Staff handlers
  const handleSaveStaff = (form) => {
    if (staffModal.mode === 'add') { setStaff(prev => [...prev, { ...form, id: Date.now() }]); showToast('Staff member added!'); }
    else { setStaff(prev => prev.map(s => s.id === form.id ? { ...form } : s)); showToast('Staff member updated!'); }
    setStaffModal(null);
  };
  const handleDeleteStaff = () => {
    setStaff(prev => prev.filter(s => s.id !== staffModal.data.id));
    showToast('Staff member removed.');
    setStaffModal(null);
  };
  const handleToggleActive = (id) => setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  // Role handlers
  const handleSaveRole = (form) => {
    if (roleModal.mode === 'create') {
      const newRole = { ...form, id: `custom_${Date.now()}`, builtIn: false };
      setCustomRoles(prev => [...prev, newRole]);
      showToast(`Role "${form.label}" created!`);
    } else {
      setCustomRoles(prev => prev.map(r => r.id === form.id ? { ...form } : r));
      showToast(`Role "${form.label}" updated!`);
    }
    setRoleModal(null);
  };
  const handleDeleteRole = () => {
    setCustomRoles(prev => prev.filter(r => r.id !== roleModal.data.id));
    showToast('Role deleted.');
    setRoleModal(null);
  };

  // Delivery
  const [editingZoneIndex, setEditingZoneIndex] = useState(null);
  const [editZoneValues, setEditZoneValues] = useState({ district: '', fee: 0 });
  const [deliveryFees, setDeliveryFees] = useState([
    { district: 'Colombo 01–15',         fee: 500 },
    { district: 'Dehiwala / Mt Lavinia', fee: 700 },
    { district: 'Moratuwa',              fee: 1000 },
    { district: 'Nugegoda / Maharagama', fee: 800 },
  ]);

  // CMS
  const [cmsContent, setCmsContent] = useState({
    faq:    'Q: How much notice do you need?\nA: We require at least 48 hours for custom cakes.\n\nQ: Do you deliver?\nA: Yes, within Colombo district.',
    policy: '1. 50% advance payment required for custom orders.\n2. Cancellations must be made 24 hours prior to delivery.\n3. Cash on Delivery is available for standard items.',
  });

  if (adminData?.role !== 'super_admin' && adminData?.role !== 'content_manager') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><Shield className="w-8 h-8 text-gray-400" /></div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h2>
        <p className="text-sm text-gray-500">You do not have permission to view system settings.</p>
      </div>
    );
  }

  const tabs = [
    adminData?.role === 'super_admin' && { id: 'access',   label: 'Access Governance', icon: Users },
    adminData?.role === 'super_admin' && { id: 'delivery', label: 'Delivery Mapping',  icon: Map },
    { id: 'cms', label: 'Content CMS', icon: FileText },
  ].filter(Boolean);

  return (
    <div className="space-y-6">

      {/* Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{saveToast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">System Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage staff access, delivery zones, and website content.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#B76E79] text-[#B76E79] bg-[#B76E79]/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">

        {/* ── ACCESS GOVERNANCE ── */}
        {activeTab === 'access' && adminData?.role === 'super_admin' && (
          <>
            {/* ── STAFF TABLE ── */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Backend Staff Profiles</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Manage Role-Based Access Control (RBAC) permissions.</p>
                </div>
                <button onClick={() => setStaffModal({ mode: 'add', data: null })} className="inline-flex items-center gap-2 px-4 py-2 bg-[#B76E79] text-white rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors">
                  <Plus className="w-4 h-4" /> Add Staff
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Member</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Permissions</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staff.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#B76E79]/10 flex items-center justify-center font-bold text-[#B76E79] text-sm shrink-0">{s.name.charAt(0).toUpperCase()}</div>
                            <div><p className="font-semibold text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${roleBadgeClass(s.role, allRoles)}`}>{getRoleLabel(s.role, allRoles)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {s.role === 'super_admin'
                            ? <span className="text-xs text-[#B76E79] font-semibold">All permissions</span>
                            : <span className="text-xs text-gray-500">{(s.permissions || []).length} permission{(s.permissions || []).length !== 1 ? 's' : ''}</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />{s.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setStaffModal({ mode: 'view', data: s })} title="View" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                            {s.role !== 'super_admin' && <>
                              <button onClick={() => handleToggleActive(s.id)} title={s.active !== false ? 'Deactivate' : 'Activate'} className={`p-2 rounded-lg transition-colors ${s.active !== false ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'}`}><Power className="w-4 h-4" /></button>
                              <button onClick={() => setStaffModal({ mode: 'edit', data: { ...s } })} title="Edit" className="p-2 text-gray-400 hover:text-[#B76E79] hover:bg-[#B76E79]/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setStaffModal({ mode: 'delete', data: s })} title="Remove" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── ROLES TABLE ── */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Role Management</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create and manage custom roles with specific permission sets.</p>
                </div>
                <button onClick={() => setRoleModal({ mode: 'create', data: null })} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#B76E79] text-[#B76E79] rounded-xl text-sm font-semibold hover:bg-[#B76E79] hover:text-white transition-all">
                  <Tag className="w-4 h-4" /> Create Role
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Description</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Permissions</th>
                      <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Type</th>
                      <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {/* Super Admin row */}
                    <tr className="hover:bg-gray-50/70">
                      <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${roleBadgeClass('super_admin', allRoles)}`}>Super Admin</span></td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">Full unrestricted access to all features.</td>
                      <td className="px-4 py-3.5 text-xs text-[#B76E79] font-semibold">All permissions</td>
                      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap"><Lock className="w-3 h-3" /> Built-in</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-xs text-gray-300">—</span></td>
                    </tr>
                    {allRoles.map((role, idx) => (
                      <tr key={role.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${roleBadgeClass(role.id, allRoles)}`}>{role.label}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[180px]">{role.description || '—'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3.5">
                          {role.builtIn
                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap"><Lock className="w-3 h-3" /> Built-in</span>
                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B76E79]/10 text-[#B76E79] text-xs font-medium rounded-full whitespace-nowrap"><Tag className="w-3 h-3" /> Custom</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {!role.builtIn && <>
                              <button onClick={() => setRoleModal({ mode: 'edit', data: { ...role } })} title="Edit" className="p-2 text-gray-400 hover:text-[#B76E79] hover:bg-[#B76E79]/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setRoleModal({ mode: 'delete', data: role })} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </>}
                            {role.builtIn && <span className="text-xs text-gray-300 pr-2">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── DELIVERY MAPPING ── */}
        {activeTab === 'delivery' && adminData?.role === 'super_admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
              <div><h3 className="text-base font-bold text-gray-900">District Delivery Fees</h3><p className="text-sm text-gray-500 mt-0.5">Map geolocation zones to flat-rate delivery fees.</p></div>
              <button onClick={() => { const d = window.prompt('District:'); if (!d) return; const f = window.prompt(`Fee (LKR) for ${d}:`, '500'); if (!f) return; setDeliveryFees(p => [...p, { district: d, fee: Number(f) || 0 }]); }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#B76E79] text-white rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors">
                <Plus className="w-4 h-4" /> Add Zone
              </button>
            </div>
            <div className="space-y-3">
              {deliveryFees.map((df, i) => {
                const isEditing = editingZoneIndex === i;
                return (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <input type="text" value={isEditing ? editZoneValues.district : df.district} readOnly={!isEditing} onChange={e => setEditZoneValues({ ...editZoneValues, district: e.target.value })} className={`sm:col-span-2 p-2.5 rounded-lg text-sm bg-white focus:outline-none ${isEditing ? 'border border-gray-200 focus:ring-2 focus:ring-[#B76E79]' : 'border-transparent cursor-default'}`} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">LKR</span>
                      <input type="number" value={isEditing ? editZoneValues.fee : df.fee} readOnly={!isEditing} onChange={e => setEditZoneValues({ ...editZoneValues, fee: e.target.value })} className={`flex-1 p-2.5 rounded-lg text-sm bg-white focus:outline-none ${isEditing ? 'border border-gray-200 focus:ring-2 focus:ring-[#B76E79]' : 'border-transparent cursor-default'}`} />
                      {isEditing
                        ? <button onClick={() => { const nf = [...deliveryFees]; nf[i] = { district: editZoneValues.district, fee: Number(editZoneValues.fee) || 0 }; setDeliveryFees(nf); setEditingZoneIndex(null); }} className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"><Save className="w-4 h-4" /></button>
                        : <button onClick={() => { setEditingZoneIndex(i); setEditZoneValues({ district: df.district, fee: df.fee }); }} className="p-2 text-[#B76E79] hover:bg-[#B76E79]/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>}
                      <button onClick={() => setDeliveryFees(p => p.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENT CMS ── */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4"><h3 className="text-base font-bold text-gray-900">Informational Texts</h3><p className="text-sm text-gray-500 mt-0.5">Control FAQ and delivery policy texts displayed on the website.</p></div>
            <div className="space-y-5">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">FAQ Content</label><textarea rows="6" className="w-full p-4 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#B76E79] outline-none resize-none" value={cmsContent.faq} onChange={e => setCmsContent({ ...cmsContent, faq: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Delivery &amp; Refund Policy</label><textarea rows="6" className="w-full p-4 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#B76E79] outline-none resize-none" value={cmsContent.policy} onChange={e => setCmsContent({ ...cmsContent, policy: e.target.value })} /></div>
              <div className="flex justify-end pt-2"><button onClick={() => showToast('Content published!')} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B76E79] text-white rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors"><Save className="w-4 h-4" /> Publish Changes</button></div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {staffModal?.mode === 'view'   && <ViewStaffModal staff={staffModal.data} allRoles={allRoles} onClose={() => setStaffModal(null)} />}
      {(staffModal?.mode === 'add' || staffModal?.mode === 'edit') && (
        <StaffModal mode={staffModal.mode} initialData={staffModal.data} allRoles={allRoles} onSave={handleSaveStaff} onClose={() => setStaffModal(null)} />
      )}
      {staffModal?.mode === 'delete' && (
        <DeleteModal title="Remove Staff Member" message={<>Are you sure you want to remove <strong>{staffModal.data.name}</strong>? This cannot be undone.</>} onConfirm={handleDeleteStaff} onClose={() => setStaffModal(null)} />
      )}
      {(roleModal?.mode === 'create' || roleModal?.mode === 'edit') && (
        <RoleModal mode={roleModal.mode} initialData={roleModal.data} onSave={handleSaveRole} onClose={() => setRoleModal(null)} />
      )}
      {roleModal?.mode === 'delete' && (
        <DeleteModal title="Delete Role" message={<>Are you sure you want to delete the <strong>{roleModal.data.label}</strong> role? Staff assigned to this role will not be removed.</>} onConfirm={handleDeleteRole} onClose={() => setRoleModal(null)} />
      )}
    </div>
  );
};

export default Settings;
