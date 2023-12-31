import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../src/lib/prisma"

async function main() {
  // ... you will write your Prisma Client queries here
  const data: Prisma.UserCreateInput = {
    name: "Love",
    email: "love@prisma.io",
    posts: {
      create: {
        title: "Hello World",
      },
    },
  };
  // const user  = await prisma.user.create({
  //   data
  // })
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
