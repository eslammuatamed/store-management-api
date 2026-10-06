#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3559fa81f7e175927f379e84a9ff7cb3d8e4301edbcf9d63f34000dac5b3df3d/contract';
import endContract from '../../snapshots/3559fa81f7e175927f379e84a9ff7cb3d8e4301edbcf9d63f34000dac5b3df3d/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'permissions',
        columns: [
          col('code', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'character varying(500)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 500 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('scope_policy', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'permissions_scope_policy_check_bba20fcf',
            "\"scope_policy\" IN ('global_only', 'location_or_global')",
          ),
        ],
      }),
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
      this.createTable({
        schema: 'public',
        table: 'roles',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'character varying(500)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 500 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('is_protected', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(120)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 120 } },
          }),
          col('scope_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('system_key', 'character varying(80)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 80 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'roles_scope_type_check_dc73adcc',
            "\"scope_type\" IN ('global', 'location')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'permissions',
        constraint: 'permissions_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_system_key_key',
        columns: ['system_key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_id_scope_type_key',
        columns: ['id', 'scope_type'],
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
