import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import {
  type CreateRoleDto,
  createRoleSchema,
  roleResponseSchema,
  rolesResponseSchema,
  type UpdateRoleDto,
  updateRoleSchema,
} from './schemas/role.schema.js';
import { bigintIdSchema } from '../../../common/schemas/id.schema.js';
import {
  syncRolePermissionsSchema,
  type SyncRolePermissionsDto,
} from './schemas/sync-role-permissions.schema.js';
import { ApiSuccessResponse } from '../../../common/decorators/api-success-response.decorator.js';
import { permissionsResponseSchema } from '../permissions/schemas/permission.schema.js';
import { ApiErrorResponses } from '../../../common/decorators/api-error-responses.decorator.js';
import {
  type RoleQueryDto,
  roleQuerySchema,
} from './schemas/role-query.schema.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: 'Role created successfully',
    dataSchema: roleResponseSchema,
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT)
  async create(@Body({ schema: createRoleSchema }) body: CreateRoleDto) {
    return this.rolesService.create(body);
  }

  @Get()
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Roles retrieved successfully',
    dataSchema: rolesResponseSchema,
    isPaginated: true,
  })
  async findAll(@Query({ schema: roleQuerySchema }) query: RoleQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Role retrieved successfully',
    dataSchema: roleResponseSchema,
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  async findOne(@Param('id', { schema: bigintIdSchema }) id: bigint) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Role updated successfully',
    dataSchema: roleResponseSchema,
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
  )
  async update(
    @Param('id', { schema: bigintIdSchema }) id: bigint,
    @Body({ schema: updateRoleSchema }) body: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Role deleted successfully',
    dataSchema: roleResponseSchema,
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
  )
  async delete(@Param('id', { schema: bigintIdSchema }) id: bigint) {
    return this.rolesService.delete(id);
  }

  @Get(':id/permissions')
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Role permissions retrieved successfully',
    dataSchema: permissionsResponseSchema,
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  async findPermissions(@Param('id', { schema: bigintIdSchema }) id: bigint) {
    return this.rolesService.findPermissions(id);
  }

  @Put(':id/permissions')
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Role permissions synced successfully',
    dataSchema: permissionsResponseSchema,
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
  )
  async syncPermissions(
    @Param('id', { schema: bigintIdSchema }) id: bigint,
    @Body({ schema: syncRolePermissionsSchema }) body: SyncRolePermissionsDto,
  ) {
    return this.rolesService.syncPermissions(id, body);
  }
}
