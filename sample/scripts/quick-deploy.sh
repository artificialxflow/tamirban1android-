#!/bin/bash

# اسکریپت استقرار سریع (فقط build و restart PM2)

set -e

export NODE_ENV=production

echo "🔨 ساخت build..."
npm run build

if [ ! -d ".next" ]; then
    echo "❌ خطا: پوشه .next ساخته نشد!"
    exit 1
fi

if command -v pm2 &> /dev/null; then
    echo "🔄 Restart کردن PM2..."
    pm2 restart tamirban1.ir || pm2 start server.js --name tamirban1.ir --env production
    echo "✅ انجام شد!"
else
    echo "⚠️  PM2 یافت نشد. لطفاً به صورت دستی restart کنید."
fi

