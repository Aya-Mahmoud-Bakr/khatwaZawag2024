/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FileStatus = 'جديد' | 'نشط' | 'تم الترشيح' | 'تم التواصل' | 'خطوبة' | 'زواج' | 'غير نشط';

export interface GroomRecord {
  id: string;
  type: 'groom';
  status: FileStatus;
  registrationDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string

  firstName: string;
  age: number;
  governorate: string;
  city: string;
  originGovernorate?: string;
  originCity?: string;
  education: string;
  job: string;
  maritalStatus: string;
  financialStatus: string;
  height: number;
  smoking: string; // "يدخن" | "لا يدخن"
  religiosity: string;
  readyIn6Months: string; // "نعم" | "لا" | "محتمل"
  requiredSpecs: string;
  whatsapp: string;
  preferredContact: string; // "واتساب" | "رابط فيسبوك" | "رابط تليجرام"
  selfDescription: string;
  photo?: string;
  adminCode: string;
  additionalNotes?: string;
}

export interface BrideRecord {
  id: string;
  type: 'bride';
  status: FileStatus;
  registrationDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string

  firstName: string;
  age: number;
  governorate: string;
  city: string;
  originGovernorate?: string;
  originCity?: string;
  education: string;
  job: string;
  maritalStatus: string;
  height: number;
  religiosity: string;
  requiredSpecs: string;
  contactMethod: string; // legacy support
  contactDetails: string; // phone number / fb link / telegram link
  preferredContact: string; // "واتساب" | "رابط فيسبوك" | "رابط تليجرام"
  selfDescription: string;
  photo?: string;
  adminCode: string;
  additionalNotes?: string;
}

export interface Article {
  id: string;
  title: string;
  image: string; // Image URL or Base64
  content: string;
  publishDate: string;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string; // Cover image URL or Base64
  description: string;
  downloadUrl: string;
}

export interface AdminStats {
  groomsCount: number;
  bridesCount: number;
  dailyRegistrations: { [date: string]: number };
  topGovernorates: { name: string; count: number }[];
}

export interface SearchFilters {
  governorate?: string;
  minAge?: number;
  maxAge?: number;
  job?: string;
  education?: string;
  maritalStatus?: string;
  status?: string;
}

export interface AIMatchRecord {
  groomId: string;
  brideId: string;
  aiScore: number;
  aiAnalysis: string;
  approvedByAdmin: boolean;
  contactRequestedByGroom?: boolean;
  contactRequestedByBride?: boolean;
}

