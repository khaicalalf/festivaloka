import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

// PartialType mewarisi semua field dari CreateTenantDto (name, category, dll)
// TAPI mengubah semuanya menjadi OPSIONAL (tidak wajib diisi).
// Cocok untuk Update, misal cuma mau ganti alamat aja.
export class UpdateTenantDto extends PartialType(CreateTenantDto) { }