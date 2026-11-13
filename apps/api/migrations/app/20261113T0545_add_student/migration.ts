#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/601f3e0cd909a027e2d85ad2d3c88b3683ebaaa338eec809074d03bcb28b5c3c/contract';
import startContract from '../../snapshots/601f3e0cd909a027e2d85ad2d3c88b3683ebaaa338eec809074d03bcb28b5c3c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/aa2bf176a9523e08a1104562bc6eb8b073fa7dbb4a843c29c4a00ed84c18e34f/contract';
import endContract from '../../snapshots/aa2bf176a9523e08a1104562bc6eb8b073fa7dbb4a843c29c4a00ed84c18e34f/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Student',
        columns: [
          col('cadetNumber', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('classLevel', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'Student_pkey' })],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Student',
        index: 'Student_cadetNumber_key',
        columns: ['cadetNumber'],
        extras: { unique: true },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
