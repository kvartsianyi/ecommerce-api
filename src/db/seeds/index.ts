import { drizzle } from 'drizzle-orm/node-postgres';

import { products, users } from '@/db/schema';
import { ENV } from '@/config';
import logger from '@/logger';
import { LoggerContext, UserRole } from '@/constants';

const db = drizzle(ENV.DATABASE_URL);

try {
  const [admin] = await db
    .insert(users)
    .values({
      name: 'Admin',
      email: 'admin-email@domain.com',
      phone: '+380991234567',
      password: '$2b$10$WwvROkO1gvDi0UEkGEDSl.n2zm9wHlL9DXtlwoDCfxzTkIOAR5Y1C',
      role: UserRole.ADMIN,
      isEmailConfirmed: true,
    })
    .returning({ id: users.id });

  const productSeeds = [
    {
      title: 'Гавайська',
      description: 'Печена курка, ананаси, кукурудза, неаполітанський соус, сир моцарела.',
      price: 25000,
      userId: admin.id,
    },
    {
      title: 'Салямі',
      description: 'Салямі мілано, сир моцарела, неаполітанський соус, орегано.',
      price: 25000,
      userId: admin.id,
    },
    {
      title: 'Капрічоза',
      description: 'Шинка, печериці, маслини, сир моцарела, неаполітанський соус.',
      price: 25000,
      userId: admin.id,
    },
    {
      title: 'Карбонара',
      description:
        'Бекон, жовток курячий, олія часникова, свіжа рукола, сир моцарела, сир пармезан, вершковий соус, перець чорний мелений.',
      price: 26000,
      userId: admin.id,
    },
    {
      title: 'Піца з креветками',
      description:
        'Сир моцарела, креветки, бекон, сир рікота, помідори чері, сир пармезан,  базилік сушений, часникова олія, вершковий соус.',
      price: 34500,
      userId: admin.id,
    },
    {
      title: 'Маргарита',
      description: 'Неаполітанський соус, сир пармезан, сир моцарела, базилік сушений.',
      price: 19500,
      userId: admin.id,
    },
    {
      title: 'Карбонара',
      description:
        'Бекон, жовток курячий, олія часникова, свіжа рукола, сир моцарела, сир пармезан, вершковий соус, перець чорний мелений.',
      price: 26000,
      userId: admin.id,
    },
  ];

  await db.insert(products).values(productSeeds);

  logger.info('Database seeding completed successfully!', { context: LoggerContext.BOOTSTRAP });
  process.exit(0);
} catch (error) {
  logger.error('Database seeding failed!', { context: LoggerContext.BOOTSTRAP, error });
  process.exit(1);
}
