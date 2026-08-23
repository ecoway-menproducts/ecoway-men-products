/**
 * Ecoway Men Products — Google Apps Script
 * =========================================
 * الطلبات: POST → شيت Orders
 * المنتجات: GET ?action=products → شيت products
 * الإدارة: GET ?action=adminAuth|adminProducts + POST adminAction
 *
 * خطوات النشر:
 * 1. افتح Google Sheet (Ecoway Orders) أو أنشئ جدولاً جديداً
 * 2. Extensions → Apps Script → الصق هذا الملف
 * 3. شغّل مرة واحدة: seedProductsSheet ثم authorizeAdminDrive
 * 4. Deploy → New deployment → Web app (أو New version)
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. انسخ رابط /exec إلى assets/js/config.js
 */

var ORDERS_SHEET_NAME = 'Orders';
var PRODUCTS_SHEET_NAME = 'products';
var JOIN_SHEET_NAME = 'join';
var PRODUCTS_IMAGES_FOLDER = 'ecoway-products-images';
var NOTIFY_EMAIL = 'ecowaymenproducts@gmail.com';
var ADMIN_TOKEN = '9607330';
var MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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

var JOIN_SHEET_HEADERS = [
  'التاريخ',
  'الاسم',
  'الهاتف',
  'سنة الميلاد',
  'السن',
  'المحافظة',
  'خبرة التسويق',
  'نبذة الخبرة',
  'أفضل وقت للتواصل',
  'ملاحظات'
];

/**
 * POST — طلبات المتجر أو طلبات الانضمام أو إجراءات لوحة الإدارة (adminAction)
 */
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    var data = JSON.parse(raw);

    if (data.adminAction) {
      return handleAdminAction_(data);
    }

    if (data.formType === 'join') {
      return handleJoinSubmission_(data);
    }

    var sheet = getOrdersSheet();

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

function handleJoinSubmission_(data) {
  var sheet = getJoinSheet();
  sheet.appendRow([
    data.date || new Date().toISOString(),
    data.fullName || '',
    data.phone || '',
    data.birthYear || '',
    data.age || '',
    data.governorate || '',
    data.hasMarketingExp || '',
    data.experienceBio || '',
    data.preferredTimes || '',
    data.notes || ''
  ]);

  sendJoinEmail_(data);
  return jsonResponse({ success: true, message: 'تم تسجيل بيانات الانضمام' });
}

function getJoinSheet() {
  return getOrCreateSheet_(JOIN_SHEET_NAME, JOIN_SHEET_HEADERS);
}

