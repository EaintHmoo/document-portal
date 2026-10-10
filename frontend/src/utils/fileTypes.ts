/** Mirrors the backend's `max:20480` (KB) upload rule. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const MAX_UPLOAD_ERROR = 'This file is larger than 20 MB, the maximum document size.';

export const SUPPORTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] as const;

export const fileTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  pdf: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  doc: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  docx: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  xls: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  xlsx: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ppt: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  pptx: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

export const defaultFileColor = { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
