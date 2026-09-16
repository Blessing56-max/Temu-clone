// Generates a large, plausible product catalog on top of the hand-curated
// items in catalogSlice.js. Real photography only exists for the curated
// set — generated items fall back to their category's icon tint via
// ProductThumb, same as any hand-entered product without an `image`.

const CATEGORY_VENDORS = {
  Electronics: ['Everstock Electronics', 'CircuitWorks', 'Voltage Supply Co.', 'NexGear'],
  Fashion: ['Field & Form', 'Lagos Leather Co.', 'Thread & Co.', 'Wardrobe Studio'],
  Home: ['Kiln & Co.', 'Hearth & Home', 'Linenwood', 'The Pantry Shelf'],
  Beauty: ['Bare Botanicals', 'Glow Naturals', 'Skin Ritual Co.'],
  Sports: ['Trailhead Supply', 'Field & Form', 'Summit Gear Co.'],
}

const CATEGORY_NOUNS = {
  Electronics: ['Wireless Earbuds', 'Bluetooth Speaker', 'Power Bank', 'USB-C Cable', 'Phone Stand', 'Mechanical Keyboard', 'Webcam', 'Desk Lamp', 'Charging Dock', 'Smart Plug', 'Laptop Sleeve', 'Wireless Mouse'],
  Fashion: ['Denim Jacket', 'Cotton Tee', 'Canvas Sneakers', 'Leather Belt', 'Wool Scarf', 'Crossbody Bag', 'Ankle Boots', 'Linen Shirt', 'Bomber Jacket', 'Pleated Skirt', 'Cargo Pants', 'Knit Sweater'],
  Home: ['Ceramic Mug Set', 'Throw Blanket', 'Table Runner', 'Scented Candle', 'Wall Planter', 'Cutting Board', 'Storage Basket', 'Cushion Cover', 'Wooden Tray', 'Dinner Plate Set', 'Bath Towel Set', 'Rattan Mirror'],
  Beauty: ['Body Cream', 'Facial Serum', 'Lip Balm Set', 'Clay Mask', 'Body Scrub', 'Hair Oil', 'Bar Soap', 'Body Wash', 'Sunscreen', 'Hand Cream'],
  Sports: ['Yoga Mat', 'Water Bottle', 'Resistance Bands', 'Duffel Bag', 'Running Shorts', 'Foam Roller', 'Gym Towel', 'Jump Rope', 'Trail Backpack', 'Cap'],
}

const ADJECTIVES = ['Classic', 'Everyday', 'Premium', 'Compact', 'Essential', 'Signature', 'Modern', 'Heritage', 'Studio', 'Basics']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function generateProducts(count = 140, startId = 100) {
  const categories = Object.keys(CATEGORY_NOUNS)
  const rand = seededRandom(42) // fixed seed so the catalog is stable across reloads, not random every render
  const out = []

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    const nouns = CATEGORY_NOUNS[category]
    const vendors = CATEGORY_VENDORS[category]
    const noun = nouns[Math.floor(rand() * nouns.length)]
    const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]
    const vendor = vendors[Math.floor(rand() * vendors.length)]
    const vendorId = `v-gen-${vendors.indexOf(vendor)}-${category}`

    const basePrice = Math.round((3000 + rand() * 120000) / 500) * 500
    const hasDiscount = rand() < 0.3
    const rating = Math.round((3.8 + rand() * 1.2) * 10) / 10
    const reviewCount = Math.floor(rand() * 180)

    const keyword = noun.toLowerCase().replace(/\s+/g, ',')
    out.push({
      id: `p-gen-${startId + i}`,
      image: `https://loremflickr.com/600/600/${keyword}`,
      name: `${adj} ${noun}`,
      vendor,
      vendorId,
      price: basePrice,
    })
  }

  return out
}