function sendJoinEmail_(data) {
  var subject = 'طلب انضمام جديد — ابدأ مع Ecoway';
  var body =
    'طلب انضمام جديد من الموقع\n\n' +
    'الاسم: ' + (data.fullName || '') + '\n' +
    'الهاتف: ' + (data.phone || '') + '\n' +
    'سنة الميلاد: ' + (data.birthYear || '') + '\n' +
    'السن: ' + (data.age || '') + '\n' +
    'المحافظة: ' + (data.governorate || '') + '\n' +
    'خبرة التسويق: ' + (data.hasMarketingExp || '') + '\n' +
    'نبذة الخبرة: ' + (data.experienceBio || '—') + '\n' +
    'أفضل وقت للتواصل: ' + (data.preferredTimes || '') + '\n' +
    'ملاحظات: ' + (data.notes || '—') + '\n' +
    'التاريخ: ' + (data.date || new Date().toISOString());

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
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

  if (action === 'adminAuth' || action === 'adminProducts') {
    if (!isValidAdminToken_(e.parameter.token)) {
      return jsonResponse({ success: false, error: 'غير مصرح' });
    }
    if (action === 'adminAuth') {
      return jsonResponse({ success: true });
    }
    try {
      return jsonResponse({
        success: true,
        products: getAllProductsFromSheet_()
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
      adminAuth: '?action=adminAuth&token=',
      adminProducts: '?action=adminProducts&token=',
      orders: 'POST JSON to this URL',
      join: 'POST JSON with formType=join'
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
    var index = headers.indexOf(normalizeHeader_(key));
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
    notes_top: notesTop,
    notes_middle: notesMiddle,
    notes_base: notesBase,
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
  if (typeof value === 'boolean') return value;
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

function isValidAdminToken_(token) {
  return String(token || '').trim() === ADMIN_TOKEN;
}

function requireAdmin_(data) {
  if (!isValidAdminToken_(data && data.token)) {
    throw new Error('غير مصرح');
  }
}

/**
 * شغّل مرة واحدة من Apps Script للموافقة على صلاحية Drive
 */
function authorizeAdminDrive() {
  getProductsImagesFolder_();
}

function handleAdminAction_(data) {
  requireAdmin_(data);

  if (data.adminAction === 'login') {
    return jsonResponse({ success: true });
  }

  if (data.adminAction === 'list') {
    return jsonResponse({ success: true, products: getAllProductsFromSheet_() });
  }

  if (data.adminAction === 'saveProduct') {
    var saved = saveProduct_(data);
    return jsonResponse({ success: true, product: saved });
  }

  if (data.adminAction === 'deleteProduct') {
    deleteProduct_(data.id);
    return jsonResponse({ success: true });
  }

  throw new Error('إجراء غير معروف');
}

function getAllProductsFromSheet_() {
  var sheet = getProductsSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0].map(normalizeHeader_);
  var products = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (isRowEmpty_(row)) continue;
    var item = rowToProduct_(headers, row);
    if (!item || !item.id) continue;
    products.push(item);
  }

  return products;
}

function saveProduct_(data) {
  var incoming = data.product || {};
  var id = String(incoming.id || '').trim();
  var name = String(incoming.name || '').trim();
  var originalId = String(data.originalId || id).trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error('معرف المنتج يجب أن يحتوي حروف إنجليزية وأرقام و - أو _ فقط');
  }
  if (!name) {
    throw new Error('اسم المنتج مطلوب');
  }

  var sheet = getProductsSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(normalizeHeader_);
  var rowIndex = findProductRowIndex_(values, headers, originalId);

  if (rowIndex === -1) {
    if (findProductRowIndex_(values, headers, id) !== -1) {
      throw new Error('يوجد منتج بنفس المعرف');
    }
  } else if (id !== originalId && findProductRowIndex_(values, headers, id) !== -1) {
    throw new Error('يوجد منتج بنفس المعرف');
  }

  var existingImage = '';
  if (rowIndex !== -1) {
    var existing = rowToProduct_(headers, values[rowIndex]);
    existingImage = existing && existing.image ? existing.image : '';
  }

  var imageUrl = existingImage;
  if (data.imageBase64) {
    imageUrl = uploadProductImage_(id, data.imageBase64, data.imageMimeType, data.imageFileName);
  } else if (incoming.image) {
    imageUrl = String(incoming.image).trim();
  }

  var rowValues = productToRow_(incoming, id, name, imageUrl);

  if (rowIndex === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(rowIndex + 1, 1, 1, PRODUCTS_SHEET_HEADERS.length).setValues([rowValues]);
  }

  return rowToProduct_(PRODUCTS_SHEET_HEADERS.map(normalizeHeader_), rowValues);
}

function deleteProduct_(id) {
  id = String(id || '').trim();
  if (!id) throw new Error('معرف المنتج مطلوب');

  var sheet = getProductsSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(normalizeHeader_);
  var rowIndex = findProductRowIndex_(values, headers, id);
  if (rowIndex === -1) {
    throw new Error('المنتج غير موجود');
  }
  sheet.deleteRow(rowIndex + 1);
}

function findProductRowIndex_(values, headers, id) {
  var col = headers.indexOf('id');
  if (col === -1 || !id) return -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][col] || '').trim() === id) return i;
  }
  return -1;
}

function productToRow_(p, id, name, imageUrl) {
  var notesTop = p.notes_top || (p.notes && p.notes.top) || '';
  var notesMiddle = p.notes_middle || (p.notes && p.notes.middle) || '';
  var notesBase = p.notes_base || (p.notes && p.notes.base) || '';

  return [
    id,
    name,
    String(p.category || '').trim(),
    parseNumber_(p.price),
    p.compareAt === '' || p.compareAt == null ? '' : parseOptionalNumber_(p.compareAt),
    String(p.description || '').trim(),
    imageUrl || '',
    p.inStock !== false && p.inStock !== 'FALSE' && p.inStock !== 'false',
    p.active !== false && p.active !== 'FALSE' && p.active !== 'false',
    String(notesTop).trim(),
    String(notesMiddle).trim(),
    String(notesBase).trim()
  ];
}

function getProductsImagesFolder_() {
  var it = DriveApp.getFoldersByName(PRODUCTS_IMAGES_FOLDER);
  if (it.hasNext()) return it.next();
  var folder = DriveApp.createFolder(PRODUCTS_IMAGES_FOLDER);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function uploadProductImage_(productId, base64Data, mimeType, fileName) {
  var raw = String(base64Data || '').replace(/^data:[^;]+;base64,/, '');
  if (!raw) throw new Error('الصورة فارغة');

  mimeType = String(mimeType || 'image/jpeg').split(';')[0].trim().toLowerCase();
  var allowed = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };
  if (!allowed[mimeType]) {
    throw new Error('نوع الصورة غير مدعوم');
  }

  var decoded = Utilities.base64Decode(raw);
  if (decoded.length > MAX_IMAGE_BYTES) {
    throw new Error('حجم الصورة أكبر من 8 ميجا');
  }

  var safeName = String(fileName || productId + allowed[mimeType]).replace(/[^\w.\-ء-ي]+/g, '_');
  if (safeName.indexOf('.') === -1) safeName += allowed[mimeType];

  var blob = Utilities.newBlob(decoded, mimeType, safeName);
  var file = getProductsImagesFolder_().createFile(blob);
  file.setName(productId + '-' + file.getId().slice(-6) + allowed[mimeType]);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return 'https://drive.google.com/file/d/' + file.getId() + '/view';
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
