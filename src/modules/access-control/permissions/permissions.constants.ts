type ScopePolicy = 'global_only' | 'location_or_global';

interface PermissionAction {
  name: string;
  description: string;
  scopePolicy?: ScopePolicy;
}

interface PermissionResource {
  resource: string;
  scopePolicy: ScopePolicy;
  actions: PermissionAction[];
}

export const PERMISSION_CATALOG: PermissionResource[] = [
  {
    resource: 'permissions',
    actions: [
      {
        name: 'read',
        description: 'View permissions',
      },
    ],
    scopePolicy: 'global_only',
  },

  {
    resource: 'roles',
    actions: [
      {
        name: 'read',
        description: 'View roles',
      },
      {
        name: 'create',
        description: 'Create roles',
      },
      {
        name: 'update',
        description: 'Update roles',
      },
      {
        name: 'delete',
        description: 'Delete roles',
      },
      {
        name: 'assign_permissions',
        description: 'Assign permissions to roles',
      },
    ],
    scopePolicy: 'global_only',
  },
];
