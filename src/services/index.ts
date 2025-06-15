
// Index de serviços - integração completa com todas as tabelas do Supabase
export * from './notesService';
export * from './thumbnailService';
export * from './printService';
export * from './customersService';
export * from './productsService';
export * from './ecommerceService';
export * from './sellersService';
export * from './ordersService';
export * from './userRolesService';

// Re-exportar para facilitar o uso em outros módulos
import { NotesService } from './notesService';
import { ThumbnailService } from './thumbnailService';
import { PrintService } from './printService';
import { CustomersService } from './customersService';
import { ProductsService } from './productsService';
import { EcommerceService } from './ecommerceService';
import { SellersService } from './sellersService';
import { OrdersService } from './ordersService';
import { UserRolesService } from './userRolesService';

export default {
  NotesService,
  ThumbnailService,
  PrintService,
  CustomersService,
  ProductsService,
  EcommerceService,
  SellersService,
  OrdersService,
  UserRolesService
}; 
