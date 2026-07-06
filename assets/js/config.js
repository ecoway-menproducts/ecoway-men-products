/**
 * إعدادات الموقع — Ecoway Men Products
 */
const SITE_CONFIG = {
  name: 'Ecoway Men Products',
  nameAr: 'إيكواي — منتجات رجالية',
  tagline: 'عناية رجالية أصيلة بجودة إيكواي',
  email: 'ecowaymenproducts@gmail.com',
  whatsapp: '01157563840',
  whatsappIntl: '201157563840',
  currency: 'ج.م',
  shippingCost: 60,
  deliveryDays: '3–5 أيام',
  paymentMethod: 'الدفع عند الاستلام (COD)',
  year: new Date().getFullYear(),
  // استبدل هذا الرابط برابط Google Apps Script الخاص بك
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbxCyaysYLZv3II3A6N3p73N-EmS5yKtGOidEKcTnPtsoIe0mtg0jyv8M8v0fS0FUWKPSw/exec',
  basePath: (function () {
    const path = window.location.pathname;
    if (path.includes('/ecoway-men-products')) {
      return '/ecoway-men-products/';
    }
    return './';
  })()
};

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
  { id: 'home', name: 'منظفات وعناية منزلية', icon: '🏠' },
  { id: 'packages', name: 'باكدجات', icon: '🎁' }
];
