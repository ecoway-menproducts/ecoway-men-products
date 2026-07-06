/**
 * Ecoway Men Products — Google Apps Script
 * =========================================
 * هذا الملف للنسخ إلى Google Apps Script (ليس جزءاً من تشغيل الموقع).
 *
 * خطوات النشر:
 * 1. أنشئ Google Sheet باسم "Ecoway Orders"
 * 2. ضع عناوين الأعمدة في الصف 1 (انظر SHEET_HEADERS أدناه)
 * 3. من الجدول: Extensions → Apps Script
 * 4. الصق محتوى هذا الملف بالكامل
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. انسخ رابط الـ Web App وضعه في assets/js/config.js → orderEndpoint
 */

var SHEET_NAME = 'Orders'; // أو اتركه فارغاً لاستخدام الورقة النشطة

/**
 * معالجة طلب POST من صفحة checkout.html
 */
function doPost(e) {
  try {
    var sheet = getOrdersSheet();
    var data = JSON.parse(e.postData.contents);

    var productsText = '';
    if (data.products && data.products.length) {
      productsText = data.products.map(function (p) {
        return p.name + ' × ' + p.quantity + ' (' + p.total + ' ج.م)';
      }).join(' | ');
    }

    var subtotal = data.subtotal != null ? data.subtotal : '';
    var shipping = data.shipping != null ? data.shipping : '';
    var total = data.totalPrice != null ? data.totalPrice : '';

    sheet.appendRow([
      data.date || new Date().toISOString(),
      data.customerName || '',
      data.phone || '',
      data.governorate || '',
      data.address || '',
      data.notes || '',
      productsText,
      subtotal,
      shipping,
      total,
      data.paymentMethod || 'COD'
    ]);

    sendOrderEmail(data, productsText);

    return jsonResponse({ success: true, message: 'تم استلام الطلب' });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * للتحقق من أن الرابط يعمل (افتحه في المتصفح)
 */
function doGet() {
  return jsonResponse({
    status: 'ok',
    service: 'Ecoway Men Products Order API',
    method: 'POST orders to this URL from checkout.html'
  });
}

function getOrdersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getActiveSheet();

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME || 'Orders');
    sheet.appendRow(SHEET_HEADERS);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

var SHEET_HEADERS = [
  'التاريخ',
  'الاسم',
  'الهاتف',
  'المحافظة',
  'العنوان',
  'ملاحظات',
  'المنتجات',
  'المجموع الفرعي',
  'الشحن',
  'الإجمالي',
  'طريقة الدفع'
];

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * اختياري — فعّلها بإزالة التعليق من doPost
 * غيّر NOTIFY_EMAIL إلى بريدك
 */
var NOTIFY_EMAIL = 'ecowaymenproducts@gmail.com';

function sendOrderEmail(data, productsText) {
  var subject = 'طلب جديد — Ecoway Men Products';
  var body =
    'طلب جديد من الموقع\n\n' +
    'الاسم: ' + (data.customerName || '') + '\n' +
    'الهاتف: ' + (data.phone || '') + '\n' +
    'المحافظة: ' + (data.governorate || '') + '\n' +
    'العنوان: ' + (data.address || '') + '\n' +
    'ملاحظات: ' + (data.notes || '—') + '\n\n' +
    'المنتجات:\n' + productsText + '\n\n' +
    'الإجمالي: ' + (data.totalPrice || '') + ' ج.م\n' +
    'التاريخ: ' + (data.date || new Date().toISOString());

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
