/**
 * إعدادات الموقع — Ecoway Men Products
 */
const SITE_CONFIG = {
  name: 'Ecoway Men Products',
  nameAr: 'Ecoway — منتجات رجالية',
  tagline: 'عناية رجالية أصيلة بجودة Ecoway',
  email: 'ecowaymenproducts@gmail.com',
  whatsapp: '01100645794',
  whatsappIntl: '201100645794',
  currency: 'ج.م',
  shippingCost: 60,
  freeShippingMin: 1000,
  deliveryDays: '4–7 أيام',
  paymentMethod: 'الدفع عند الاستلام (COD)',
  year: new Date().getFullYear(),
  /** true = إغلاق مؤقت للمتجر؛ تبقى join.html (وadmin) فقط */
  siteClosedTemporarily: true,
  // رابط Google Apps Script — الطلبات (POST) والمنتجات (?action=products)
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbzpz_o0cZ4s_zFLvNeMku9lQmlOzZIb9hWS42kD67hTgeRMY7AH_htxsZH0gjeNWCDqsg/exec',
  // اختياري — يُشتق تلقائياً من orderEndpoint إن تُرك فارغاً
  productsEndpoint: '',
  basePath: (function () {
    const path = window.location.pathname;
    if (path.includes('/ecoway-men-products')) {
      return '/ecoway-men-products/';
    }
    return './';
  })()
};

(function enforceSiteClosedGate() {
  if (!SITE_CONFIG.siteClosedTemporarily) return;
  var path = (window.location.pathname || '').toLowerCase();
  var file = path.split('/').pop() || '';
  if (!file || file.indexOf('.') === -1) file = 'index.html';
  if (file === 'join.html' || file === 'admin.html') return;
  var base = SITE_CONFIG.basePath;
  window.location.replace(base === './' ? 'join.html' : base + 'join.html');
})();

/** أثناء الإغلاق المؤقت: إخفاء كلمة Men من الاسم الظاهر والعنوان */
(function hideMenBrandTemporarily() {
  if (!SITE_CONFIG.siteClosedTemporarily) return;
  SITE_CONFIG.name = String(SITE_CONFIG.name || '')
    .replace(/\bMen\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (typeof document !== 'undefined' && document.title) {
    document.title = String(document.title)
      .replace(/\bMen\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+\|/g, ' |')
      .replace(/\|\s+/g, '| ')
      .trim();
  }
})();

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج'
];

const CATEGORIES = [
  { id: 'perfumes', name: 'عطور رجالي', icon: '🌿' },
  { id: 'skincare', name: 'عناية بالبشرة للرجال', icon: '✨' },
  { id: 'home', name: 'منتجات لعربيتك', icon: '🚗' },
  { id: 'packages', name: 'باكدجات', icon: '🎁' }
];
