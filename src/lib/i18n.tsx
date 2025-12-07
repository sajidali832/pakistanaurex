"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ur';

interface Translations {
  [key: string]: {
    en: string;
    ur: string;
  };
}

export const translations: Translations = {
  // App Name
  appName: { en: 'AUREX', ur: 'آریکس' },
  businessManagement: { en: 'AUREX', ur: 'آریکس' },
  tagline: { en: 'Smart Business Management for Pakistan', ur: 'پاکستان کے لیے سمارٹ بزنس مینجمنٹ' },
  
  // Navigation
  dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  invoices: { en: 'Invoices', ur: 'انوائسز' },
  quotations: { en: 'Quotations', ur: 'کوٹیشنز' },
  clients: { en: 'Clients', ur: 'کلائنٹس' },
  items: { en: 'Items', ur: 'آئٹمز' },
  reports: { en: 'Reports', ur: 'رپورٹس' },
  settings: { en: 'Settings', ur: 'ترتیبات' },
  bankExport: { en: 'Bank Export', ur: 'بینک ایکسپورٹ' },
  
  // Auth
  login: { en: 'Login', ur: 'لاگ ان' },
  register: { en: 'Register', ur: 'رجسٹر' },
  logout: { en: 'Logout', ur: 'لاگ آؤٹ' },
  email: { en: 'Email', ur: 'ای میل' },
  password: { en: 'Password', ur: 'پاس ورڈ' },
  confirmPassword: { en: 'Confirm Password', ur: 'پاس ورڈ کی تصدیق' },
  name: { en: 'Name', ur: 'نام' },
  rememberMe: { en: 'Remember me', ur: 'مجھے یاد رکھیں' },
  forgotPassword: { en: 'Forgot password?', ur: 'پاس ورڈ بھول گئے؟' },
  noAccount: { en: "Don't have an account?", ur: 'اکاؤنٹ نہیں ہے؟' },
  hasAccount: { en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟' },
  signIn: { en: 'Sign In', ur: 'سائن ان' },
  signUp: { en: 'Sign Up', ur: 'سائن اپ' },
  
  // Dashboard
  totalRevenue: { en: 'Total Revenue', ur: 'کل آمدنی' },
  unpaidInvoices: { en: 'Unpaid Invoices', ur: 'غیر ادا شدہ انوائسز' },
  totalClients: { en: 'Total Clients', ur: 'کل کلائنٹس' },
  pendingQuotations: { en: 'Pending Quotations', ur: 'زیر التوا کوٹیشنز' },
  recentInvoices: { en: 'Recent Invoices', ur: 'حالیہ انوائسز' },
  recentQuotations: { en: 'Recent Quotations', ur: 'حالیہ کوٹیشنز' },
  cashFlowSummary: { en: 'Cash Flow Summary', ur: 'نقد بہاؤ کا خلاصہ' },
  
  // Invoice
  createInvoice: { en: 'Create Invoice', ur: 'انوائس بنائیں' },
  editInvoice: { en: 'Edit Invoice', ur: 'انوائس میں ترمیم' },
  invoiceNumber: { en: 'Invoice Number', ur: 'انوائس نمبر' },
  issueDate: { en: 'Issue Date', ur: 'اجرا کی تاریخ' },
  dueDate: { en: 'Due Date', ur: 'آخری تاریخ' },
  client: { en: 'Client', ur: 'کلائنٹ' },
  selectClient: { en: 'Select Client', ur: 'کلائنٹ منتخب کریں' },
  addItem: { en: 'Add Item', ur: 'آئٹم شامل کریں' },
  description: { en: 'Description', ur: 'تفصیل' },
  quantity: { en: 'Quantity', ur: 'مقدار' },
  unitPrice: { en: 'Unit Price', ur: 'یونٹ قیمت' },
  tax: { en: 'Tax', ur: 'ٹیکس' },
  total: { en: 'Total', ur: 'کل' },
  subtotal: { en: 'Subtotal', ur: 'ذیلی کل' },
  discount: { en: 'Discount', ur: 'رعایت' },
  grandTotal: { en: 'Grand Total', ur: 'مجموعی کل' },
  notes: { en: 'Notes', ur: 'نوٹس' },
  terms: { en: 'Terms & Conditions', ur: 'شرائط و ضوابط' },
  save: { en: 'Save', ur: 'محفوظ کریں' },
  saveDraft: { en: 'Save as Draft', ur: 'ڈرافٹ کے طور پر محفوظ کریں' },
  send: { en: 'Send', ur: 'بھیجیں' },
  print: { en: 'Print', ur: 'پرنٹ' },
  download: { en: 'Download', ur: 'ڈاؤن لوڈ' },
  exportPDF: { en: 'Export PDF', ur: 'پی ڈی ایف ایکسپورٹ' },
  exportCSV: { en: 'Export CSV', ur: 'سی ایس وی ایکسپورٹ' },
  exportExcel: { en: 'Export Excel', ur: 'ایکسل ایکسپورٹ' },
  
  // Status
  draft: { en: 'Draft', ur: 'ڈرافٹ' },
  sent: { en: 'Sent', ur: 'بھیجا گیا' },
  paid: { en: 'Paid', ur: 'ادا شدہ' },
  overdue: { en: 'Overdue', ur: 'تاخیر شدہ' },
  cancelled: { en: 'Cancelled', ur: 'منسوخ' },
  accepted: { en: 'Accepted', ur: 'قبول شدہ' },
  rejected: { en: 'Rejected', ur: 'مسترد' },
  converted: { en: 'Converted', ur: 'تبدیل شدہ' },
  
  // Quotation
  createQuotation: { en: 'Create Quotation', ur: 'کوٹیشن بنائیں' },
  editQuotation: { en: 'Edit Quotation', ur: 'کوٹیشن میں ترمیم' },
  quotationNumber: { en: 'Quotation Number', ur: 'کوٹیشن نمبر' },
  validUntil: { en: 'Valid Until', ur: 'تک درست' },
  convertToInvoice: { en: 'Convert to Invoice', ur: 'انوائس میں تبدیل کریں' },
  
  // Client
  addClient: { en: 'Add Client', ur: 'کلائنٹ شامل کریں' },
  editClient: { en: 'Edit Client', ur: 'کلائنٹ میں ترمیم' },
  clientName: { en: 'Client Name', ur: 'کلائنٹ کا نام' },
  clientNameUrdu: { en: 'Client Name (Urdu)', ur: 'کلائنٹ کا نام (اردو)' },
  phone: { en: 'Phone', ur: 'فون' },
  address: { en: 'Address', ur: 'پتہ' },
  city: { en: 'City', ur: 'شہر' },
  ntn: { en: 'NTN Number', ur: 'این ٹی این نمبر' },
  contactPerson: { en: 'Contact Person', ur: 'رابطہ شخص' },
  balance: { en: 'Balance', ur: 'بقایا' },
  
  // Items
  addNewItem: { en: 'Add New Item', ur: 'نیا آئٹم شامل کریں' },
  editItem: { en: 'Edit Item', ur: 'آئٹم میں ترمیم' },
  itemName: { en: 'Item Name', ur: 'آئٹم کا نام' },
  itemNameUrdu: { en: 'Item Name (Urdu)', ur: 'آئٹم کا نام (اردو)' },
  sku: { en: 'SKU', ur: 'ایس کے یو' },
  unit: { en: 'Unit', ur: 'یونٹ' },
  taxRate: { en: 'Tax Rate (%)', ur: 'ٹیکس کی شرح (%)' },
  service: { en: 'Service', ur: 'سروس' },
  product: { en: 'Product', ur: 'پروڈکٹ' },
  
  // Bank Export
  exportForJazzCash: { en: 'Export for JazzCash', ur: 'جاز کیش کے لیے ایکسپورٹ' },
  exportForEasyPaisa: { en: 'Export for EasyPaisa', ur: 'ایزی پیسہ کے لیے ایکسپورٹ' },
  bankReconciliation: { en: 'Bank Reconciliation', ur: 'بینک مطابقت' },
  importBankStatement: { en: 'Import Bank Statement', ur: 'بینک سٹیٹمنٹ درآمد کریں' },
  matchTransactions: { en: 'Match Transactions', ur: 'لین دین کا ملاپ' },
  
  // Common
  actions: { en: 'Actions', ur: 'اعمال' },
  delete: { en: 'Delete', ur: 'حذف کریں' },
  edit: { en: 'Edit', ur: 'ترمیم کریں' },
  view: { en: 'View', ur: 'دیکھیں' },
  search: { en: 'Search', ur: 'تلاش کریں' },
  filter: { en: 'Filter', ur: 'فلٹر' },
  all: { en: 'All', ur: 'سب' },
  loading: { en: 'Loading...', ur: 'لوڈ ہو رہا ہے...' },
  noData: { en: 'No data found', ur: 'کوئی ڈیٹا نہیں ملا' },
  success: { en: 'Success', ur: 'کامیابی' },
  error: { en: 'Error', ur: 'خرابی' },
  cancel: { en: 'Cancel', ur: 'منسوخ' },
  confirm: { en: 'Confirm', ur: 'تصدیق' },
  yes: { en: 'Yes', ur: 'ہاں' },
  no: { en: 'No', ur: 'نہیں' },
  currency: { en: 'PKR', ur: 'روپے' },
  
  // Company
  companySettings: { en: 'Company Settings', ur: 'کمپنی کی ترتیبات' },
  companyName: { en: 'Company Name', ur: 'کمپنی کا نام' },
  strnNumber: { en: 'STRN Number', ur: 'ایس ٹی آر این نمبر' },
  bankDetails: { en: 'Bank Details', ur: 'بینک کی تفصیلات' },
  bankName: { en: 'Bank Name', ur: 'بینک کا نام' },
  accountNumber: { en: 'Account Number', ur: 'اکاؤنٹ نمبر' },
  iban: { en: 'IBAN', ur: 'آئی بی اے این' },
  
  // Reports
  salesReport: { en: 'Sales Report', ur: 'فروخت کی رپورٹ' },
  clientReport: { en: 'Client Report', ur: 'کلائنٹ کی رپورٹ' },
  taxReport: { en: 'Tax Report', ur: 'ٹیکس کی رپورٹ' },
  dateRange: { en: 'Date Range', ur: 'تاریخ کی حد' },
  from: { en: 'From', ur: 'سے' },
  to: { en: 'To', ur: 'تک' },
  generateReport: { en: 'Generate Report', ur: 'رپورٹ تیار کریں' },
  
  // Messages
  invoiceCreated: { en: 'Invoice created successfully', ur: 'انوائس کامیابی سے بنائی گئی' },
  invoiceUpdated: { en: 'Invoice updated successfully', ur: 'انوائس کامیابی سے اپڈیٹ ہوئی' },
  invoiceDeleted: { en: 'Invoice deleted successfully', ur: 'انوائس کامیابی سے حذف ہوئی' },
  quotationCreated: { en: 'Quotation created successfully', ur: 'کوٹیشن کامیابی سے بنائی گئی' },
  quotationConverted: { en: 'Quotation converted to invoice', ur: 'کوٹیشن انوائس میں تبدیل ہوگئی' },
  clientAdded: { en: 'Client added successfully', ur: 'کلائنٹ کامیابی سے شامل ہوا' },
  itemAdded: { en: 'Item added successfully', ur: 'آئٹم کامیابی سے شامل ہوا' },
  
  // Validation
  required: { en: 'This field is required', ur: 'یہ فیلڈ ضروری ہے' },
  invalidEmail: { en: 'Invalid email address', ur: 'غلط ای میل ایڈریس' },
  passwordMismatch: { en: 'Passwords do not match', ur: 'پاس ورڈ مماثل نہیں ہیں' },
  minLength: { en: 'Minimum length is', ur: 'کم از کم لمبائی ہے' },
  
  // Welcome
  welcomeBack: { en: 'Welcome back to AUREX', ur: 'آریکس میں خوش آمدید' },
  
  // Theme
  theme: { en: 'Theme', ur: 'تھیم' },
  light: { en: 'Light', ur: 'روشن' },
  dark: { en: 'Dark', ur: 'تاریک' },
  system: { en: 'System', ur: 'سسٹم' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ur';

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ur')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function formatCurrency(amount: number, language: Language = 'en'): string {
  const formatted = new Intl.NumberFormat(language === 'ur' ? 'ur-PK' : 'en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return language === 'ur' ? `${formatted} روپے` : `PKR ${formatted}`;
}

export function formatDate(date: string | Date, language: Language = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}