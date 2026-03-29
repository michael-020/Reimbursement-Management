import prisma from '@/prisma/index';
import bcrypt from 'bcrypt';
import { Role } from '@/app/generated/prisma/enums';

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('test-123', 10);

  const roles = [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE];

  for (const role of roles) {
    for (let i = 1; i <= 3; i++) {
      const email = `${role.toLowerCase()}${i}@test.com`;
      const name = `${role} User ${i}`;

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          password: hashedPassword,
          name,
          role,
        },
        create: {
          email,
          name,
          password: hashedPassword,
          role,
        },
      });

      console.log(`✅ Created/Updated: ${user.email} (${user.role})`);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });