import { db } from './db.js';

import { seedAccessControlSystem } from './seeds/access-control-system.seed.js';
import { seedStarterRoles } from './seeds/starter-roles.seed.js';

async function main() {
  await db.connect();

  try {
    await seedAccessControlSystem();
    await seedStarterRoles();

    console.log('Database seeded successfully');
  } finally {
    await db.close();
  }
}

await main();
