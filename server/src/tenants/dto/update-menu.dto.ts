import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';

// Kita copy semua field dari CreateMenuDto tapi jadikan Opsional
export class UpdateMenuDto extends PartialType(CreateMenuDto) { }