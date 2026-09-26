export const SUPER_ADMIN_ROLE = {
  systemKey: 'super_admin',
  name: 'Super Admin',
  scopeType: 'global',
  description: 'Full system administration access',
} as const;

export const STARTER_ROLES = [
  {
    systemKey: 'store_admin',
    name: 'Store Admin',
    scopeType: 'global',
    description: 'Store administration role',

    permissions: [
      'roles.read',
      'roles.create',
      'roles.update',
      'permissions.read',
    ],
  },

  {
    systemKey: 'warehouse_manager',
    name: 'Warehouse Manager',
    scopeType: 'location',
    description: 'Warehouse management role',
    permissions: [],
  },

  {
    systemKey: 'branch_manager',
    name: 'Branch Manager',
    scopeType: 'location',
    description: 'Branch management role',
    permissions: [],
  },

  {
    systemKey: 'cashier',
    name: 'Cashier',
    scopeType: 'location',
    description: 'Point of sale cashier role',
    permissions: [],
  },
] as const;
