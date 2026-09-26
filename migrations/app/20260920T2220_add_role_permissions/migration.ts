#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5d3bcf2d5b427729559c6a13e22aa0c2930051abfde7b57a1ed278c5b4af7d3f/contract';
import startContract from '../../snapshots/5d3bcf2d5b427729559c6a13e22aa0c2930051abfde7b57a1ed278c5b4af7d3f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7586e9be074545d8322057c305bc4e6f9ca2b0d13585c82a1180a8a5f1d14fc9/contract';
import endContract from '../../snapshots/7586e9be074545d8322057c305bc4e6f9ca2b0d13585c82a1180a8a5f1d14fc9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'role_permissions',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('permission_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('role_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['role_id', 'permission_id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permissions',
        index: 'role_permissions_permission_id_idx_909cec36',
        columns: ['permission_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permissions',
        index: 'role_permissions_role_id_idx_d9467c50',
        columns: ['role_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'role_permissions',
        foreignKey: {
          name: 'role_permissions_role_id_fkey',
          columns: ['role_id'],
          references: { schema: 'public', table: 'roles', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'role_permissions',
        foreignKey: {
          name: 'role_permissions_permission_id_fkey',
          columns: ['permission_id'],
          references: { schema: 'public', table: 'permissions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
