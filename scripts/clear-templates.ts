import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPool } from "../src/lib/db-pool";

async function main() {
  const pool = createPool();
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  console.log("\nDeleting all templates and dependent records from PostgreSQL database...\n");

  await prisma.$transaction([
    prisma.collegeSectionHistory.deleteMany(),
    prisma.collegeSection.deleteMany(),
    prisma.page.deleteMany(),
    prisma.user.deleteMany(),
    prisma.college.deleteMany(),
    prisma.sectionVariant.deleteMany(),
    prisma.section.deleteMany(),
    prisma.template.deleteMany(),
  ]);

  const count = await prisma.template.count();
  console.log(`Success! All templates removed. Total remaining templates in DB: ${count}\n`);

  await pool.end();
}

main().catch(console.error);
