import prisma from "../../../lib/prisma";

export default async function jobCreatePrisma(
  title: string,
  description: string,
  compensation: number,
  company: string,
  years: number
) {
  const job = prisma.job.create({
    data: { title, description, compensation, company, years },
  });
  return job;
}
