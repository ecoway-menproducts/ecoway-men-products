/**
 * Ecoway Men Products — Google Apps Script
 * =========================================
 * الطلبات: POST → شيت Orders
 * المنتجات: GET ?action=products → شيت products
 *
 * خطوات النشر:
 * 1. افتح Google Sheet (Ecoway Orders) أو أنشئ جدولاً جديداً
 * 2. Extensions → Apps Script → الصق هذا الملف
 * 3. شغّل مرة واحدة: seedProductsSheet (من القائمة المنسدلة ثم Run)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. انسخ رابط /exec إلى assets/js/config.js
 */

var ORDERS_SHEET_NAME = 'Orders';
var PRODUCTS_SHEET_NAME = 'products';
var NOTIFY_EMAIL = 'ecowaymenproducts@gmail.com';

var ORDERS_SHEET_HEADERS = [
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

var PRODUCTS_SHEET_HEADERS = [
  'id',
  'name',
  'category',
  'price',
  'compareAt',
  'description',
  'image',
  'inStock',
  'active',
  'notes_top',
  'notes_middle',
  'notes_base'
];

/**
 * POST — استقبال طلب جديد من checkout.html
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

    sheet.appendRow([
      data.date || new Date().toISOString(),
      data.customerName || '',
      data.phone || '',
      data.governorate || '',
      data.address || '',
      data.notes || '',
      productsText,
      data.subtotal != null ? data.subtotal : '',
      data.shipping != null ? data.shipping : '',
      data.totalPrice != null ? data.totalPrice : '',
      data.paymentMethod || 'COD'
    ]);

    sendOrderEmail(data, productsText);

    return jsonResponse({ success: true, message: 'تم استلام الطلب' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * GET — حالة الخدمة أو قائمة المنتجات
 * المنتجات: YOUR_URL/exec?action=products
 */
function doGet(e) {
  e = e || {};
  var action = (e.parameter && e.parameter.action) || '';

  if (action === 'products') {
    try {
      return jsonResponse({
        success: true,
        products: getProductsFromSheet()
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        error: err.message,
        products: []
      });
    }
  }

  return jsonResponse({
    status: 'ok',
    service: 'Ecoway Men Products API',
    endpoints: {
      products: '?action=products',
      orders: 'POST JSON to this URL'
    }
  });
}

function getOrdersSheet() {
  return getOrCreateSheet_(ORDERS_SHEET_NAME, ORDERS_SHEET_HEADERS);
}

function getProductsSheet() {
  return getOrCreateSheet_(PRODUCTS_SHEET_NAME, PRODUCTS_SHEET_HEADERS);
}

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * قراءة المنتجات من شيت products
 * يعرض فقط الصفوف التي active = TRUE
 */
function getProductsFromSheet() {
  var sheet = getProductsSheet();
  var values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  var headers = values[0].map(normalizeHeader_);
  var products = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (isRowEmpty_(row)) continue;

    var item = rowToProduct_(headers, row);
    if (!item) continue;
    if (!item.active) continue;
    if (!item.id || !item.name) continue;

    products.push(item);
  }

  return products;
}

function rowToProduct_(headers, row) {
  var get = function (key) {
    var index = headers.indexOf(key);
    return index === -1 ? '' : row[index];
  };

  var id = String(get('id') || '').trim();
  var name = String(get('name') || '').trim();
  var category = String(get('category') || '').trim();
  var price = parseNumber_(get('price'));
  var compareAt = parseOptionalNumber_(get('compareAt'));
  var description = String(get('description') || '').trim();
  var image = String(get('image') || '').trim();
  var inStock = parseBoolean_(get('inStock'), true);
  var active = parseBoolean_(get('active'), true);

  var notesTop = String(get('notes_top') || '').trim();
  var notesMiddle = String(get('notes_middle') || '').trim();
  var notesBase = String(get('notes_base') || '').trim();

  var product = {
    id: id,
    name: name,
    category: category,
    price: price,
    compareAt: compareAt,
    description: description,
    image: image,
    inStock: inStock,
    active: active,
    reviews: []
  };

  if (notesTop || notesMiddle || notesBase) {
    product.notes = {};
    if (notesTop) product.notes.top = notesTop;
    if (notesMiddle) product.notes.middle = notesMiddle;
    if (notesBase) product.notes.base = notesBase;
  }

  return product;
}

