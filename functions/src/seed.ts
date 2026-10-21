import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'yoyo-c46c3',
  });
}

const db = admin.firestore();

export const CATEGORIES = [
  { id: 'cat-cakes', name: 'Cakes', slug: 'cakes', description: 'Artisanal handcrafted cakes baked with pure dairy and premium chocolate.' },
  { id: 'cat-tiramisu', name: 'Tiramisu & Desserts', slug: 'tiramisu-desserts', description: 'Classic Italian style tiramisu and silky smooth chocolate mousse.' },
  { id: 'cat-brownies', name: 'Brownies', slug: 'brownies', description: 'Fudgy, rich, and decadent brownies in a variety of artisanal flavors.' },
  { id: 'cat-tea-cakes', name: 'Tea Cakes & Pies', slug: 'tea-cakes-pies', description: 'Traditional tea cakes and rich, buttery cookie pies.' },
  { id: 'cat-mini-jars', name: 'Mini Jar Cakes', slug: 'mini-jar-cakes', description: 'Pocket-sized happiness! Layered cakes served in cute reusable jars.' },
];

export const PRODUCTS = [
  { id: 'cake-001', name: 'Dream Cake', price: 150, category: 'Cakes', categorySlug: 'cakes', description: 'Decadent 5-layer chocolate cake with molten core, crispy disc, and silky chocolate mousse.', inStock: true, stockQuantity: 25, featured: true, bestseller: true },
  { id: 'cake-002', name: 'Matilda Cake', price: 200, category: 'Cakes', categorySlug: 'cakes', description: 'Extra rich, fudgy multi-layered chocolate fudge cake inspired by the classic movie recipe.', inStock: true, stockQuantity: 20, featured: true, bestseller: true },
  { id: 'cake-003', name: 'Oreo Cake', price: 200, category: 'Cakes', categorySlug: 'cakes', description: 'Creamy Oreo infused sponge layered with cookies-and-cream frosting and crushed Oreos.', inStock: true, stockQuantity: 18, featured: false, bestseller: false },
  { id: 'cake-004', name: 'Crunch Cake', price: 250, category: 'Cakes', categorySlug: 'cakes', description: 'Moist chocolate sponge layered with roasted hazelnut butter-crunch and milk chocolate praline.', inStock: true, stockQuantity: 15, featured: false, bestseller: true },
  { id: 'cake-005', name: 'Puddle Cake', price: 199, category: 'Cakes', categorySlug: 'cakes', description: 'Molten chocolate puddle centered cake that flows luxuriously with warm Belgian chocolate ganache.', inStock: true, stockQuantity: 20, featured: true, bestseller: false },
  { id: 'cake-006', name: 'Japanese Cotton Cheese Cake with Triple Chocolate', price: 160, category: 'Cakes', categorySlug: 'cakes', description: 'Ultra-fluffy soufflé-style Japanese cotton cheesecake enrobed in dark, milk, and white chocolate swirls.', inStock: true, stockQuantity: 12, featured: true, bestseller: true },
  { id: 'tira-001', name: 'Classic Tiramisu', price: 250, category: 'Tiramisu & Desserts', categorySlug: 'tiramisu-desserts', description: 'Espresso-soaked savoiardi ladyfingers layered with sweet whipped mascarpone cream and Dutch cocoa.', inStock: true, stockQuantity: 20, featured: true, bestseller: true },
  { id: 'tira-002', name: 'Chocolate Tiramisu', price: 300, category: 'Tiramisu & Desserts', categorySlug: 'tiramisu-desserts', description: 'Italian coffee dessert infused with dark chocolate ganache and chocolate shavings.', inStock: true, stockQuantity: 15, featured: false, bestseller: false },
  { id: 'tira-003', name: 'Triple Chocolate Mousse', price: 99, category: 'Tiramisu & Desserts', categorySlug: 'tiramisu-desserts', description: 'Velvety trio of dark chocolate, milk chocolate, and white chocolate whipped cream mousse.', inStock: true, stockQuantity: 30, featured: false, bestseller: true },
  { id: 'brw-001', name: 'Brownie', price: 50, category: 'Brownies', categorySlug: 'brownies', description: 'Classic fudgy chocolate brownie with a shiny crinkly top and rich gooey center.', inStock: true, stockQuantity: 50, featured: false, bestseller: true },
  { id: 'brw-002', name: 'Nuts Brownie', price: 90, category: 'Brownies', categorySlug: 'brownies', description: 'Gooey chocolate brownie studded with roasted walnuts, cashews, and almonds.', inStock: true, stockQuantity: 35, featured: false, bestseller: false },
  { id: 'brw-003', name: 'Brownie Bites with Dark Chocolate Dip', price: 100, category: 'Brownies', categorySlug: 'brownies', description: 'Bite-sized fudge brownie cubes served with a decadent warm Belgian dark chocolate dipping sauce.', inStock: true, stockQuantity: 25, featured: true, bestseller: true },
  { id: 'brw-004', name: 'Lava Brownie', price: 100, category: 'Brownies', categorySlug: 'brownies', description: 'Warm fudge brownie with an oozing liquid chocolate ganache eruption center.', inStock: true, stockQuantity: 25, featured: false, bestseller: true },
  { id: 'brw-005', name: 'Triple Chocolate Brownie', price: 150, category: 'Brownies', categorySlug: 'brownies', description: 'Loaded with chunks of pure white chocolate, milk chocolate, and 70% dark Belgian chocolate.', inStock: true, stockQuantity: 20, featured: true, bestseller: false },
  { id: 'brw-006', name: 'Nutella Brownie', price: 180, category: 'Brownies', categorySlug: 'brownies', description: 'Dense chocolate brownie swirled generously with hazelnut Nutella spread.', inStock: true, stockQuantity: 20, featured: true, bestseller: true },
  { id: 'brw-007', name: 'Pista Brownie', price: 180, category: 'Brownies', categorySlug: 'brownies', description: 'Artisanal brownie infused with roasted Iranian pistachio paste and chopped pistachios.', inStock: true, stockQuantity: 15, featured: false, bestseller: false },
  { id: 'brw-008', name: 'Biscoff Brownie', price: 80, category: 'Brownies', categorySlug: 'brownies', description: 'Topped with Lotus Biscoff spread and crushed spiced caramelized biscuits.', inStock: true, stockQuantity: 30, featured: true, bestseller: true },
  { id: 'brw-009', name: 'Gunaffa Brownie', price: 100, category: 'Brownies', categorySlug: 'brownies', description: 'Middle-Eastern fusion dessert combining crisp buttery kataifi pastry with rich fudgy chocolate brownie.', inStock: true, stockQuantity: 20, featured: true, bestseller: false },
  { id: 'brw-010', name: 'Assorted Brownie', price: 199, category: 'Brownies', categorySlug: 'brownies', description: 'Sampler box featuring 4 distinct mini brownie flavors (Classic, Nutella, Biscoff, Nuts).', inStock: true, stockQuantity: 20, featured: false, bestseller: true },
  { id: 'tea-001', name: 'Plain Tea Cake', price: 100, category: 'Tea Cakes & Pies', categorySlug: 'tea-cakes-pies', description: 'Golden butter sponge cake with a delicate crumb, flavored with natural Madagascar vanilla beans.', inStock: true, stockQuantity: 25, featured: false, bestseller: false },
  { id: 'tea-002', name: 'Marble Tea Cake', price: 120, category: 'Tea Cakes & Pies', categorySlug: 'tea-cakes-pies', description: 'Two-tone swirl of rich dark chocolate sponge and aromatic vanilla butter cake.', inStock: true, stockQuantity: 20, featured: false, bestseller: false },
  { id: 'tea-003', name: 'Cookie Pie', price: 150, category: 'Tea Cakes & Pies', categorySlug: 'tea-cakes-pies', description: 'Deep-dish chocolate chip cookie baked in a buttery pie crust filled with molten hazelnut chocolate.', inStock: true, stockQuantity: 18, featured: true, bestseller: true },
  { id: 'jar-001', name: 'Black Forest', price: 50, category: 'Mini Jar Cakes', categorySlug: 'mini-jar-cakes', description: 'Layers of moist chocolate sponge, whipped vanilla cream, dark cherry compote, and chocolate curls in a jar.', inStock: true, stockQuantity: 40, featured: false, bestseller: true },
  { id: 'jar-002', name: 'Black Current', price: 50, category: 'Mini Jar Cakes', categorySlug: 'mini-jar-cakes', description: 'Vanilla sponge layered with tangy wild blackcurrant crush and sweet whipped frosting in a jar.', inStock: true, stockQuantity: 30, featured: false, bestseller: false },
  { id: 'jar-003', name: 'Butterscotch', price: 50, category: 'Mini Jar Cakes', categorySlug: 'mini-jar-cakes', description: 'Layered vanilla sponge with crunchy caramelized butterscotch praline and golden butterscotch cream.', inStock: true, stockQuantity: 35, featured: false, bestseller: true },
  { id: 'jar-004', name: 'Strawberry', price: 50, category: 'Mini Jar Cakes', categorySlug: 'mini-jar-cakes', description: 'Refreshing strawberry fruit compote layered with light-as-air vanilla sponge and whipped cream.', inStock: true, stockQuantity: 30, featured: false, bestseller: false },
  { id: 'jar-005', name: 'Mango', price: 50, category: 'Mini Jar Cakes', categorySlug: 'mini-jar-cakes', description: 'Luscious Alphonso mango pulp layered with moist sponge and mango-infused mousse.', inStock: true, stockQuantity: 35, featured: false, bestseller: true },
];

export async function seed(): Promise<void> {
  console.log('Connecting to Cloud Firestore (Project: yoyo-c46c3)...');
  const batch = db.batch();

  // 1. Categories
  for (const cat of CATEGORIES) {
    batch.set(
      db.collection('categories').doc(cat.id),
      {
        ...cat,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  // 2. Products with integer paise
  for (const prod of PRODUCTS) {
    batch.set(
      db.collection('products').doc(prod.id),
      {
        ...prod,
        pricePaise: prod.price * 100,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  // 3. Coupons
  batch.set(
    db.collection('coupons').doc('coupon-yoyo10'),
    {
      id: 'coupon-yoyo10',
      code: 'YOYO10',
      discountPercentage: 10,
      minOrderAmount: 200,
      active: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();
  console.log(`Successfully seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products with integer paise, and coupon YOYO10!`);
}

if (process.argv[1]?.endsWith('seed.js') || process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .then(() => {
      console.log('Database seed finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database seed error:', err);
      process.exit(1);
    });
}
