import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPool } from "../src/lib/db-pool";

async function main() {
  const pool = createPool();
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const templates = await prisma.template.findMany();

  console.log(`\n=== Total Templates in Database: ${templates.length} ===\n`);
  templates.forEach((t, i) => {
    console.log(`${i + 1}. ${t.name} (ID: ${t.id}) | Published: ${t.isPublished}`);
    if (t.description) console.log(`   Description: ${t.description}`);
  });

  await pool.end();
}

main().catch(console.error);
