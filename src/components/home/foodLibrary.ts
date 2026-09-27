/**
 * The dishes shown in the homepage's "local meal library" ticker
 * (FoodLibraryMarquee.tsx). These are the backend's own seeded catalog
 * (`database/seeders/ArabicFoodSeeder.php`), names and kcal/100 g as
 * stored — real product data, not marketing placeholders, which is the
 * whole point of showing them. Kept as a TS constant rather than in the
 * message files because they are catalog rows, not UI copy: both names
 * are shown regardless of locale.
 */
export type FoodEntry = { ar: string; en: string; kcal: number };

export const FOOD_LIBRARY: FoodEntry[] = [
  { ar: "كبسة دجاج", en: "Chicken Kabsa", kcal: 165 },
  { ar: "مجدرة", en: "Mujaddara", kcal: 150 },
  { ar: "مسخن دجاج", en: "Musakhan", kcal: 210 },
  { ar: "فتة حمص", en: "Fatteh", kcal: 175 },
  { ar: "حمص بطحينة", en: "Hummus", kcal: 166 },
  { ar: "متبل باذنجان", en: "Baba Ghanoush", kcal: 130 },
  { ar: "تبولة", en: "Tabbouleh", kcal: 90 },
  { ar: "فتوش", en: "Fattoush", kcal: 70 },
  { ar: "ورق عنب بزيت الزيتون", en: "Stuffed Grape Leaves", kcal: 150 },
  { ar: "شاورما دجاج", en: "Chicken Shawarma", kcal: 220 },
  { ar: "فلافل", en: "Falafel", kcal: 333 },
  { ar: "ملوخية بدجاج", en: "Molokhia with Chicken", kcal: 90 },
  { ar: "مقلوبة دجاج", en: "Maqluba", kcal: 170 },
  { ar: "منسف", en: "Mansaf", kcal: 200 },
  { ar: "شيش طاووق", en: "Shish Tawook", kcal: 165 },
  { ar: "كفتة مشوية", en: "Grilled Kofta", kcal: 250 },
  { ar: "سمك مشوي", en: "Grilled Fish", kcal: 140 },
  { ar: "سبانخ بزيت الزيتون", en: "Spinach with Olive Oil", kcal: 80 },
  { ar: "شوربة عدس", en: "Lentil Soup", kcal: 95 },
  { ar: "فول مدمس", en: "Ful Medames", kcal: 110 },
  { ar: "لبنة", en: "Labneh", kcal: 130 },
  { ar: "مناقيش زعتر", en: "Zaatar Manakish", kcal: 300 },
  { ar: "خبز حبوب كاملة", en: "Whole Wheat Bread", kcal: 247 },
  { ar: "شكشوكة", en: "Shakshuka", kcal: 100 },
  { ar: "مسبحة حمص", en: "Musabaha", kcal: 160 },
  { ar: "يخنة بامية", en: "Okra Stew", kcal: 90 },
  { ar: "برغل بالبندورة", en: "Bulgur with Tomato", kcal: 130 },
  { ar: "كشري مصري", en: "Koshari", kcal: 150 },
  { ar: "سليق دجاج", en: "Saleeg", kcal: 140 },
  { ar: "جريش", en: "Jareesh", kcal: 110 },
  { ar: "ثريد", en: "Thareed", kcal: 130 },
  { ar: "برياني لحم", en: "Beef Biryani", kcal: 180 },
  { ar: "كبة مقلية", en: "Fried Kibbeh", kcal: 280 },
  { ar: "مسقعة باذنجان", en: "Moussaka", kcal: 120 },
  { ar: "فاصولياء خضراء بزيت الزيتون", en: "Green Beans with Olive Oil", kcal: 75 },
  { ar: "لوبيا بالزيت", en: "White Bean Stew", kcal: 110 },
  { ar: "بيض مسلوق", en: "Boiled Egg", kcal: 155 },
  { ar: "جبنة عكاوي", en: "Akkawi Cheese", kcal: 260 },
  { ar: "زعتر وزيت", en: "Zaatar with Olive Oil", kcal: 350 },
  { ar: "متبلة كوسا", en: "Zucchini Mutabbal", kcal: 60 },
  { ar: "يخنة فاصولياء حمراء", en: "Kidney Bean Stew", kcal: 120 },
  { ar: "طعمية مصرية", en: "Taameya", kcal: 330 },
  { ar: "بامية باللحم", en: "Okra with Meat", kcal: 130 },
  { ar: "أم علي", en: "Om Ali", kcal: 250 },
  { ar: "مهلبية", en: "Muhallabia", kcal: 120 },
  { ar: "تمر", en: "Dates", kcal: 277 },
  { ar: "زبادي", en: "Plain Yogurt", kcal: 61 },
  { ar: "أرز بسمتي مطبوخ", en: "Basmati Rice", kcal: 121 },
];
