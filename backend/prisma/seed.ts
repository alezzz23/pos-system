import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      email: 'admin@pos.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
      active: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create waiter users
  const waiterPassword = await bcrypt.hash('mesero123', 10);
  const waiters = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria@pos.com' },
      update: {},
      create: {
        email: 'maria@pos.com',
        password: waiterPassword,
        firstName: 'María',
        lastName: 'García',
        role: 'WAITER',
        phone: '555-1234',
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'juan@pos.com' },
      update: {},
      create: {
        email: 'juan@pos.com',
        password: waiterPassword,
        firstName: 'Juan',
        lastName: 'López',
        role: 'WAITER',
        phone: '555-2345',
        active: true,
      },
    }),
  ]);
  console.log('✅ Waiters created:', waiters.length);

  // Create kitchen user
  const kitchenPassword = await bcrypt.hash('cocina123', 10);
  await prisma.user.upsert({
    where: { email: 'cocina@pos.com' },
    update: {},
    create: {
      email: 'cocina@pos.com',
      password: kitchenPassword,
      firstName: 'Chef',
      lastName: 'Principal',
      role: 'KITCHEN',
      active: true,
    },
  });
  console.log('✅ Kitchen user created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-entradas' },
      update: {},
      create: {
        id: 'cat-entradas',
        name: 'Entradas',
        description: 'Aperitivos y entradas',
        active: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-principales' },
      update: {},
      create: {
        id: 'cat-principales',
        name: 'Platos Principales',
        description: 'Platos fuertes',
        active: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-postres' },
      update: {},
      create: {
        id: 'cat-postres',
        name: 'Postres',
        description: 'Dulces y postres',
        active: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-bebidas' },
      update: {},
      create: {
        id: 'cat-bebidas',
        name: 'Bebidas',
        description: 'Refrescos y bebidas',
        active: true,
        sortOrder: 4,
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create products
  const products = await Promise.all([
    // Entradas
    prisma.product.upsert({
      where: { id: 'prod-1' },
      update: {},
      create: {
        id: 'prod-1',
        name: 'Guacamole con Totopos',
        description: 'Guacamole fresco con totopos crujientes',
        price: 95,
        categoryId: 'cat-entradas',
        active: true,
        available: true,
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-2' },
      update: {},
      create: {
        id: 'prod-2',
        name: 'Quesadillas',
        description: 'Quesadillas de queso Oaxaca',
        price: 120,
        categoryId: 'cat-entradas',
        active: true,
        available: true,
        sortOrder: 2,
      },
    }),
    // Platos principales
    prisma.product.upsert({
      where: { id: 'prod-3' },
      update: {},
      create: {
        id: 'prod-3',
        name: 'Hamburguesa Clásica',
        description: 'Carne de res, lechuga, tomate, cebolla',
        price: 150,
        categoryId: 'cat-principales',
        active: true,
        available: true,
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-4' },
      update: {},
      create: {
        id: 'prod-4',
        name: 'Pasta Carbonara',
        description: 'Pasta con salsa carbonara',
        price: 145,
        categoryId: 'cat-principales',
        active: true,
        available: true,
        sortOrder: 2,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-5' },
      update: {},
      create: {
        id: 'prod-5',
        name: 'Tacos al Pastor',
        description: '3 tacos de pastor con piña',
        price: 90,
        categoryId: 'cat-principales',
        active: true,
        available: false,
        sortOrder: 3,
      },
    }),
    // Postres
    prisma.product.upsert({
      where: { id: 'prod-6' },
      update: {},
      create: {
        id: 'prod-6',
        name: 'Pastel de Chocolate',
        description: 'Pastel de chocolate belga',
        price: 75,
        categoryId: 'cat-postres',
        active: true,
        available: true,
        sortOrder: 1,
      },
    }),
    // Bebidas
    prisma.product.upsert({
      where: { id: 'prod-7' },
      update: {},
      create: {
        id: 'prod-7',
        name: 'Agua Fresca',
        description: 'Agua fresca de frutas naturales',
        price: 35,
        categoryId: 'cat-bebidas',
        active: true,
        available: true,
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-8' },
      update: {},
      create: {
        id: 'prod-8',
        name: 'Café',
        description: 'Café de especialidad',
        price: 40,
        categoryId: 'cat-bebidas',
        active: true,
        available: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log('✅ Products created:', products.length);

  // Create tables
  const tables = [];
  for (let i = 1; i <= 20; i++) {
    const row = Math.floor((i - 1) / 5);
    const col = (i - 1) % 5;
    tables.push(
      prisma.table.upsert({
        where: { id: `table-${i}` },
        update: {},
        create: {
          id: `table-${i}`,
          number: String(i),
          capacity: i <= 10 ? 4 : 6,
          status: 'AVAILABLE',
          active: true,
          positionX: col * 150,
          positionY: row * 150,
          width: 100,
          height: 100,
          shape: 'rectangle',
        },
      })
    );
  }
  await Promise.all(tables);
  console.log('✅ Tables created:', tables.length);

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { id: 'inv-1' },
      update: {},
      create: {
        id: 'inv-1',
        name: 'Carne de Res',
        sku: 'CARN-001',
        quantity: 15,
        unit: 'kg',
        minQuantity: 10,
        cost: 180,
        location: 'Refrigerador A',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inv-2' },
      update: {},
      create: {
        id: 'inv-2',
        name: 'Pollo',
        sku: 'POLL-001',
        quantity: 8,
        unit: 'kg',
        minQuantity: 10,
        cost: 120,
        location: 'Refrigerador A',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inv-3' },
      update: {},
      create: {
        id: 'inv-3',
        name: 'Tomate',
        sku: 'TOM-001',
        quantity: 25,
        unit: 'kg',
        minQuantity: 15,
        cost: 35,
        location: 'Bodega',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inv-4' },
      update: {},
      create: {
        id: 'inv-4',
        name: 'Queso Oaxaca',
        sku: 'QOAX-001',
        quantity: 5,
        unit: 'kg',
        minQuantity: 8,
        cost: 220,
        location: 'Refrigerador B',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inv-5' },
      update: {},
      create: {
        id: 'inv-5',
        name: 'Tortillas',
        sku: 'TORT-001',
        quantity: 200,
        unit: 'piezas',
        minQuantity: 100,
        cost: 2,
        location: 'Bodega',
      },
    }),
  ]);
  console.log('✅ Inventory items created:', inventoryItems.length);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
