import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Meta, MetaData } from 'src/common/decorators/meta.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetsService } from './widgets.service';
import { Widget } from '@prisma/client';

@ApiTags('widgets')
@Controller('widgets')
export class WidgetsController {
  // Import logger from nest js but under the hood, pino will be used
  private readonly logger = new Logger(WidgetsController.name);

  constructor(private readonly widgetsService: WidgetsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of widgets.' })
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.widgetsService.findAll({ ...paginationQuery });
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Widget> {
    return this.widgetsService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  async create(
    @MetaData() meta: Meta,
    @Body() createWidgetDto: CreateWidgetDto,
  ) {
    const newWidget = await this.widgetsService.create(createWidgetDto);

    return newWidget;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @MetaData() meta: Meta,
    @Param('id') id: number,
    @Body() updateWidgetDto: UpdateWidgetDto,
  ) {
    await this.widgetsService.update(id, updateWidgetDto);
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@MetaData() meta: Meta, @Param('id') id: number) {
    await this.widgetsService.remove(id);
    return;
  }
}
