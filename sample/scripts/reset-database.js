/**
 * اسکریپت پاک‌سازی کامل دیتابیس (به جز یک کاربر)
 * 
 * ⚠️ هشدار: این اسکریپت تمام داده‌ها را پاک می‌کند!
 * 
 * استفاده:
 * node scripts/reset-database.js <mobile>
 * 
 * مثال:
 * node scripts/reset-database.js 09126723365
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tamirban_tamirban1';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.error('لطفاً فایل .env.local را بررسی کنید.');
  process.exit(1);
}

const keepMobile = process.argv[2] || '09126723365';
const forceFlag = process.argv[3] === '--force' || process.argv[3] === '-f';

if (!keepMobile) {
  console.error('❌ شماره موبایل الزامی است');
  console.error('استفاده: node scripts/reset-database.js <mobile> [--force]');
  console.error('مثال: node scripts/reset-database.js 09126723365 --force');
  process.exit(1);
}

// Normalize phone number
function normalizePhone(phone) {
  return phone.replace(/\D/g, '').replace(/^0/, '98');
}

// Ask for confirmation
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function resetDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ اتصال به MongoDB برقرار شد\n');

    const db = client.db(MONGODB_DB_NAME);
    
    // Find the user to keep
    const usersCollection = db.collection('users');
    const normalizedMobile = normalizePhone(keepMobile);
    
    console.log(`🔍 جستجوی کاربر با شماره: ${keepMobile} (${normalizedMobile})...`);
    
    const userToKeep = await usersCollection.findOne({
      $or: [
        { mobile: keepMobile },
        { mobile: normalizedMobile },
        { mobile: `+${normalizedMobile}` },
        { mobile: `0${keepMobile.replace(/^98/, '')}` },
      ]
    });

    if (!userToKeep) {
      console.error(`\n❌ کاربری با شماره ${keepMobile} یافت نشد!`);
      console.error('لطفاً ابتدا با این شماره وارد سیستم شوید یا شماره صحیح را وارد کنید.');
      process.exit(1);
    }

    console.log(`\n📋 اطلاعات کاربری که حفظ خواهد شد:`);
    console.log(`   - ID: ${userToKeep._id}`);
    console.log(`   - نام: ${userToKeep.fullName || 'تعریف نشده'}`);
    console.log(`   - شماره موبایل: ${userToKeep.mobile}`);
    console.log(`   - نقش فعلی: ${userToKeep.role}`);
    console.log(`   - وضعیت: ${userToKeep.isActive ? 'فعال' : 'غیرفعال'}`);

    // Update user role to SUPER_ADMIN if not already
    if (userToKeep.role !== 'SUPER_ADMIN') {
      console.log(`\n⚠️  نقش کاربر ${userToKeep.role} است. در حال تغییر به SUPER_ADMIN...`);
      await usersCollection.updateOne(
        { _id: userToKeep._id },
        {
          $set: {
            role: 'SUPER_ADMIN',
            updatedAt: new Date(),
            updatedBy: 'reset-script',
          }
        }
      );
      console.log(`✅ نقش کاربر به SUPER_ADMIN تغییر یافت`);
    }

    // Show what will be deleted
    const customersCount = await db.collection('customers').countDocuments();
    const visitsCount = await db.collection('visits').countDocuments();
    const invoicesCount = await db.collection('invoices').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    const marketersCount = await db.collection('marketers').countDocuments();
    const smsLogsCount = await db.collection('sms_logs').countDocuments();
    const otpAttemptsCount = await db.collection('otp_attempts').countDocuments();

    console.log(`\n📊 آمار فعلی دیتابیس:`);
    console.log(`   - کاربران: ${usersCount} (1 کاربر حفظ خواهد شد)`);
    console.log(`   - مشتریان: ${customersCount}`);
    console.log(`   - ویزیت‌ها: ${visitsCount}`);
    console.log(`   - پیش‌فاکتورها: ${invoicesCount}`);
    console.log(`   - پروفایل بازاریاب‌ها: ${marketersCount}`);
    console.log(`   - لاگ SMS: ${smsLogsCount}`);
    console.log(`   - تلاش‌های OTP: ${otpAttemptsCount}`);

    // Confirmation
    console.log(`\n⚠️  ⚠️  ⚠️  هشدار: این عملیات غیرقابل برگشت است! ⚠️  ⚠️  ⚠️`);
    console.log(`تمام داده‌های بالا پاک خواهند شد به جز کاربر ${keepMobile}`);
    
    if (!forceFlag) {
      const answer = await askQuestion('\nآیا مطمئن هستید؟ (yes/no): ');
      
      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('\n❌ عملیات لغو شد');
        process.exit(0);
      }
    } else {
      console.log('\n⚡ حالت --force فعال است، تایید خودکار...');
      // Wait 2 seconds to give user chance to cancel
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🗑️  شروع پاک‌سازی...\n');

    // Delete all users except the one to keep
    const deleteUsersResult = await usersCollection.deleteMany({
      _id: { $ne: userToKeep._id }
    });
    console.log(`✅ ${deleteUsersResult.deletedCount} کاربر حذف شد`);

    // Delete all customers
    const deleteCustomersResult = await db.collection('customers').deleteMany({});
    console.log(`✅ ${deleteCustomersResult.deletedCount} مشتری حذف شد`);

    // Delete all visits
    const deleteVisitsResult = await db.collection('visits').deleteMany({});
    console.log(`✅ ${deleteVisitsResult.deletedCount} ویزیت حذف شد`);

    // Delete all invoices
    const deleteInvoicesResult = await db.collection('invoices').deleteMany({});
    console.log(`✅ ${deleteInvoicesResult.deletedCount} پیش‌فاکتور حذف شد`);

    // Delete all marketer profiles
    const deleteMarketersResult = await db.collection('marketers').deleteMany({});
    console.log(`✅ ${deleteMarketersResult.deletedCount} پروفایل بازاریاب حذف شد`);

    // Delete all SMS logs
    const deleteSmsLogsResult = await db.collection('sms_logs').deleteMany({});
    console.log(`✅ ${deleteSmsLogsResult.deletedCount} لاگ SMS حذف شد`);

    // Delete all OTP attempts
    const deleteOtpAttemptsResult = await db.collection('otp_attempts').deleteMany({});
    console.log(`✅ ${deleteOtpAttemptsResult.deletedCount} تلاش OTP حذف شد`);

    console.log(`\n✅ پاک‌سازی کامل انجام شد!`);
    console.log(`\n📋 کاربر باقی‌مانده:`);
    console.log(`   - شماره موبایل: ${userToKeep.mobile}`);
    console.log(`   - نقش: SUPER_ADMIN`);
    console.log(`\n💡 می‌توانید با این شماره وارد سیستم شوید و از اول شروع کنید.`);

  } catch (error) {
    console.error('\n❌ خطا:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ اتصال بسته شد');
  }
}

resetDatabase();

