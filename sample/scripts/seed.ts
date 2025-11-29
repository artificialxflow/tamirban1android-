import { config as loadEnv } from "dotenv";
import { ObjectId } from "mongodb";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { disconnectMongo, getMongoDb } from "@/lib/db";

const SEED_AUTHOR = "seed-script";
const NOW = new Date();

function baseAuditTrail() {
  return {
    createdAt: NOW,
    createdBy: SEED_AUTHOR,
    updatedAt: NOW,
    updatedBy: SEED_AUTHOR,
  };
}

async function seedUsers(db: Awaited<ReturnType<typeof getMongoDb>>) {
  const usersCollection = db.collection("users");

  await usersCollection.deleteMany({ createdBy: SEED_AUTHOR });

  const marketers = [
    {
      _id: new ObjectId().toHexString(),
      fullName: "سارا احمدی",
      mobile: "09120000001",
      email: "sara.ahmadi@example.com",
      role: "MARKETER",
      isActive: true,
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      fullName: "امیرحسین صابری",
      mobile: "09120000002",
      email: "amir.saberi@example.com",
      role: "MARKETER",
      isActive: true,
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      fullName: "نیلوفر کرمی",
      mobile: "09120000003",
      email: "nilofar.karami@example.com",
      role: "MARKETER",
      isActive: true,
      ...baseAuditTrail(),
    },
  ];

  if (marketers.length) {
    await usersCollection.insertMany(marketers as any[], { ordered: false });
  }

  return marketers;
}

async function seedCustomers(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  marketers: Array<{ _id: string; fullName: string }>,
) {
  const customersCollection = db.collection("customers");

  await customersCollection.deleteMany({ createdBy: SEED_AUTHOR });

  const [sara, amir, niloofar] = marketers;

  const customers = [
    {
      _id: new ObjectId().toHexString(),
      code: "C-2501",
      displayName: "نمایندگی سایپا پارس",
      legalName: "سایپا پارس خاور میانه",
      contact: {
        phone: "02188550001",
        email: "contact@saypa-pars.ir",
        city: "تهران",
      },
      assignedMarketerId: sara._id,
      assignedMarketerName: sara.fullName,
      status: "ACTIVE",
      tags: ["قطعات یدکی", "نمایندگی"],
      lastVisitAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 1),
      revenueMonthly: 128_500_000,
      loyaltyScore: 86,
      grade: "A",
      notes: "پیگیری تامین قطعات جدید برند X.",
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      code: "C-2502",
      displayName: "تعمیرگاه آریا موتور",
      legalName: "آریا موتور شرق",
      contact: {
        phone: "02177889900",
        email: "workshop@ariamotor.ir",
        city: "تهران",
      },
      assignedMarketerId: amir._id,
      assignedMarketerName: amir.fullName,
      status: "AT_RISK",
      tags: ["خدمات سریع", "VIP"],
      lastVisitAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 5),
      revenueMonthly: 64_800_000,
      loyaltyScore: 58,
      grade: "B",
      notes: "در انتظار تایید پیش‌فاکتور تجهیزات جدید.",
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      code: "C-2503",
      displayName: "گاراژ مرکزی ایران خودرو",
      legalName: "گاراژ مرکزی اطلس",
      contact: {
        phone: "02166554433",
        email: "central@ikgarage.ir",
        city: "کرج",
      },
      assignedMarketerId: niloofar._id,
      assignedMarketerName: niloofar.fullName,
      status: "LOYAL",
      tags: ["برند ایران خودرو", "قدیمی"],
      lastVisitAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 2),
      revenueMonthly: 98_200_000,
      loyaltyScore: 92,
      grade: "A",
      notes: "در حال بررسی راه‌اندازی باشگاه مشتریان.",
      ...baseAuditTrail(),
    },
  ];

  if (customers.length) {
    await customersCollection.insertMany(customers as any[], { ordered: false });
  }

  return customers;
}

async function seedVisits(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  customers: Array<{ _id: string; displayName: string }>,
  marketers: Array<{ _id: string }>,
) {
  const visitsCollection = db.collection("visits");

  await visitsCollection.deleteMany({ createdBy: SEED_AUTHOR });

  const visits = [
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[0]._id,
      marketerId: marketers[0]._id,
      scheduledAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 9, 30),
      status: "IN_PROGRESS",
      topics: ["پروفایل مشتری", "قطعات جدید"],
      notes: "در حال بازدید از انبار قطعات.",
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[1]._id,
      marketerId: marketers[1]._id,
      scheduledAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 11, 15),
      completedAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 12, 5),
      status: "COMPLETED",
      topics: ["پیش‌فاکتور", "تجهیزات"],
      notes: "منتظر تایید مالی پیش‌فاکتور هستند.",
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[2]._id,
      marketerId: marketers[2]._id,
      scheduledAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 14, 0),
      status: "SCHEDULED",
      topics: ["باشگاه مشتریان", "اتوماسیون"],
      notes: "جلسه مشترک با مدیر عملیات.",
      ...baseAuditTrail(),
    },
  ];

  if (visits.length) {
    await visitsCollection.insertMany(visits as any[], { ordered: false });
  }

  return visits;
}

async function seedInvoices(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  customers: Array<{ _id: string; displayName: string }>,
  marketers: Array<{ _id: string }>,
) {
  const invoicesCollection = db.collection("invoices");

  await invoicesCollection.deleteMany({ createdBy: SEED_AUTHOR });

  const invoices = [
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[0]._id,
      marketerId: marketers[0]._id,
      status: "SENT",
      issuedAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 3),
      dueAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 4),
      currency: "IRR",
      items: [
        {
          title: "پکیج قطعات برقی",
          quantity: 10,
          unit: "عدد",
          unitPrice: 4_500_000,
          taxRate: 0.09,
          total: 49_050_000,
        },
      ],
      subtotal: 45_000_000,
      taxTotal: 4_050_000,
      grandTotal: 49_050_000,
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[1]._id,
      marketerId: marketers[1]._id,
      status: "OVERDUE",
      issuedAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 10),
      dueAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 2),
      currency: "IRR",
      items: [
        {
          title: "نرم‌افزار مدیریت صف",
          quantity: 1,
          unit: "لایسنس",
          unitPrice: 28_000_000,
          total: 28_000_000,
        },
      ],
      subtotal: 28_000_000,
      taxTotal: 0,
      grandTotal: 28_000_000,
      ...baseAuditTrail(),
    },
    {
      _id: new ObjectId().toHexString(),
      customerId: customers[2]._id,
      marketerId: marketers[2]._id,
      status: "PAID",
      issuedAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 20),
      dueAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 10),
      paidAt: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 11),
      currency: "IRR",
      items: [
        {
          title: "آموزش تخصصی تیم فنی",
          quantity: 5,
          unit: "نفر-دوره",
          unitPrice: 6_800_000,
          total: 34_000_000,
        },
      ],
      subtotal: 34_000_000,
      taxTotal: 0,
      grandTotal: 34_000_000,
      ...baseAuditTrail(),
    },
  ];

  if (invoices.length) {
    await invoicesCollection.insertMany(invoices as any[], { ordered: false });
  }
}

async function main() {
  try {
    const db = await getMongoDb();
    console.log("Seeding database:", db.databaseName);

    const marketers = await seedUsers(db);
    const customers = await seedCustomers(db, marketers);
    await seedVisits(db, customers, marketers);
    await seedInvoices(db, customers, marketers);

    console.log("✅ Seed data inserted successfully.");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

void main();
