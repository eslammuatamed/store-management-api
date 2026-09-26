import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller.js';
import { RolesService } from './roles/roles.service.js';
import { PermissionsController } from './permissions/permissions.controller.js';
import { PermissionsService } from './permissions/permissions.service.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService],
})
export class AccessControlModule {}
