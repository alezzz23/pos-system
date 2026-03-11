import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TablesModule } from './tables/tables.module';
import { UsersModule } from './users/users.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [AuthModule, ProductsModule, OrdersModule, TablesModule, UsersModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
