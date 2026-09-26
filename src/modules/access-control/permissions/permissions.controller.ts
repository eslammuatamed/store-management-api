import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { ApiSuccessResponse } from '../../../common/decorators/api-success-response.decorator.js';
import { permissionsResponseSchema } from './schemas/permission.schema.js';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: 'Permissions retrieved successfully',
    dataSchema: permissionsResponseSchema,
  })
  findAll() {
    return this.permissionsService.findAll();
  }
}
