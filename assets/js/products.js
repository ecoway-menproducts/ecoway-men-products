/**
 * بيانات المنتجات — أسماء افتراضية (سيتم استبدالها من لوحة التحكم لاحقاً)
 */
const PRODUCTS = [
  {
    id: 'perf-silver',
    name: 'عطر الرجل الفضي',
    category: 'perfumes',
    price: 450,
    compareAt: null,
    description: 'عطر رجالي فاخر بتركيبة منعشة تجمع بين نفحات الحمضيات والأخشاب. مثالي للاستخدام اليومي والمناسبات الرسمية.',
    notes: { top: 'برغموت، ليمون', middle: 'لافندر، فلفل', base: 'أرز، خشب الصندل' },
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'perf-night-king',
    name: 'عطر نايت كينج',
    category: 'perfumes',
    price: 380,
    compareAt: 450,
    description: 'عطر ليلي جريء يعكس ثقة الرجل العصري. نفحات دافئة من العنبر والمسك.',
    notes: { top: 'كارداموم، زعفران', middle: 'ورد، عنبر', base: 'مسك، فانيليا' },
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'perf-pine',
    name: 'عطر الصنوبر الكلاسيكي',
    category: 'perfumes',
    price: 520,
    compareAt: null,
    description: 'رائحة خشبية كلاسيكية مستوحاة من غابات الصنوبر. ثبات عالٍ وفوحان مميز.',
    notes: { top: 'صنوبر، إكليل الجبل', middle: 'أرز، باتشولي', base: 'جلد، عنبر رمادي' },
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'perf-body-spray',
    name: 'بخاخ الجسم الأسود',
    category: 'perfumes',
    price: 180,
    compareAt: null,
    description: 'بخاخ جسم خفيف للاستخدام اليومي. منعش ومناسب بعد الرياضة أو العمل.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'skin-shave-cream',
    name: 'كريم الحلاقة المرطب',
    category: 'skincare',
    price: 120,
    compareAt: null,
    description: 'كريم حلاقة غني بالألوفيرا يهدئ البشرة ويمنع الاحمرار. مناسب لجميع أنواع البشرة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'skin-face-gel',
    name: 'جل الوجه اليومي للرجال',
    category: 'skincare',
    price: 95,
    compareAt: 110,
    description: 'جل ترطيب خفيف سريع الامتصاص. يحمي البشرة من الجفاف طوال اليوم.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'skin-aftershave',
    name: 'لوشن ما بعد الحلاقة',
    category: 'skincare',
    price: 85,
    compareAt: null,
    description: 'لوشن مهدئ يغلق المسام ويرطب البشرة بعد الحلاقة. برائحة منعشة خفيفة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'skin-charcoal-wash',
    name: 'غسول الفحم المنشط',
    category: 'skincare',
    price: 75,
    compareAt: null,
    description: 'غسول وجه بالفحم المنشط لتنظيف عميق وإزالة الشوائب والزيوت الزائدة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'car-shampoo',
    name: 'شامبو غسيل السيارات',
    category: 'home',
    price: 85,
    compareAt: null,
    description: 'شامبو مركز لغسيل هيكل السيارة بعمق دون الإضرار بالطلاء. رغوة غنية تزيل الأتربة والدهون بسهولة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'car-freshener',
    name: 'معطر سيارة Ecoway',
    category: 'home',
    price: 75,
    compareAt: null,
    description: 'معطر سيارة برائحة منعشة تدوم طويلاً. مناسب للتعليق أو التثبيت داخل المقصورة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'car-interior-cleaner',
    name: 'منظف داخلية السيارة',
    category: 'home',
    price: 95,
    compareAt: 110,
    description: 'منظف متعدد الاستخدامات للمقاعد والتابلوه والبلاستيك الداخلي. ينظف ويعطر دون ترك بقع.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'pkg-full-care',
    name: 'باكدج العناية الشاملة',
    category: 'packages',
    price: 650,
    compareAt: 780,
    description: 'باكدج متكامل يشمل: عطر + جل وجه + لوشن ما بعد الحلاقة + بخاخ جسم. توفير 17%.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'pkg-scent-body',
    name: 'باكدج العطر والجسم',
    category: 'packages',
    price: 480,
    compareAt: 550,
    description: 'باكدج يجمع عطر نايت كينج مع بخاخ الجسم الأسود ولوشن ما بعد الحلاقة.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  },
  {
    id: 'pkg-starter',
    name: 'باكدج البداية للرجال',
    category: 'packages',
    price: 320,
    compareAt: null,
    description: 'باكدج مثالي للتجربة الأولى: غسول فحم + جل وجه + بخاخ جسم بسعر مميز.',
    inStock: true,
    image: 'assets/images/placeholder.svg',
    reviews: []
  }
];

function getProductById(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return PRODUCTS.filter(function (p) { return p.inStock; });
  return PRODUCTS.filter(function (p) { return p.category === categoryId && p.inStock; });
}

function getCategoryName(categoryId) {
  var cat = CATEGORIES.find(function (c) { return c.id === categoryId; });
  return cat ? cat.name : '';
}

function getRelatedProducts(productId, limit) {
  var product = getProductById(productId);
  if (!product) return [];
  return PRODUCTS
    .filter(function (p) { return p.id !== productId && p.inStock; })
    .sort(function (a, b) {
      if (a.category === product.category && b.category !== product.category) return -1;
      if (b.category === product.category && a.category !== product.category) return 1;
      return 0;
    })
    .slice(0, limit || 4);
}

function formatPrice(amount) {
  return amount.toLocaleString('ar-EG') + ' ' + SITE_CONFIG.currency;
}

function formatShippingCost(amount) {
  return amount === 0 ? 'مجاني' : formatPrice(amount);
}

function getDiscountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
