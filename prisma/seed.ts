import { FloorType, PrismaClient, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

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

const createSeedUsers = async () => {
  const saltOrRounds = 10;
  const students = [
    {
      uuid: uuidv4(),
      email: 'student_1@mail.com',
      password: await bcrypt.hash('password1', saltOrRounds),
      name: 'Student One Dela Cruz',
      role: Role.STUDENT,
      yearSection: 'BSIT-4A',
      idNumber: '20-208-001',
    },
    {
      uuid: uuidv4(),
      email: 'student_2@mail.com',
      password: await bcrypt.hash('password2', saltOrRounds),
      name: 'Student Two Santos',
      role: Role.STUDENT,
      yearSection: 'BSIT-4A',
      idNumber: '20-208-002',
    },
    {
      uuid: uuidv4(),
      email: 'student_3@mail.com',
      password: await bcrypt.hash('password3', saltOrRounds),
      name: 'Student Three Lopez',
      role: Role.STUDENT,
      yearSection: 'BSIT-4A',
      idNumber: '20-208-003',
    },
    {
      uuid: uuidv4(),
      email: 'student_4@mail.com',

      password: await bcrypt.hash('password4', saltOrRounds),
      name: 'Student Four Bautista',
      role: Role.STUDENT,
      yearSection: 'BSIT-4A',
      idNumber: '20-208-004',
    },
    {
      uuid: uuidv4(),
      email: 'student_5@mail.com',
      password: await bcrypt.hash('password5', saltOrRounds),
      name: 'Student Five de Guzman',
      role: Role.STUDENT,
      yearSection: 'BSIT-4A',
      idNumber: '20-208-005',
    },
  ];

  const professors = [
    {
      uuid: uuidv4(),
      email: 'prof_1@mail.com',

      password: await bcrypt.hash('password1', saltOrRounds),
      name: 'Prof 1 Espino',
      role: Role.PROF,
      idNumber: '96-103-001',
    },
    {
      uuid: uuidv4(),
      email: 'prof_2@mail.com',

      password: await bcrypt.hash('password2', saltOrRounds),
      name: 'Prof 2 Tagud',
      role: Role.PROF,
      idNumber: '96-103-002',
    },
    {
      uuid: uuidv4(),
      email: 'prof_3@mail.com',
      password: await bcrypt.hash('password3', saltOrRounds),
      name: 'Prof 3 Garbin',
      role: Role.PROF,
      idNumber: '96-103-003',
    },
    {
      uuid: uuidv4(),
      email: 'prof_4@mail.com',
      password: await bcrypt.hash('password4', saltOrRounds),
      name: 'Prof 4 Robles',
      role: Role.PROF,
      idNumber: '96-103-004',
    },
    {
      uuid: uuidv4(),
      email: 'prof_5@mail.com',
      password: await bcrypt.hash('password5', saltOrRounds),
      name: 'Prof 5 Javier',
      role: Role.PROF,
      idNumber: '96-103-005',
    },
  ];

  const admin = {
    uuid: uuidv4(),
    email: 'admin1@mail.com',
    password: await bcrypt.hash('password1', saltOrRounds),
    name: 'Admin Prime',
    role: Role.ADMIN,
  };

  const superAdmin = {
    uuid: uuidv4(),
    email: 'admin@mail.com',
    password: await bcrypt.hash('password1', saltOrRounds),
    name: 'Super Admin Prime',
    role: Role.ADMIN,
  };

  const users = [...students, ...professors, admin, superAdmin];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });

    console.log(`User created: ${user.name}`);
  }
};

