// Product catalog data - exact prices as specified
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categorySlug: string;
  description: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  bestseller: boolean;
  ingredients: string;
  allergens: string;
}

export const CATEGORIES = [
  { id: 'cakes', name: 'Cakes', slug: 'cakes', description: 'Delightful cakes for every occasion' },
  { id: 'tiramisu-desserts', name: 'Tiramisu & Desserts', slug: 'tiramisu-desserts', description: 'Premium Italian-inspired desserts' },
  { id: 'brownies', name: 'Brownies', slug: 'brownies', description: 'Rich, fudgy brownies in every flavor' },
  { id: 'tea-cakes-pies', name: 'Tea Cakes & Pies', slug: 'tea-cakes-pies', description: 'Perfect companions for your tea time' },
  { id: 'mini-jar-cakes', name: 'Mini Jar Cakes', slug: 'mini-jar-cakes', description: 'Adorable jar cakes for every craving' },
] as const;

export const PRODUCTS: Product[] = [
  // ===== CAKES =====
  {
    id: 'cake-001',
    name: 'Dream Cake',
    price: 150,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'A dreamy, melt-in-your-mouth cake that lives up to its name. Light, fluffy, and absolutely delightful.',
    image: '/images/products/dream-cake.jpg',
    inStock: true,
    stockQuantity: 20,
    featured: true,
    bestseller: true,
    ingredients: '5-in-1 layers: Belgian chocolate sponge, 54% dark chocolate ganache, whipped chocolate mousse, molten lava cream, crisp chocolate shell, Dutch cocoa powder.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'cake-002',
    name: 'Matilda Cake',
    price: 200,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'Inspired by the famous chocolate cake from Matilda. Rich, dense, and chocolatey perfection.',
    image: '/images/products/matilda-cake.jpg',
    inStock: true,
    stockQuantity: 15,
    featured: true,
    bestseller: true,
    ingredients: '70% Belgian dark chocolate, Dutch process cocoa, espresso infusion, double dairy cream, organic flour, brown sugar, cultured butter.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'cake-003',
    name: 'Oreo Cake',
    price: 200,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'Layers of chocolatey goodness with crushed Oreo cookies throughout. A cookies-and-cream lover\'s dream.',
    image: '/images/products/oreo-cake.jpg',
    inStock: true,
    stockQuantity: 15,
    featured: false,
    bestseller: false,
    ingredients: 'Dark chocolate sponge, crushed Oreo cookies, vanilla buttercream, dark chocolate ganache drip, dairy cream.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Soy.',
  },
  {
    id: 'cake-004',
    name: 'Crunch Cake',
    price: 250,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'A satisfying combination of smooth cake layers and crunchy elements for the perfect textural experience.',
    image: '/images/products/crunch-cake.jpg',
    inStock: true,
    stockQuantity: 10,
    featured: true,
    bestseller: false,
    ingredients: 'Moist chocolate sponge, golden honeycomb toffee crunch, caramelized hazelnut praline, salted caramel sauce, dark chocolate ganache.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Tree Nuts (Hazelnuts), Eggs.',
  },
  {
    id: 'cake-005',
    name: 'Puddle Cake',
    price: 199,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'A luscious pudding-like cake with a soft, gooey center that melts in your mouth.',
    image: '/images/products/puddle-cake.jpg',
    inStock: true,
    stockQuantity: 12,
    featured: false,
    bestseller: false,
    ingredients: 'Soft baked dark chocolate cake, molten chocolate lava fudge center, powdered sugar, pure vanilla extract.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'cake-006',
    name: 'Japanese Cotton Cheese Cake with Triple Chocolate',
    price: 160,
    category: 'Cakes',
    categorySlug: 'cakes',
    description: 'Impossibly light Japanese cotton cheesecake enriched with three types of chocolate for a unique fusion experience.',
    image: '/images/products/japanese-cotton-cheese-cake.jpg',
    inStock: true,
    stockQuantity: 8,
    featured: true,
    bestseller: true,
    ingredients: 'Cream cheese, farm-fresh eggs, fresh dairy milk, cultured butter, organic flour, dark, milk, and white chocolate drizzles.',
    allergens: 'Contains Dairy (Milk), Eggs, Gluten (Wheat).',
  },

  // ===== TIRAMISU & DESSERTS =====
  {
    id: 'tiramisu-001',
    name: 'Classic Tiramisu',
    price: 250,
    category: 'Tiramisu & Desserts',
    categorySlug: 'tiramisu-desserts',
    description: 'Traditional Italian tiramisu with espresso-soaked ladyfingers and velvety mascarpone cream.',
    image: '/images/products/classic-tiramisu.jpg',
    inStock: true,
    stockQuantity: 10,
    featured: true,
    bestseller: true,
    ingredients: 'Savoiardi ladyfingers, freshly brewed Italian espresso, mascarpone cheese, pasteurized egg yolks, raw sugar, Dutch cocoa powder.',
    allergens: 'Contains Dairy (Milk), Eggs, Gluten (Wheat).',
  },
  {
    id: 'tiramisu-002',
    name: 'Chocolate Tiramisu',
    price: 300,
    category: 'Tiramisu & Desserts',
    categorySlug: 'tiramisu-desserts',
    description: 'A chocolate lover\'s twist on the classic tiramisu with rich cocoa layers and chocolate cream.',
    image: '/images/products/chocolate-tiramisu.jpg',
    inStock: true,
    stockQuantity: 8,
    featured: true,
    bestseller: false,
    ingredients: 'Savoiardi ladyfingers, rich chocolate cream, mascarpone, espresso, dark chocolate shavings, Dutch cocoa.',
    allergens: 'Contains Dairy (Milk), Eggs, Gluten (Wheat).',
  },
  {
    id: 'tiramisu-003',
    name: 'Triple Chocolate Mousse',
    price: 99,
    category: 'Tiramisu & Desserts',
    categorySlug: 'tiramisu-desserts',
    description: 'Three layers of dark, milk, and white chocolate mousse creating an irresistible dessert experience.',
    image: '/images/products/triple-chocolate-mousse.jpg',
    inStock: true,
    stockQuantity: 20,
    featured: false,
    bestseller: true,
    ingredients: '70% dark chocolate mousse, 33% milk chocolate mousse, white chocolate mousse, dairy whipping cream, chocolate pearls.',
    allergens: 'Contains Dairy (Milk), Soy.',
  },

  // ===== BROWNIES =====
  {
    id: 'brownie-001',
    name: 'Brownie',
    price: 50,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'Our classic chocolate brownie — fudgy, rich, and perfectly baked every time.',
    image: '/images/products/brownie.jpg',
    inStock: true,
    stockQuantity: 50,
    featured: false,
    bestseller: true,
    ingredients: 'Belgian dark chocolate, Dutch cocoa powder, European dairy butter, fresh eggs, raw cane sugar, sea salt.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'brownie-002',
    name: 'Nuts Brownie',
    price: 90,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'Classic brownie loaded with crunchy roasted nuts for an extra layer of texture and flavor.',
    image: '/images/products/nuts-brownie.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: false,
    ingredients: 'Belgian chocolate brownie loaded with toasted California walnuts, roasted almonds, and cashews.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts.',
  },
  {
    id: 'brownie-003',
    name: 'Brownie Bites with Dark Chocolate Dip',
    price: 100,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'Bite-sized brownie pieces served with a luxurious dark chocolate dipping sauce.',
    image: '/images/products/brownie-bites.jpg',
    inStock: true,
    stockQuantity: 25,
    featured: false,
    bestseller: false,
    ingredients: 'Bite-sized fudgy brownie cubes served with warm 60% dark chocolate dipping ganache.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'brownie-004',
    name: 'Lava Brownie',
    price: 100,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'A warm brownie with a molten chocolate center that flows like lava when you break through the crust.',
    image: '/images/products/lava-brownie.jpg',
    inStock: true,
    stockQuantity: 20,
    featured: true,
    bestseller: true,
    ingredients: 'Rich fudgy brownie with an oozing molten dark chocolate center and crinkly crust.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'brownie-005',
    name: 'Triple Chocolate Brownie',
    price: 150,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'The ultimate chocolate indulgence — dark, milk, and white chocolate combined in one decadent brownie.',
    image: '/images/products/triple-chocolate-brownie.jpg',
    inStock: true,
    stockQuantity: 15,
    featured: true,
    bestseller: false,
    ingredients: 'Dark chocolate brownie packed with dark, milk, and white Belgian chocolate chunks.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'brownie-006',
    name: 'Nutella Brownie',
    price: 180,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'Rich brownie swirled with generous amounts of Nutella for hazelnut chocolate bliss.',
    image: '/images/products/nutella-brownie.jpg',
    inStock: true,
    stockQuantity: 15,
    featured: false,
    bestseller: true,
    ingredients: 'Fudgy chocolate brownie swirled with creamy hazelnut Nutella and toasted hazelnuts.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts (Hazelnuts).',
  },
  {
    id: 'brownie-007',
    name: 'Pista Brownie',
    price: 180,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'A fusion brownie featuring the rich flavor of pistachio blended with chocolate.',
    image: '/images/products/pista-brownie.jpg',
    inStock: true,
    stockQuantity: 12,
    featured: false,
    bestseller: false,
    ingredients: 'Dark chocolate brownie crowned with roasted Iranian pistachios and white chocolate glaze.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts (Pistachios).',
  },
  {
    id: 'brownie-008',
    name: 'Biscoff Brownie',
    price: 80,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'Chocolate brownie with the warm, caramelized flavor of Biscoff cookie butter.',
    image: '/images/products/biscoff-brownie.jpg',
    inStock: true,
    stockQuantity: 25,
    featured: false,
    bestseller: false,
    ingredients: 'Belgian brownie swirled with Lotus Biscoff spread and topped with crushed speculoos cookies.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Soy.',
  },
  {
    id: 'brownie-009',
    name: 'Gunaffa Brownie',
    price: 100,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'A uniquely flavored brownie crafted with special ingredients for a distinctive taste.',
    image: '/images/products/gunaffa-brownie.jpg',
    inStock: true,
    stockQuantity: 18,
    featured: false,
    bestseller: false,
    ingredients: 'Fusion brownie topped with crunchy golden roasted kunafa vermicelli and sweet pistachio cream.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts.',
  },
  {
    id: 'brownie-010',
    name: 'Assorted Brownie',
    price: 199,
    category: 'Brownies',
    categorySlug: 'brownies',
    description: 'A curated assortment of our finest brownie varieties — perfect for gifting or sharing.',
    image: '/images/products/assorted-brownie.jpg',
    inStock: true,
    stockQuantity: 10,
    featured: true,
    bestseller: true,
    ingredients: 'Chef\'s curated selection of 6 assorted signature brownie varieties in a luxury gift box.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts.',
  },

  // ===== TEA CAKES & PIES =====
  {
    id: 'teacake-001',
    name: 'Plain Tea Cake',
    price: 100,
    category: 'Tea Cakes & Pies',
    categorySlug: 'tea-cakes-pies',
    description: 'A simple, perfectly baked tea cake — light, buttery, and ideal with your afternoon tea.',
    image: '/images/products/plain-tea-cake.jpg',
    inStock: true,
    stockQuantity: 20,
    featured: false,
    bestseller: false,
    ingredients: 'Traditional English vanilla sponge cake with golden crust, cultured butter, and moist velvety crumb.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'teacake-002',
    name: 'Marble Tea Cake',
    price: 120,
    category: 'Tea Cakes & Pies',
    categorySlug: 'tea-cakes-pies',
    description: 'Beautiful swirls of vanilla and chocolate in a light, fluffy tea cake.',
    image: '/images/products/marble-tea-cake.jpg',
    inStock: true,
    stockQuantity: 18,
    featured: false,
    bestseller: false,
    ingredients: 'Tender vanilla and dark Dutch cocoa swirled loaf cake baked fresh daily.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'teacake-003',
    name: 'Cookie Pie',
    price: 150,
    category: 'Tea Cakes & Pies',
    categorySlug: 'tea-cakes-pies',
    description: 'A giant, gooey cookie baked in a pie dish — crispy on the edges, soft in the center.',
    image: '/images/products/cookie-pie.jpg',
    inStock: true,
    stockQuantity: 12,
    featured: true,
    bestseller: true,
    ingredients: 'Deep dish golden chocolate chip cookie pie filled with gooey molten Belgian chocolate.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },

  // ===== MINI JAR CAKES =====
  {
    id: 'jar-001',
    name: 'Black Forest',
    price: 50,
    category: 'Mini Jar Cakes',
    categorySlug: 'mini-jar-cakes',
    description: 'Classic Black Forest cake layered in an adorable mini jar — cherries, cream, and chocolate.',
    image: '/images/products/black-forest-jar.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: false,
    ingredients: 'Layers of dark chocolate sponge, vanilla whipped cream, sour cherry compote, and dark chocolate flakes.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'jar-002',
    name: 'Black Current',
    price: 50,
    category: 'Mini Jar Cakes',
    categorySlug: 'mini-jar-cakes',
    description: 'Tangy black currant flavor layered with soft cake and cream in a mini jar.',
    image: '/images/products/black-current-jar.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: false,
    ingredients: 'Vanilla sponge layered with tangy wild blackcurrant compote and whipped dairy cream.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'jar-003',
    name: 'Butterscotch',
    price: 50,
    category: 'Mini Jar Cakes',
    categorySlug: 'mini-jar-cakes',
    description: 'Sweet butterscotch cake with caramel notes, layered beautifully in a mini jar.',
    image: '/images/products/butterscotch-jar.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: true,
    ingredients: 'Golden sponge layered with butterscotch cream and crunchy caramelized praline nuts.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs, Tree Nuts.',
  },
  {
    id: 'jar-004',
    name: 'Strawberry',
    price: 50,
    category: 'Mini Jar Cakes',
    categorySlug: 'mini-jar-cakes',
    description: 'Fresh strawberry flavor layered with soft cake and cream in a charming mini jar.',
    image: '/images/products/strawberry-jar.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: false,
    ingredients: 'Fluffy sponge layered with fresh strawberry compote and light whipped cream.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
  {
    id: 'jar-005',
    name: 'Mango',
    price: 50,
    category: 'Mini Jar Cakes',
    categorySlug: 'mini-jar-cakes',
    description: 'Tropical mango-flavored cake layered with cream in a delightful mini jar.',
    image: '/images/products/mango-jar.jpg',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: false,
    ingredients: 'Vanilla sponge layered with sweet Alphonso mango puree and luscious mango cream.',
    allergens: 'Contains Gluten (Wheat), Dairy (Milk), Eggs.',
  },
];

export function getActiveCatalog(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('yoyo_custom_products_catalog');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return [...PRODUCTS];
}

export function getProductById(id: string): Product | undefined {
  const catalog = getActiveCatalog();
  return catalog.find((p) => p.id === id) || PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getActiveCatalog().filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return getActiveCatalog().filter((p) => p.featured);
}

export function getBestsellers(): Product[] {
  return getActiveCatalog().filter((p) => p.bestseller);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return getActiveCatalog().filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
  );
}

export function formatPrice(price: number): string {
  return `₹${price}`;
}
