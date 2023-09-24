import prisma from "../../../lib/prisma";

export default async function jobCreatePrisma(
  title: string,
  description: string,
  compensation: number
) {
  const job = prisma.job.create({
    data: { title, description, compensation },
  });
  return job;
}
