const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const user = await prisma.user.findUnique({
    where: {
      email: "joe@example.com",
    },
  });

  if (!user) {
    throw new Error(
      "Development user not found. Please register the user first."
    );
  }

  // 1. Clean up existing records sequentially to respect Foreign Key constraints
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // 2. Upsert Accounts
  const accounts = await Promise.all([
    prisma.account.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: "Cash",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Cash",
      },
    }),

    prisma.account.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: "GTBank",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "GTBank",
      },
    }),

    prisma.account.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: "Savings",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Savings",
      },
    }),
  ]);

  // 3. Upsert Categories
  const categories = await Promise.all([
    // Income Categories
    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Salary",
          type: "INCOME",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Salary",
        type: "INCOME",
        description: "Monthly salary",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Freelance",
          type: "INCOME",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Freelance",
        type: "INCOME",
        description: "Freelance work",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Investment",
          type: "INCOME",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Investment",
        type: "INCOME",
        description: "Investment returns",
      },
    }),

    // Expense Categories
    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Food",
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Food",
        type: "EXPENSE",
        description: "Food and groceries",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Transport",
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Transport",
        type: "EXPENSE",
        description: "Transportation expenses",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Rent",
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Rent",
        type: "EXPENSE",
        description: "House rent",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Utilities",
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Utilities",
        type: "EXPENSE",
        description: "Electricity, water, internet",
      },
    }),

    prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: "Entertainment",
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Entertainment",
        type: "EXPENSE",
        description: "Movies, games, outings",
      },
    }),
  ]);

  // 4. Create Mappings
  const accountMap = Object.fromEntries(
    accounts.map((account) => [account.name, account])
  );

  const categoryMap = Object.fromEntries(
    categories.map((category) => [
      `${category.type}:${category.name}`,
      category,
    ])
  );

  const transactions = [
    // January
    {
      amount: 350000,
      type: "INCOME",
      account: "GTBank",
      category: "Salary",
      date: "2026-01-31T12:00:00Z",
      description: "January Salary",
    },
    {
      amount: 45000,
      type: "INCOME",
      account: "GTBank",
      category: "Freelance",
      date: "2026-01-18T12:00:00Z",
      description: "Website project",
    },
    {
      amount: 30000,
      type: "EXPENSE",
      account: "Cash",
      category: "Food",
      date: "2026-01-08T12:00:00Z",
      description: "Groceries",
    },
    {
      amount: 15000,
      type: "EXPENSE",
      account: "Cash",
      category: "Transport",
      date: "2026-01-11T12:00:00Z",
      description: "Transport fares",
    },
    {
      amount: 120000,
      type: "EXPENSE",
      account: "GTBank",
      category: "Rent",
      date: "2026-01-05T12:00:00Z",
      description: "House rent",
    },

    // February
    {
      amount: 350000,
      type: "INCOME",
      account: "GTBank",
      category: "Salary",
      date: "2026-02-28T12:00:00Z",
      description: "February Salary",
    },
    {
      amount: 50000,
      type: "INCOME",
      account: "Savings",
      category: "Investment",
      date: "2026-02-14T12:00:00Z",
      description: "Investment return",
    },
    {
      amount: 25000,
      type: "EXPENSE",
      account: "Cash",
      category: "Food",
      date: "2026-02-09T12:00:00Z",
      description: "Groceries",
    },
    {
      amount: 18000,
      type: "EXPENSE",
      account: "Cash",
      category: "Transport",
      date: "2026-02-15T12:00:00Z",
      description: "Fuel and transport",
    },
    {
      amount: 22000,
      type: "EXPENSE",
      account: "GTBank",
      category: "Utilities",
      date: "2026-02-20T12:00:00Z",
      description: "Internet and electricity",
    },

    // March
    {
      amount: 350000,
      type: "INCOME",
      account: "GTBank",
      category: "Salary",
      date: "2026-03-31T12:00:00Z",
      description: "March Salary",
    },
    {
      amount: 60000,
      type: "INCOME",
      account: "GTBank",
      category: "Freelance",
      date: "2026-03-22T12:00:00Z",
      description: "Mobile app project",
    },
    {
      amount: 28000,
      type: "EXPENSE",
      account: "Cash",
      category: "Food",
      date: "2026-03-10T12:00:00Z",
      description: "Groceries",
    },
    {
      amount: 12000,
      type: "EXPENSE",
      account: "Cash",
      category: "Entertainment",
      date: "2026-03-26T12:00:00Z",
      description: "Cinema",
    },
    {
      amount: 24000,
      type: "EXPENSE",
      account: "GTBank",
      category: "Utilities",
      date: "2026-03-18T12:00:00Z",
      description: "Utility bills",
    },
  ];

  // 5. Create Transactions
  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: accountMap[transaction.account].id,
        categoryId:
          categoryMap[`${transaction.type}:${transaction.category}`].id,
        amount: transaction.amount,
        type: transaction.type,
        transactionDate: new Date(transaction.date),
        description: transaction.description,
      },
    });
  }

  // Logs placed inside main where accounts, categories, and transactions are in scope
  console.log("✅ Database seeded successfully.");
  console.log(`Seeded ${accounts.length} accounts.`);
  console.log(`Seeded ${categories.length} categories.`);
  console.log(`Seeded ${transactions.length} transactions.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seeding failed:", error.message || error);
    await prisma.$disconnect();
    process.exit(1);
  });