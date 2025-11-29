/**
 * Migration Script: افزودن ایندکس‌های MongoDB برای collection invoices
 * 
 * این اسکریپت ایندکس‌های زیر را ایجاد می‌کند:
 * - customerId: برای جستجوی سریع پیش‌فاکتورهای یک مشتری
 * - status: برای فیلتر بر اساس وضعیت
 * - dueAt: برای جستجوی پیش‌فاکتورهای معوق
 * - marketerId: برای جستجوی پیش‌فاکتورهای یک بازاریاب
 * - ایندکس ترکیبی: customerId + status + dueAt
 * 
 * نحوه اجرا:
 * 1. اطمینان از اتصال به MongoDB
 * 2. تنظیم متغیرهای محیطی (MONGODB_URI, MONGODB_DB_NAME) در فایل .env
 * 3. اجرای: node scripts/migrations/add-invoice-indexes.js
 */

// بارگذاری متغیرهای محیطی از .env (اگر dotenv موجود باشد)
try {
  require("dotenv").config({ path: ".env" });
} catch (error) {
  // اگر dotenv نصب نشده باشد، از متغیرهای محیطی سیستم استفاده می‌شود
  console.log("ℹ️  dotenv not found, using system environment variables");
}

const { MongoClient } = require("mongodb");

async function addInvoiceIndexes() {
  // تلاش برای خواندن از .env.local یا .env
  const fs = require("fs");
  const path = require("path");
  
  // بررسی فایل‌های .env
  const envFiles = [".env.local", ".env"];
  let envLoaded = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, "utf8");
        envContent.split("\n").forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#") && trimmedLine.includes("=")) {
            const equalIndex = trimmedLine.indexOf("=");
            const key = trimmedLine.substring(0, equalIndex).trim();
            const value = trimmedLine.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, "");
            if (key && value) {
              process.env[key] = value;
            }
          }
        });
        console.log(`✅ Loaded environment variables from ${envFile}`);
        envLoaded = true;
        break;
      } catch (error) {
        console.warn(`⚠️  Could not read ${envFile}:`, error.message);
      }
    }
  }
  
  if (!envLoaded) {
    console.log("ℹ️  No .env file found, using system environment variables");
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "tamirban";

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set");
    console.error("");
    console.error("   Current working directory:", process.cwd());
    console.error("   Looking for .env files in:", process.cwd());
    console.error("");
    console.error("   Please try one of the following:");
    console.error("   1. Make sure .env file exists in project root");
    console.error("   2. Export in terminal: export MONGODB_URI='mongodb://...'");
    console.error("   3. Run: MONGODB_URI='mongodb://...' node scripts/migrations/add-invoice-indexes.js");
    process.exit(1);
  }
  
  console.log(`✅ Using MongoDB URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Hide password

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const invoicesCollection = db.collection("invoices");

    console.log("\n📊 Creating indexes for 'invoices' collection...\n");

    // ایندکس برای customerId
    try {
      await invoicesCollection.createIndex({ customerId: 1 });
      console.log("✅ Index created: customerId (1)");
    } catch (error) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists: customerId (1)");
      } else {
        console.error("❌ Error creating customerId index:", error.message);
      }
    }

    // ایندکس برای status
    try {
      await invoicesCollection.createIndex({ status: 1 });
      console.log("✅ Index created: status (1)");
    } catch (error) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists: status (1)");
      } else {
        console.error("❌ Error creating status index:", error.message);
      }
    }

    // ایندکس برای dueAt
    try {
      await invoicesCollection.createIndex({ dueAt: 1 });
      console.log("✅ Index created: dueAt (1)");
    } catch (error) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists: dueAt (1)");
      } else {
        console.error("❌ Error creating dueAt index:", error.message);
      }
    }

    // ایندکس برای marketerId
    try {
      await invoicesCollection.createIndex({ marketerId: 1 });
      console.log("✅ Index created: marketerId (1)");
    } catch (error) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists: marketerId (1)");
      } else {
        console.error("❌ Error creating marketerId index:", error.message);
      }
    }

    // ایندکس ترکیبی برای جستجوهای پیشرفته
    try {
      await invoicesCollection.createIndex({ customerId: 1, status: 1, dueAt: -1 });
      console.log("✅ Index created: customerId (1) + status (1) + dueAt (-1)");
    } catch (error) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists: customerId (1) + status (1) + dueAt (-1)");
      } else {
        console.error("❌ Error creating compound index:", error.message);
      }
    }

    // نمایش لیست ایندکس‌های موجود
    console.log("\n📋 Current indexes on 'invoices' collection:");
    const indexes = await invoicesCollection.indexes();
    indexes.forEach((index) => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// اجرای migration
addInvoiceIndexes().catch(console.error);

