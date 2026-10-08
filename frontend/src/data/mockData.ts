export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  initials: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  documentCount: number;
  color: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX';
  size: string;
  folder: string;
  uploadedBy: string;
  uploadedDate: string;
  version: string;
  status: 'active' | 'archived' | 'pending';
}

export interface Activity {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'login' | 'upload' | 'update' | 'download' | 'delete' | 'folder' | 'logout';
}

export const currentUser: User = {
  id: 'u-001',
  name: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  role: 'admin',
  avatar: '',
  initials: 'SC',
};

export const secondaryUser: User = {
  id: 'u-002',
  name: 'James Miller',
  email: 'james.miller@company.com',
  role: 'user',
  avatar: '',
  initials: 'JM',
};

export const folders: Folder[] = [
  { id: 'f-1', name: 'Legal & Compliance', icon: 'Scale', documentCount: 24, color: 'blue' },
  { id: 'f-2', name: 'Finance & Accounting', icon: 'Wallet', documentCount: 38, color: 'emerald' },
  { id: 'f-3', name: 'Human Resources', icon: 'Users', documentCount: 52, color: 'amber' },
  { id: 'f-4', name: 'Engineering', icon: 'Code2', documentCount: 67, color: 'violet' },
  { id: 'f-5', name: 'Marketing', icon: 'Megaphone', documentCount: 19, color: 'rose' },
  { id: 'f-6', name: 'Operations', icon: 'Settings', documentCount: 31, color: 'cyan' },
];

export const recentDocuments: DocumentItem[] = [
  { id: 'd-1', name: 'Q4 Financial Report 2024', type: 'XLSX', size: '2.4 MB', folder: 'Finance & Accounting', uploadedBy: 'Sarah Chen', uploadedDate: 'Oct 7, 2025', version: 'v3.2', status: 'active' },
  { id: 'd-2', name: 'Employee Handbook v4', type: 'PDF', size: '5.1 MB', folder: 'Human Resources', uploadedBy: 'James Miller', uploadedDate: 'Oct 6, 2025', version: 'v4.0', status: 'active' },
  { id: 'd-3', name: 'API Architecture Spec', type: 'DOCX', size: '890 KB', folder: 'Engineering', uploadedBy: 'Alex Rivera', uploadedDate: 'Oct 6, 2025', version: 'v2.1', status: 'active' },
  { id: 'd-4', name: 'Compliance Audit Q3', type: 'PDF', size: '3.2 MB', folder: 'Legal & Compliance', uploadedBy: 'Sarah Chen', uploadedDate: 'Oct 5, 2025', version: 'v1.0', status: 'pending' },
  { id: 'd-5', name: 'Brand Guidelines 2025', type: 'PPTX', size: '12.7 MB', folder: 'Marketing', uploadedBy: 'Emma Wilson', uploadedDate: 'Oct 4, 2025', version: 'v1.3', status: 'active' },
  { id: 'd-6', name: 'Budget Forecast Q1 2026', type: 'XLS', size: '1.8 MB', folder: 'Finance & Accounting', uploadedBy: 'Sarah Chen', uploadedDate: 'Oct 3, 2025', version: 'v2.0', status: 'active' },
];

export const activities: Activity[] = [
  { id: 'a-1', user: 'Sarah Chen', initials: 'SC', action: 'uploaded', target: 'Q4 Financial Report 2024', timestamp: '2 minutes ago', type: 'upload' },
  { id: 'a-2', user: 'James Miller', initials: 'JM', action: 'downloaded', target: 'Employee Handbook v4', timestamp: '15 minutes ago', type: 'download' },
  { id: 'a-3', user: 'Alex Rivera', initials: 'AR', action: 'updated', target: 'API Architecture Spec', timestamp: '1 hour ago', type: 'update' },
  { id: 'a-4', user: 'Emma Wilson', initials: 'EW', action: 'created folder', target: 'Marketing', timestamp: '2 hours ago', type: 'folder' },
  { id: 'a-5', user: 'Sarah Chen', initials: 'SC', action: 'deleted', target: 'Old Compliance Draft', timestamp: '3 hours ago', type: 'delete' },
  { id: 'a-6', user: 'James Miller', initials: 'JM', action: 'logged in', target: '', timestamp: '4 hours ago', type: 'login' },
  { id: 'a-7', user: 'Alex Rivera', initials: 'AR', action: 'uploaded', target: 'API Architecture Spec', timestamp: '5 hours ago', type: 'upload' },
  { id: 'a-8', user: 'Emma Wilson', initials: 'EW', action: 'logged out', target: '', timestamp: '6 hours ago', type: 'logout' },
];

export const stats = {
  admin: [
    { id: 's-1', label: 'Total Users', value: 247, change: '+12', trend: 'up', icon: 'Users', color: 'blue' },
    { id: 's-2', label: 'Total Documents', value: 1284, change: '+87', trend: 'up', icon: 'FileText', color: 'emerald' },
    { id: 's-3', label: 'Total Folders', value: 6, change: '+1', trend: 'up', icon: 'FolderOpen', color: 'amber' },
    { id: 's-4', label: 'Storage Used', value: '47.2 GB', change: '+2.1 GB', trend: 'up', icon: 'Database', color: 'violet' },
  ],
  user: [
    { id: 's-1', label: 'My Documents', value: 42, change: '+5', trend: 'up', icon: 'FileText', color: 'emerald' },
    { id: 's-2', label: 'Accessible Folders', value: 4, change: '0', trend: 'flat', icon: 'FolderOpen', color: 'amber' },
    { id: 's-3', label: 'Recent Downloads', value: 18, change: '+3', trend: 'up', icon: 'Download', color: 'blue' },
    { id: 's-4', label: 'Pending Review', value: 3, change: '-1', trend: 'down', icon: 'Clock', color: 'rose' },
  ],
};

export const fileTypeColors: Record<DocumentItem['type'], { bg: string; text: string; border: string }> = {
  PDF: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  DOC: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  DOCX: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  XLS: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  XLSX: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  PPT: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  PPTX: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};
