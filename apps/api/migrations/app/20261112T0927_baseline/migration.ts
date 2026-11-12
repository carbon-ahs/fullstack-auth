#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/10ac64dd2714d3f82d3e720de7dbd40adc6ef60a71db700a1fa445e5c1ac2bdd/contract';
import endContract from '../../snapshots/10ac64dd2714d3f82d3e720de7dbd40adc6ef60a71db700a1fa445e5c1ac2bdd/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'Role',
        members: ['ADMIN', 'EDITOR', 'USER'],
      }),
      this.createTable({
        schema: 'public',
        table: 'Category',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('img', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'Category_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'Comment',
        columns: [
          col('createdAt', 'timestamp(6)', {
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 6 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('post_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('text', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'Comment_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'Post',
        columns: [
          col('catSlug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('desc', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('img', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userEmail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('views', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'Post_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('hashedRefreshToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"Role"', {
            notNull: true,
            default: lit('USER'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'Role' } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'User_pkey' })],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Category',
        index: 'Category_slug_key',
        columns: ['slug'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_slug_key',
        columns: ['slug'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_email_key',
        columns: ['email'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comment',
        foreignKey: {
          name: 'comments_author_id_users_id_fk',
          columns: ['user_id'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comment',
        foreignKey: {
          name: 'comments_post_id_posts_id_fk',
          columns: ['post_id'],
          references: { schema: 'public', table: 'Post', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_catSlug_fkey',
          columns: ['catSlug'],
          references: { schema: 'public', table: 'Category', columns: ['slug'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_userEmail_fkey',
          columns: ['userEmail'],
          references: { schema: 'public', table: 'User', columns: ['email'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
