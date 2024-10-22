import { FloorType, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const createSeedCategory = async () => {
  // Categories to seed
  const categories = [
    { uuid: uuidv4(), name: 'MOUSE' },
    { uuid: uuidv4(), name: 'KEYBOARD' },
    { uuid: uuidv4(), name: 'MONITOR' },
    { uuid: uuidv4(), name: 'SYSTEM_UNIT' },
    { uuid: uuidv4(), name: 'PRINTER' },
    { uuid: uuidv4(), name: 'UPS' },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });

    console.log(`Category created: ${category.name}`);
  }
};

const createSeedLocation = async () => {
  // Create locations
  const locations = [
    { uuid: uuidv4(), name: '2CL3B', floor: FloorType.SECOND_FLOOR },
    { uuid: uuidv4(), name: 'MH5', floor: FloorType.FOURTH_FLOOR },
    { uuid: uuidv4(), name: '3CL2B', floor: FloorType.THIRD_FLOOR },
    { uuid: uuidv4(), name: '3CL3B', floor: FloorType.THIRD_FLOOR },
    { uuid: uuidv4(), name: 'MH4', floor: FloorType.FOURTH_FLOOR },
  ];

  for (const location of locations) {
    await prisma.location.create({
      data: location,
    });

    console.log(`Location created: ${location.name}`);
  }
};

async function main() {
  await createSeedCategory();
  await createSeedLocation();
}

main()
  .catch((e) => console.error('Error Creating Seed :', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