function normalizeHeader_(value) {
  return String(value || '').trim().toLowerCase();
}

function isRowEmpty_(row) {
  for (var i = 0; i < row.length; i++) {
    if (String(row[i] || '').trim() !== '') return false;
  }
  return true;
}

function parseNumber_(value) {
  if (value === '' || value == null) return 0;
  var num = Number(String(value).replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
}

function parseOptionalNumber_(value) {
  if (value === '' || value == null) return null;
  var num = Number(String(value).replace(/,/g, '').trim());
  return isNaN(num) ? null : num;
}

function parseBoolean_(value, defaultValue) {
  if (value === '' || value == null) return defaultValue;
  var text = String(value).trim().toLowerCase();
  if (text === 'true' || text === 'yes' || text === '1' || text === 'نعم') return true;
  if (text === 'false' || text === 'no' || text === '0' || text === 'لا') return false;
  return defaultValue;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

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

/**
 * شغّل هذه الدالة مرة واحدة من محرر Apps Script
 * لإنشاء شيت products وإضافة 5 منتجات تجريبية
 */
function seedProductsSheet() {
  var sheet = getProductsSheet();
  var placeholderImage =
    'https://ecoway-menproducts.github.io/ecoway-men-products/assets/images/placeholder.svg';

  if (sheet.getLastRow() > 1) {
    throw new Error('شيت products يحتوي بيانات بالفعل. احذف الصفوف يدوياً إن أردت إعادة التعبئة.');
  }

  var sampleRows = [
    [
      'perf-silver',
      'عطر الرجل الفضي',
      'perfumes',
      450,
      '',
      'عطر رجالي فاخر بتركيبة منعشة تجمع بين نفحات الحمضيات والأخشاب. مثالي للاستخدام اليومي والمناسبات الرسمية.',
      placeholderImage,
      true,
      true,
      'برغموت، ليمون',
      'لافندر، فلفل',
      'أرز، خشب الصندل'
    ],
    [
      'perf-night-king',
      'عطر نايت كينج',
      'perfumes',
      380,
      450,
      'عطر ليلي جريء يعكس ثقة الرجل العصري. نفحات دافئة من العنبر والمسك.',
      placeholderImage,
      true,
      true,
      'كارداموم، زعفران',
      'ورد، عنبر',
      'مسك، فانيليا'
    ],
    [
      'skin-charcoal-wash',
      'غسول الفحم المنشط',
      'skincare',
      75,
      '',
      'غسول وجه بالفحم المنشط لتنظيف عميق وإزالة الشوائب والزيوت الزائدة.',
      placeholderImage,
      true,
      true,
      '',
      '',
      ''
    ],
    [
      'car-freshener',
      'معطر سيارة Ecoway',
      'home',
      75,
      '',
      'معطر سيارة برائحة منعشة تدوم طويلاً. مناسب للتعليق أو التثبيت داخل المقصورة.',
      placeholderImage,
      true,
      true,
      '',
      '',
      ''
    ],
    [
      'pkg-full-care',
      'باكدج العناية الشاملة',
      'packages',
      650,
      780,
      'باكدج متكامل يشمل: عطر + جل وجه + لوشن ما بعد الحلاقة + بخاخ جسم. توفير 17%.',
      placeholderImage,
      true,
      true,
      '',
      '',
      ''
    ]
  ];

  sheet.getRange(2, 1, sampleRows.length, PRODUCTS_SHEET_HEADERS.length).setValues(sampleRows);
}