const createSeedComputers = async () => {
  const seedMice = [
    {
      uuid: uuidv4(),
      name: 'Mouse_1',
      metadata: JSON.stringify({ type: 'Wireless', dpi: 1600, color: 'Black' }),
      categoryName: 'MOUSE',
      locationName: '2CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Mouse_2',
      metadata: JSON.stringify({ type: 'Wired', dpi: 800, color: 'White' }),
      categoryName: 'MOUSE',
      locationName: 'MH5',
    },
    {
      uuid: uuidv4(),
      name: 'Mouse_3',
      metadata: JSON.stringify({ type: 'Wireless', dpi: 1200, color: 'Red' }),
      categoryName: 'MOUSE',
      locationName: '3CL2B',
    },
    {
      uuid: uuidv4(),
      name: 'Mouse_4',
      metadata: JSON.stringify({ type: 'Wired', dpi: 1600, color: 'Blue' }),
      categoryName: 'MOUSE',
      locationName: '3CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Mouse_5',
      metadata: JSON.stringify({ type: 'Wireless', dpi: 2400, color: 'Gray' }),
      categoryName: 'MOUSE',
      locationName: 'MH4',
    },
  ];
  const seedKeyboards = [
    {
      uuid: uuidv4(),
      name: 'Keyboard_1',
      metadata: JSON.stringify({
        type: 'Mechanical',
        switches: 'Cherry MX Brown',
        layout: 'QWERTY',
      }),
      categoryName: 'KEYBOARD',
      locationName: '2CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Keyboard_2',
      metadata: JSON.stringify({
        type: 'Membrane',
        layout: 'AZERTY',
        backlit: true,
      }),
      categoryName: 'KEYBOARD',
      locationName: 'MH5',
    },
    {
      uuid: uuidv4(),
      name: 'Keyboard_3',
      metadata: JSON.stringify({
        type: 'Mechanical',
        switches: 'Cherry MX Blue',
        layout: 'QWERTY',
      }),
      categoryName: 'KEYBOARD',
      locationName: '3CL2B',
    },
    {
      uuid: uuidv4(),
      name: 'Keyboard_4',
      metadata: JSON.stringify({
        type: 'Wireless',
        layout: 'QWERTY',
        backlit: false,
      }),
      categoryName: 'KEYBOARD',
      locationName: '3CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Keyboard_5',
      metadata: JSON.stringify({
        type: 'Membrane',
        layout: 'QWERTZ',
        backlit: true,
      }),
      categoryName: 'KEYBOARD',
      locationName: 'MH4',
    },
  ];
  const seedMonitors = [
    {
      uuid: uuidv4(),
      name: 'Monitor_1',
      metadata: JSON.stringify({
        size: '24 inches',
        resolution: '1080p',
        panel: 'IPS',
      }),
      categoryName: 'MONITOR',
      locationName: '2CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Monitor_2',
      metadata: JSON.stringify({
        size: '27 inches',
        resolution: '1440p',
        panel: 'TN',
      }),
      categoryName: 'MONITOR',
      locationName: 'MH5',
    },
    {
      uuid: uuidv4(),
      name: 'Monitor_3',
      metadata: JSON.stringify({
        size: '32 inches',
        resolution: '4K',
        panel: 'VA',
      }),
      categoryName: 'MONITOR',
      locationName: '3CL2B',
    },
    {
      uuid: uuidv4(),
      name: 'Monitor_4',
      metadata: JSON.stringify({
        size: '24 inches',
        resolution: '1080p',
        panel: 'IPS',
      }),
      categoryName: 'MONITOR',
      locationName: '3CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'Monitor_5',
      metadata: JSON.stringify({
        size: '27 inches',
        resolution: '1080p',
        panel: 'TN',
      }),
      categoryName: 'MONITOR',
      locationName: 'MH4',
    },
  ];
  const seedSystemUnits = [
    {
      uuid: uuidv4(),
      name: 'SystemUnit_1',
      metadata: JSON.stringify({
        cpu: 'Intel i5',
        ram: '8GB',
        storage: '256GB SSD',
      }),
      categoryName: 'SYSTEM_UNIT',
      locationName: '2CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'SystemUnit_2',
      metadata: JSON.stringify({
        cpu: 'Intel i7',
        ram: '16GB',
        storage: '512GB SSD',
      }),
      categoryName: 'SYSTEM_UNIT',
      locationName: 'MH5',
    },
    {
      uuid: uuidv4(),
      name: 'SystemUnit_3',
      metadata: JSON.stringify({
        cpu: 'AMD Ryzen 5',
        ram: '8GB',
        storage: '1TB HDD',
      }),
      categoryName: 'SYSTEM_UNIT',
      locationName: '3CL2B',
    },
    {
      uuid: uuidv4(),
      name: 'SystemUnit_4',
      metadata: JSON.stringify({
        cpu: 'AMD Ryzen 7',
        ram: '16GB',
        storage: '512GB SSD',
      }),
      categoryName: 'SYSTEM_UNIT',
      locationName: '3CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'SystemUnit_5',
      metadata: JSON.stringify({
        cpu: 'Intel i9',
        ram: '32GB',
        storage: '1TB SSD',
      }),
      categoryName: 'SYSTEM_UNIT',
      locationName: 'MH4',
    },
  ];
  const seedPrinters = [
    {
      uuid: uuidv4(),
      name: 'PRINTER_1',
      metadata: JSON.stringify({
        brand: 'BROTHER',
        type: 'InkJet',
      }),
      categoryName: 'PRINTER',
      locationName: '2CL3B',
    },
    {
      uuid: uuidv4(),
      name: 'PRINTER_2',
      metadata: JSON.stringify({
        brand: 'BROTHER',
        type: 'InkJet',
      }),
      categoryName: 'PRINTER',
      locationName: 'MH5',
    },
  ];
  const seedItems = [
    ...seedMice,
    ...seedKeyboards,
    ...seedMonitors,
    ...seedSystemUnits,
    ...seedPrinters,
  ];
  for (const item of seedItems) {
    await prisma.item.create({
      data: item,
    });
    console.log(`Item created: ${item.name}`);
  }

  const seedComputers = [
    {
      uuid: uuidv4(),
      name: 'Computer_1',
      metadata: JSON.stringify({ specs: 'Office setup' }),
      monitorName: 'Monitor_1',
      keyboardName: 'Keyboard_1',
      mouseName: 'Mouse_1',
      systemUnitName: 'SystemUnit_1',
      locationName: '2CL3B',
      others: ['Printer_1'],
    },
    {
      uuid: uuidv4(),
      name: 'Computer_2',
      metadata: JSON.stringify({ specs: 'Gaming setup' }),
      monitorName: 'Monitor_2',
      keyboardName: 'Keyboard_3',
      mouseName: 'Mouse_2',
      systemUnitName: 'SystemUnit_2',
      locationName: 'MH5',
      others: ['Printer_2'],
    },
    {
      uuid: uuidv4(),
      name: 'Computer_3',
      metadata: JSON.stringify({ specs: 'Design workstation' }),
      monitorName: 'Monitor_3',
      keyboardName: 'Keyboard_5',
      mouseName: 'Mouse_3',
      systemUnitName: 'SystemUnit_3',
      locationName: '3CL2B',
      others: [],
    },
    {
      uuid: uuidv4(),
      name: 'Computer_4',
      metadata: JSON.stringify({ specs: 'Research station' }),
      monitorName: 'Monitor_4',
      keyboardName: 'Keyboard_2',
      mouseName: 'Mouse_4',
      systemUnitName: 'SystemUnit_4',
      locationName: '3CL3B',
      others: [],
    },
    {
      uuid: uuidv4(),
      name: 'Computer_5',
      metadata: JSON.stringify({ specs: 'Development setup' }),
      monitorName: 'Monitor_5',
      keyboardName: 'Keyboard_4',
      mouseName: 'Mouse_5',
      systemUnitName: 'SystemUnit_5',
      locationName: 'MH4',
      others: [],
    },
  ];

  for (const computer of seedComputers) {
    await prisma.computer.create({
      data: computer,
    });
    console.log(`Computer created : ${computer.name}`);
  }
};

async function main() {
  await createSeedCategory();
  await createSeedLocation();
  await createSeedUsers();
  await createSeedComputers();
}

main()
  .catch((e) => console.error('Error Creating Seed :', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
