import { seedSuperAdmin } from "./seedSuperAdmin.js";
import { seedInitialData } from "./seedInitialData.js";
import prisma from "../config/prisma.js";

async function main() {
  console.log("🌱 Starting seed execution...");
  process.env.SEED_DUMMY_DATA = "true";

  // 1. Seed Super Admin
  console.log("👤 Seeding Super Admin...");
  await seedSuperAdmin();

  // 3. Display current counts
  const userCount = await prisma.user.count();
  const donationCount = await prisma.bloodDonateRecord.count();
  const emergencyCount = await prisma.emergencyBloodRequest.count();
  const contactCount = await prisma.contactMessage.count();

  console.log("\n📊 Current Database Summary:");
  console.log(`- Total Users: ${userCount}`);
  console.log(`- Total Blood Donation Records: ${donationCount}`);
  console.log(`- Total Emergency Requests: ${emergencyCount}`);
  console.log(`- Total Contact Messages: ${contactCount}`);
  console.log("✅ Seeding completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
