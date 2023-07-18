import { IsNumber, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NodeDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes?: NodeDto[];
}

export class CreateNodeDto implements Partial<NodeDto> {
  @IsNumber()
  id?: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

export class UpdateNodeDto implements Partial<CreateNodeDto> {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}
