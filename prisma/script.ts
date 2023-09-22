import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ... you will write your Prisma Client queries here
  const data: Prisma.UserCreateInput = {
    name: "Bob",
    email: "bob@prisma.io",
    posts: {
      create: {
        title: "Hello World",
      },
    },
  };
  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });

  console.dir(usersWithPosts, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
