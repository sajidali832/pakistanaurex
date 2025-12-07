import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  companyId: integer("company_id").references(() => companies.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Companies table - must be defined first as it's referenced by other tables
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  nameUrdu: text('name_urdu'),
  ntnNumber: text('ntn_number'),
  strnNumber: text('strn_number'),
  address: text('address'),
  city: text('city'),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  bankName: text('bank_name'),
  bankAccountNumber: text('bank_account_number'),
  bankIban: text('bank_iban'),
  defaultCurrency: text('default_currency').notNull().default('PKR'),
  createdAt: text('created_at').notNull(),
});

// Users table (for app-level user management, separate from auth)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  phone: text('phone'),
  languagePreference: text('language_preference').notNull().default('en'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Clients table
export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  nameUrdu: text('name_urdu'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  ntnNumber: text('ntn_number'),
  contactPerson: text('contact_person'),
  balance: real('balance').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// Items table (products/services catalog)
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  nameUrdu: text('name_urdu'),
  description: text('description'),
  unitPrice: real('unit_price').notNull(),
  unit: text('unit').notNull().default('piece'),
  taxRate: real('tax_rate').notNull().default(0),
  isService: integer('is_service', { mode: 'boolean' }).notNull().default(false),
  sku: text('sku'),
  createdAt: text('created_at').notNull(),
});

// Invoices table
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  invoiceNumber: text('invoice_number').notNull(),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date'),
  status: text('status').notNull().default('draft'),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  total: real('total').notNull().default(0),
  amountPaid: real('amount_paid').notNull().default(0),
  currency: text('currency').notNull().default('PKR'),
  notes: text('notes'),
  terms: text('terms'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Invoice lines table
export const invoiceLines = sqliteTable('invoice_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  itemId: integer('item_id').references(() => items.id),
  description: text('description').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  taxRate: real('tax_rate').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  lineTotal: real('line_total').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Quotations table
export const quotations = sqliteTable('quotations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  quotationNumber: text('quotation_number').notNull(),
  issueDate: text('issue_date').notNull(),
  validUntil: text('valid_until'),
  status: text('status').notNull().default('draft'),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  total: real('total').notNull().default(0),
  currency: text('currency').notNull().default('PKR'),
  notes: text('notes'),
  terms: text('terms'),
  convertedInvoiceId: integer('converted_invoice_id').references(() => invoices.id),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Quotation lines table
export const quotationLines = sqliteTable('quotation_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quotationId: integer('quotation_id').notNull().references(() => quotations.id),
  itemId: integer('item_id').references(() => items.id),
  description: text('description').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  taxRate: real('tax_rate').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  lineTotal: real('line_total').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Payments table
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  amount: real('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  paymentMethod: text('payment_method'),
  referenceNumber: text('reference_number'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Bank transactions table
export const bankTransactions = sqliteTable('bank_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id),
  transactionDate: text('transaction_date').notNull(),
  description: text('description'),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  reference: text('reference'),
  bankName: text('bank_name'),
  matchedPaymentId: integer('matched_payment_id').references(() => payments.id),
  importedAt: text('imported_at').notNull(),
});