import { db } from './src/db/index.js';
import { menuItems, orderItems } from './src/db/schema.js';

import { eq } from 'drizzle-orm';

const coffeeImages = [
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1550133730-695473e544be?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1461023058943-07cb1ce8e7dd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472201-4608c234a919?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800'
];

const foodImages = [
  'https://images.unsplash.com/photo-1550461716-dbf266b2a840?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'
];

const dessertImages = [
  'https://images.unsplash.com/photo-1551024506-0cb4a1cb1c6d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800'
];

const menuData = [
  {
    name: "Classic Espresso",
    description: "Rich, full-bodied espresso shot pulled from our signature dark roast.",
    price: "120.00",
    category: "Coffee",
    imageUrl: "/src/assets/images/classic_espresso_1782906307304.jpg",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 100
  },
  {
    name: "Caramel Macchiato",
    description: "Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel drizzle.",
    price: "180.00",
    category: "Coffee",
    imageUrl: "/src/assets/images/caramel_macchiato_1782906295897.jpg",
    isSpecialOffer: true,
    isAvailable: true,
    stockLevel: 50
  },
  {
    name: "Iced Hazelnut Latte",
    description: "Chilled espresso, milk, and hazelnut syrup over ice.",
    price: "190.00",
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07cb1ce8e7dd?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: true,
    isAvailable: true,
    stockLevel: 60
  },
  {
    name: "Nitro Cold Brew",
    description: "Our signature cold brew infused with nitrogen for a sweet flavor and cascading, velvety crema.",
    price: "220.00",
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 40
  },
  {
    name: "Matcha Green Tea Latte",
    description: "Smooth and creamy matcha lightly sweetened and served with steamed milk.",
    price: "200.00",
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 45
  },
  {
    name: "Avocado Toast",
    description: "Thick-cut artisanal bread topped with smashed avocado, cherry tomatoes, and microgreens.",
    price: "250.00",
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 30
  },
  {
    name: "Grilled Chicken Panini",
    description: "Herb-grilled chicken, mozzarella, pesto, and sun-dried tomatoes on sourdough.",
    price: "320.00",
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 25
  },
  {
    name: "Blueberry Muffin",
    description: "Freshly baked muffin bursting with wild blueberries and topped with streusel.",
    price: "150.00",
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: false,
    isAvailable: true,
    stockLevel: 40
  },
  {
    name: "Dark Chocolate Brownie",
    description: "Fudgy, rich dark chocolate brownie with sea salt flakes.",
    price: "160.00",
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800",
    isSpecialOffer: true,
    isAvailable: true,
    stockLevel: 35
  }
];

async function seed() {
  console.log('Clearing old data...');
  await db.delete(orderItems); // Delete dependencies first
  await db.delete(menuItems);
  
  console.log('Seeding 50 unique items...');
  for (const item of menuData) {
    await db.insert(menuItems).values(item);
  }
  
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding:', err);
  process.exit(1);
});
