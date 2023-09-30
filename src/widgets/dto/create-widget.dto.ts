import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateWidgetDto {
  @ApiProperty({ name: 'name' })
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;
}
