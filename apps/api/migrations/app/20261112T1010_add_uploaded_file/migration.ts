#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/10ac64dd2714d3f82d3e720de7dbd40adc6ef60a71db700a1fa445e5c1ac2bdd/contract';
import startContract from '../../snapshots/10ac64dd2714d3f82d3e720de7dbd40adc6ef60a71db700a1fa445e5c1ac2bdd/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/601f3e0cd909a027e2d85ad2d3c88b3683ebaaa338eec809074d03bcb28b5c3c/contract';
import endContract from '../../snapshots/601f3e0cd909a027e2d85ad2d3c88b3683ebaaa338eec809074d03bcb28b5c3c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'FilePurpose',
        members: ['STUDENT_IMPORT', 'PROFILE_IMAGE', 'DOCUMENT'],
      }),
      this.createTable({
        schema: 'public',
        table: 'UploadedFile',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('mimeType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('originalName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('purpose', '"FilePurpose"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'FilePurpose' } },
          }),
          col('size', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('storageKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'UploadedFile_pkey' })],
      }),
      this.addUnique({
        schema: 'public',
        table: 'UploadedFile',
        constraint: 'UploadedFile_storageKey_key',
        columns: ['storageKey'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'UploadedFile',
        index: 'UploadedFile_purpose_idx_73d3df4c',
        columns: ['purpose'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
