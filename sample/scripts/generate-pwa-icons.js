/**
 * اسکریپت تولید آیکون‌های PWA از favicon.png
 * 
 * نیازمندی: npm install --save-dev sharp
 * 
 * نحوه اجرا:
 * node scripts/generate-pwa-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const faviconPath = path.join(process.cwd(), "public", "favicon.png");
const iconsDir = path.join(process.cwd(), "public", "icons");

// ایجاد پوشه icons در صورت عدم وجود
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// بررسی وجود favicon.png
if (!fs.existsSync(faviconPath)) {
  console.error("❌ فایل favicon.png در public/ یافت نشد!");
  console.error("   لطفاً ابتدا یک آیکون 512x512 در public/favicon.png قرار دهید.");
  process.exit(1);
}

const sizes = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "icon-180.png" },
];

async function generateIcons() {
  console.log("🖼️  شروع تولید آیکون‌های PWA...\n");

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(iconsDir, name);
      await sharp(faviconPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} (${size}x${size}) ایجاد شد`);
    } catch (error) {
      console.error(`❌ خطا در ایجاد ${name}:`, error.message);
    }
  }

  console.log("\n✅ تمام آیکون‌ها با موفقیت ایجاد شدند!");
  console.log(`📁 مسیر: ${iconsDir}`);
}

generateIcons().catch((error) => {
  console.error("❌ خطا در تولید آیکون‌ها:", error);
  process.exit(1);
});

