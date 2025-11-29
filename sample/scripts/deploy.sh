#!/bin/bash

# اسکریپت استقرار برای TamirBan
# این اسکریپت build را انجام می‌دهد و PM2 را restart می‌کند

set -e  # در صورت خطا، اجرا متوقف شود

echo "🚀 شروع فرآیند استقرار TamirBan..."

# بررسی وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js یافت نشد. لطفاً Node.js را نصب کنید."
    exit 1
fi

# بررسی وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm یافت نشد. لطفاً npm را نصب کنید."
    exit 1
fi

# تنظیم NODE_ENV به production
export NODE_ENV=production

echo "📦 نصب وابستگی‌ها..."
npm ci --omit=dev

echo "🔨 ساخت build production..."
npm run build

if [ ! -d ".next" ]; then
    echo "❌ خطا: پوشه .next ساخته نشد!"
    exit 1
fi

echo "✅ Build با موفقیت انجام شد!"

# بررسی وجود PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 Restart کردن PM2..."
    
    # بررسی وجود process
    if pm2 list | grep -q "tamirban1.ir"; then
        echo "   - متوقف کردن process موجود..."
        pm2 stop tamirban1.ir || true
        pm2 delete tamirban1.ir || true
    fi
    
    echo "   - راه‌اندازی مجدد با PM2..."
    pm2 start server.js --name tamirban1.ir --env production
    
    echo "✅ PM2 با موفقیت restart شد!"
    echo ""
    echo "📊 وضعیت PM2:"
    pm2 status
    
    echo ""
    echo "📝 برای مشاهده لاگ‌ها:"
    echo "   pm2 logs tamirban1.ir"
else
    echo "⚠️  PM2 یافت نشد. می‌توانید به صورت دستی اجرا کنید:"
    echo "   NODE_ENV=production node server.js"
fi

echo ""
echo "✅ استقرار با موفقیت انجام شد!"

