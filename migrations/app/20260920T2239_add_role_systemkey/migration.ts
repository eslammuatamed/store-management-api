#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/231d78b2ecf5aafb0d67ea639fb0edcb335451d2e663606afec2be1d01201c33/contract';
import endContract from '../../snapshots/231d78b2ecf5aafb0d67ea639fb0edcb335451d2e663606afec2be1d01201c33/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7586e9be074545d8322057c305bc4e6f9ca2b0d13585c82a1180a8a5f1d14fc9/contract';
import startContract from '../../snapshots/7586e9be074545d8322057c305bc4e6f9ca2b0d13585c82a1180a8a5f1d14fc9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'roles',
        column: col('system_key', 'character varying(80)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 80 } },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_system_key_key',
        columns: ['system_key'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
