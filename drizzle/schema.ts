import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('USD'),
  timezone: text('timezone').notNull().default('UTC'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at')
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  isSystemRole: integer('is_system_role').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at')
});
