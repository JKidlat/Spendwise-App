// Seed file to populate default categories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Food', color: '#EF4444' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Bills', color: '#10B981' },
  { name: 'Shopping', color: '#F59E0B' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Other', color: '#6B7280' },
];

async function main() {
  console.log('Seeding default categories...');

  // Create default categories (with userId = null)
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        name_userId: {
          name: category.name,
          userId: null,
        },
      },
      update: {},
      create: {
        name: category.name,
        userId: null,
        isDefault: true,
        color: category.color,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
