import prisma from "../../../lib/prisma";

export default async function userCreatePrisma(name: string, email: string) {
  const user = await prisma.user.create({
    data: {name, email}
  });
  return user
}
