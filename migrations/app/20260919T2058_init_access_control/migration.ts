#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5d3bcf2d5b427729559c6a13e22aa0c2930051abfde7b57a1ed278c5b4af7d3f/contract';
import endContract from '../../snapshots/5d3bcf2d5b427729559c6a13e22aa0c2930051abfde7b57a1ed278c5b4af7d3f/contract.json' with { type: 'json' };
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
        constraint: 'roles_name_scope_type_key',
        columns: ['name', 'scope_type'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_id_scope_type_key',
        columns: ['id', 'scope_type'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
