import PDFDocument from "pdfkit";
import type { Invoice } from "@/lib/types";
import { toJalaali } from "jalaali-js";

/**
 * تبدیل عدد به فرمت فارسی (با جداکننده هزارگان)
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}

/**
 * تبدیل تاریخ به فرمت شمسی
 */
function formatJalaliDate(date: Date): string {
  const jalali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalali.jy}/${String(jalali.jm).padStart(2, "0")}/${String(jalali.jd).padStart(2, "0")}`;
}

/**
 * تولید PDF پیش‌فاکتور
 */
export async function generateInvoicePDF(invoice: Invoice, customerName?: string, marketerName?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // ایجاد PDF document
      // استفاده از فونت‌های استاندارد PDF که pdfkit به صورت built-in دارد
      // این فونت‌ها نیازی به فایل ندارند و در همه محیط‌ها کار می‌کنند
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", (error) => {
        console.error("[PDF Generator] PDF generation error:", error);
        reject(error);
      });

      // استفاده از فونت‌های استاندارد PDF که pdfkit به صورت built-in دارد
      // Times-Roman و Times-Bold فونت‌های استاندارد PDF هستند که نیازی به فایل ندارند
      // این فونت‌ها در همه محیط‌ها (development و production) کار می‌کنند
      // مهم: باید از همان ابتدا فونت را تنظیم کنیم تا pdfkit از Helvetica استفاده نکند
      // pdfkit به صورت پیش‌فرض از Helvetica استفاده می‌کند، پس باید فونت را از همان ابتدا تنظیم کنیم
      // استفاده از try-catch برای مدیریت خطاهای فونت
      const setFont = (fontName: string) => {
        try {
          doc.font(fontName);
          return true;
        } catch (error) {
          console.warn(`[PDF Generator] Font ${fontName} not available:`, error);
          return false;
        }
      };

      // تلاش برای تنظیم فونت از همان ابتدا
      // اول Times-Roman، سپس Courier، در نهایت فونت پیش‌فرض
      if (!setFont("Times-Roman")) {
        if (!setFont("Courier")) {
          console.warn("[PDF Generator] Using default font (may cause Helvetica.afm error)");
        }
      }
      
      // هدر پیش‌فاکتور
      doc.fontSize(24);
      setFont("Times-Bold");
      doc.text("پیش‌فاکتور", { align: "right" });
      doc.moveDown(0.5);
      const invoiceNumber = (invoice.meta?.invoiceNumber as string) || invoice._id;
      doc.fontSize(12);
      setFont("Times-Roman");
      doc.text(`شماره: ${invoiceNumber}`, { align: "right" });
      doc.moveDown(0.3);
      setFont("Times-Roman");
      doc.text(`تاریخ صدور: ${formatJalaliDate(invoice.issuedAt)}`, { align: "right" });
      setFont("Times-Roman");
      doc.text(`تاریخ سررسید: ${formatJalaliDate(invoice.dueAt)}`, { align: "right" });
      doc.moveDown(1);

      // اطلاعات مشتری
      doc.fontSize(14);
      setFont("Times-Bold");
      doc.text("مشتری:", { align: "right" });
      doc.moveDown(0.3);
      doc.fontSize(12);
      setFont("Times-Roman");
      doc.text(customerName || "مشتری ناشناس", { align: "right" });
      if (marketerName) {
        doc.moveDown(0.3);
        setFont("Times-Roman");
        doc.text(`مسئول بازاریابی: ${marketerName}`, { align: "right" });
      }
      doc.moveDown(1);

      // جدول آیتم‌ها
      doc.fontSize(12);
      setFont("Times-Bold");
      const tableTop = doc.y;
      const itemHeight = 20;
      const colWidths = {
        title: 200,
        quantity: 60,
        unit: 60,
        unitPrice: 80,
        discount: 70,
        tax: 70,
        total: 80,
      };

      // هدر جدول
      setFont("Times-Bold");
      doc.text("شرح", 50, tableTop);
      setFont("Times-Bold");
      doc.text("تعداد", 50 + colWidths.title, tableTop);
      setFont("Times-Bold");
      doc.text("واحد", 50 + colWidths.title + colWidths.quantity, tableTop);
      setFont("Times-Bold");
      doc.text("قیمت واحد", 50 + colWidths.title + colWidths.quantity + colWidths.unit, tableTop);
      setFont("Times-Bold");
      doc.text("تخفیف", 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice, tableTop);
      setFont("Times-Bold");
      doc.text("مالیات", 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice + colWidths.discount, tableTop);
      setFont("Times-Bold");
      doc.text("جمع", 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice + colWidths.discount + colWidths.tax, tableTop);

      // خط جداکننده
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown(0.5);

      // آیتم‌ها
      doc.fontSize(10);
      setFont("Times-Roman");
      let currentY = doc.y;
      invoice.items.forEach((item) => {
        if (currentY > 700) {
          // صفحه جدید
          doc.addPage();
          currentY = 50;
        }

        const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
        const itemTax = itemTotal * ((item.taxRate || 0) / 100);
        const itemFinalTotal = itemTotal + itemTax;

        doc.text(item.title.substring(0, 30), 50, currentY);
        doc.text(String(item.quantity), 50 + colWidths.title, currentY);
        doc.text(item.unit, 50 + colWidths.title + colWidths.quantity, currentY);
        doc.text(formatNumber(item.unitPrice), 50 + colWidths.title + colWidths.quantity + colWidths.unit, currentY);
        doc.text(formatNumber(item.discount || 0), 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice, currentY);
        doc.text(formatNumber(itemTax), 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice + colWidths.discount, currentY);
        doc.text(formatNumber(itemFinalTotal), 50 + colWidths.title + colWidths.quantity + colWidths.unit + colWidths.unitPrice + colWidths.discount + colWidths.tax, currentY);

        currentY += itemHeight;
        doc.y = currentY;
      });

      doc.moveDown(1);

      // خلاصه مبالغ
      const summaryY = doc.y;
      doc.fontSize(12);
      setFont("Times-Roman");
      doc.text("جمع کل:", 400, summaryY);
      doc.text(formatNumber(invoice.subtotal), 500, summaryY);
      doc.moveDown(0.5);

      if (invoice.discountTotal && invoice.discountTotal > 0) {
        doc.text("تخفیف:", 400, doc.y);
        doc.text(formatNumber(invoice.discountTotal), 500, doc.y);
        doc.moveDown(0.5);
      }

      doc.text("مالیات:", 400, doc.y);
      doc.text(formatNumber(invoice.taxTotal), 500, doc.y);
      doc.moveDown(0.5);

      doc.fontSize(14);
      setFont("Times-Bold");
      doc.text("مبلغ قابل پرداخت:", 400, doc.y);
      doc.text(formatNumber(invoice.grandTotal), 500, doc.y);
      doc.moveDown(1);

      // وضعیت پرداخت
      const statusLabels: Record<string, string> = {
        DRAFT: "پیش‌نویس",
        SENT: "ارسال شده",
        PAID: "پرداخت شد",
        OVERDUE: "معوق",
        CANCELLED: "لغو شد",
      };
      doc.fontSize(12);
      setFont("Times-Roman");
      doc.text(`وضعیت: ${statusLabels[invoice.status] || invoice.status}`, { align: "right" });
      if (invoice.paidAt) {
        doc.text(`تاریخ پرداخت: ${formatJalaliDate(invoice.paidAt)}`, { align: "right" });
      }
      if (invoice.paymentReference) {
        doc.text(`شماره مرجع پرداخت: ${invoice.paymentReference}`, { align: "right" });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

