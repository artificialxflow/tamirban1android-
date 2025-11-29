/**
 * اسکریپت تغییر نقش کاربر به SUPER_ADMIN
 * 
 * استفاده:
 * node scripts/change-user-role.js <mobile> [role]
 * 
 * مثال:
 * node scripts/change-user-role.js 09126723365 SUPER_ADMIN
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tamirban_tamirban1';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.error('لطفاً فایل .env.local را بررسی کنید.');
  process.exit(1);
}

const mobile = process.argv[2];
const newRole = process.argv[3] || 'SUPER_ADMIN';

if (!mobile) {
  console.error('❌ شماره موبایل الزامی است');
  console.error('استفاده: node scripts/change-user-role.js <mobile> [role]');
  console.error('مثال: node scripts/change-user-role.js 09126723365 SUPER_ADMIN');
  process.exit(1);
}

const validRoles = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'MARKETER', 'CUSTOMER'];
if (!validRoles.includes(newRole)) {
  console.error(`❌ نقش نامعتبر: ${newRole}`);
  console.error(`نقش‌های معتبر: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Normalize phone number
function normalizePhone(phone) {
  return phone.replace(/\D/g, '').replace(/^0/, '98');
}

async function changeUserRole() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ اتصال به MongoDB برقرار شد');

    const db = client.db(MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    const normalizedMobile = normalizePhone(mobile);
    console.log(`\n🔍 جستجوی کاربر با شماره: ${mobile} (${normalizedMobile})...`);

    // Try to find by mobile (with or without +98 prefix)
    const user = await usersCollection.findOne({
      $or: [
        { mobile: mobile },
        { mobile: normalizedMobile },
        { mobile: `+${normalizedMobile}` },
        { mobile: `0${mobile.replace(/^98/, '')}` },
      ]
    });

    if (!user) {
      console.error(`❌ کاربری با شماره ${mobile} یافت نشد`);
      console.error('\n💡 نکته: می‌توانید از MongoDB Compass یا mongo shell برای بررسی کاربران استفاده کنید:');
      console.error('   db.users.find({}, { mobile: 1, fullName: 1, role: 1 })');
      process.exit(1);
    }

    console.log(`\n📋 اطلاعات کاربر فعلی:`);
    console.log(`   - ID: ${user._id}`);
    console.log(`   - نام: ${user.fullName || 'تعریف نشده'}`);
    console.log(`   - شماره موبایل: ${user.mobile}`);
    console.log(`   - نقش فعلی: ${user.role}`);
    console.log(`   - وضعیت: ${user.isActive ? 'فعال' : 'غیرفعال'}`);

    if (user.role === newRole) {
      console.log(`\n✅ کاربر از قبل نقش ${newRole} را دارد`);
      process.exit(0);
    }

    // Update role
    const result = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          role: newRole,
          updatedAt: new Date(),
          updatedBy: 'script',
        }
      }
    );

    if (result.modifiedCount === 1) {
      console.log(`\n✅ نقش کاربر با موفقیت به ${newRole} تغییر یافت`);
      console.log(`\n📋 اطلاعات به‌روز شده:`);
      console.log(`   - نقش جدید: ${newRole}`);
      console.log(`\n💡 نکته: برای اعمال تغییرات، باید از حساب خارج شده و دوباره وارد شوید.`);
    } else {
      console.error(`\n❌ خطا در به‌روزرسانی نقش`);
    }

  } catch (error) {
    console.error('\n❌ خطا:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ اتصال بسته شد');
  }
}

changeUserRole();

