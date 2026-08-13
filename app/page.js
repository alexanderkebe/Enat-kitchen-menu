"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./menu.css";

const sections = [
  ["Breakfast", "Start the day, the Enat way.", [
    ["Enat Special Breakfast", "Pancake, omelet, toast, beef steak & tomato", 1000], ["Chechebsa", "Pita bread, oil & hot pepper", 300], ["Special Chechebsa", "Pita bread, local butter, egg & hot pepper", 400], ["Cheese Omelet", "Egg, cheese, tomato, onion & chili", 500], ["Special Omelet", "Egg, beef, cheese, tomato, onion & chili", 550], ["Spinach Omelet", "Egg, potato, onion & olive oil", 480], ["Plain Omelet", "Egg, butter & black pepper", 300], ["Omelet with Vegetables", "Egg, tomato, carrot, zucchini & cabbage", 350], ["Egg with Meat", "Ground beef, egg, onion, chili, garlic & berbere", 450], ["Egg Sandwich", "Egg, bread, mayonnaise, tomato, onion & chili", 400], ["French Toast", "Cinnamon, vanilla & butter; served with syrup or honey", 450], ["Pancake", "Vanilla pancake; served with syrup or honey", 350], ["Pancake with Fruit", "Vanilla pancake, sliced fruit, syrup or honey", 450], ["Egg Scramble", "Egg, tomato, onion & chili", 300], ["Avocado Toast", "Bread, avocado & black pepper", 410], ["Oatmeal", "Milk & oats", 410], ["Fried Egg", "Egg, butter or olive oil & black pepper", 410], ["Boiled Egg", "Egg boiled in water", 300]
  ]],
  ["Chicken", "Comforting plates, served with rice or vegetables.", [["Chicken Breast", "Grilled chicken breast", null], ["Chicken Shish Kebab", "Chicken, tomato, chili & onion", null], ["Chicken Cutlet", "Breaded chicken cutlet", null], ["Chicken Goulash", "Chicken, tomato sauce, tomato, onion & chili", null], ["Chicken Sizzler", "Chicken, carrot, zucchini, cabbage, onion & chili", null], ["Chicken Prosciutto", "Chicken, tomato, onion & chili", null]]],
  ["Fish", "Fresh, simple and satisfying.", [["Fish Combo", "Fish cutlet, fish goulash, fried fish, salad & rice", null], ["Fish Cutlet", "Served with rice or vegetables", null], ["Fish Goulash", "Fish, tomato sauce, onion, tomato & chili", null]]],
  ["Beef", "Hearty favorites from the grill.", [["Beef Sizzler", "Beef, onion, tomato & chili", null], ["Beef Shish Kebab", "Beef, onion, tomato & chili; served with rice or vegetables", null], ["Pepper Steak", "Beef and brown sauce; served with rice or vegetables", null]]],
  ["Burgers", "Juicy favorites, made to satisfy.", [["Special Burger", "Beef, egg, mayonnaise, cheese, tomato & lettuce; served with fries", 850], ["Cheese Burger", "Chicken, tomato, onion, chili, lettuce & mayonnaise; served with fries", 600], ["Beef Burger", "Beef, mayonnaise, lettuce, onion & chili; served with fries", 500], ["French Fries", "Golden and crisp", 300]]],
  ["Sandwiches", "Freshly made favorites.", [["Club Sandwich", "Beef, chicken, tuna, mayonnaise, lettuce, tomato, onion & chili", null], ["Chicken Sandwich", "Chicken, mayonnaise, lettuce, onion, tomato & chili", null], ["Tuna Sandwich", "Tuna, tomato sauce, onion, tomato, chili & ketchup", null], ["Vegetable Sandwich", "Carrot, zucchini, cabbage, onion & chili", null]]],
  ["Pizza", "Stone-baked favorites, made with love.", [["Special Pizza", "Beef, chicken, olives, oregano, egg & mozzarella", 850], ["Beef Pizza", "Tomato sauce, cheese, beef, olives & oregano", 750], ["Chicken Pizza", "Chicken, mozzarella, olives & oregano", 770], ["Fasting Tuna Pizza", "Tomato sauce, tuna, chili, onion, olives & oregano", 650], ["Margherita Pizza", "Tomato sauce, cheese, olives & oregano", 700], ["Tuna Pizza", "Tomato sauce, cheese, tuna, olives & oregano", 750], ["Vegetable Pizza", "Mixed vegetables, tomato sauce, olives & oregano", 550]]],
  ["Soups", "A warm bowl, made from scratch.", [["Chicken Cream Soup", "Chicken in a white cream sauce", 700], ["Minestrone Soup", "Zucchini, carrot, cabbage & pasta", 600], ["Vegetable Soup", "Carrot, zucchini & cabbage", 500]]],
  ["Salads", "Crisp, colorful and freshly dressed.", [["Chicken Salad", "Chicken, mayonnaise, tomato, onion, chili & dressing", 850], ["Tuna Salad", "Tuna, lettuce, tomato, onion, chili & dressing", 750], ["Special Salad", "Beef, tuna, chicken, onion, chili, tomato & dressing", 950], ["Avocado Salad", "Avocado, lettuce, tomato, onion, chili & dressing", 600], ["Mixed Salad", "Lettuce, tomato, onion, chili & dressing", 500]]],
  ["Pasta & Rice", "Familiar favorites for any appetite.", [["Spaghetti Bolognese", "Meat sauce", null], ["Spaghetti with Tuna", "Tomato sauce & tuna", null], ["Vegetable Spaghetti", "Mixed vegetables", null], ["Spaghetti with Tomato Sauce", "Classic tomato sauce", null], ["Rice with Chicken", "", null], ["Rice with Tuna", "", null], ["Rice with Meat Sauce", "", null], ["Rice with Vegetables", "", null]]],
  ["Wraps & Shawarma", "Rolled, toasted and ready to enjoy.", [["Avocado Wrap", "", null], ["Avocado & Egg Wrap", "", null], ["Vegetable Wrap", "", null], ["Beef Wrap", "", null], ["Chicken Wrap", "", null], ["Tuna Wrap", "", null], ["Beef Shawarma", "", null], ["Chicken Shawarma", "", null], ["Tuna Shawarma", "", null]]],
  ["Ethiopian Corner", "የእናት ጣዕም · The taste of home.", [["በየአይነት", "Fasting", 350], ["ተጋቢኖ", "Fasting", 350], ["ሽሮ ፈሰስ", "Fasting", 300], ["የፆም ፍርፍር", "Fasting", 300], ["ሱፍ ፍትፍት", "Fasting", 300], ["ግማሽ ግማሽ / Half Half", "Fasting", 350], ["Chikina Tibs / ጭቅና ጥብስ", "Non-fasting", null], ["Lamb Tibs / የበግ ጥብስ", "Non-fasting", null], ["Kunta Firfir / ቋንጣ ፍርፍር", "Red or mild", null], ["Special Firfir / ስፔሻል ፍርፍር", "", null], ["Tibs Firfir / ጥብስ ፍርፍር", "Red or mild", null], ["Bozena Shiro / ቦዘና ሽሮ", "", null]]],
  ["Juices & Shakes", "Blended fresh and served cold.", [["Chocolate Milkshake", "", 350], ["Strawberry Milkshake", "", 450], ["Vanilla Milkshake", "", 350], ["Avocado Milkshake", "", 350], ["Mango Milkshake", "", 350], ["Avocado Juice", "", 300], ["Mango Juice", "", 350], ["Cocktail Juice", "", 350], ["Papaya Juice", "", 300], ["Strawberry Juice", "", 410], ["Watermelon Juice", "", 350]]],
  ["Hot Beverages", "Slow down and stay awhile.", [["Café Latte", "", 130], ["Cappuccino", "", 130], ["Coffee", "", 100], ["Coffee & Tea Espresso", "", 100], ["Double Espresso", "", 130], ["Double Fasting Macchiato", "", 150], ["Double Macchiato", "", 130], ["Espresso", "", 100], ["Fasting Latte", "", 150], ["Fasting Macchiato", "", 130], ["Ginger Tea", "", 100], ["Macchiato", "", 100], ["Milk", "", 130]]],
  ["Cold Beverages", "Chilled and refreshing.", [["Water ½ litre", "", 50], ["Water 1 litre", "", 70], ["Water 2 litres", "", 90], ["Soft Drink", "", 60], ["Beer", "", 130], ["Heineken Beer", "", 150], ["Alcohol-free Flavored Drink", "", 130]]]
];

const sectionImages = {
  Breakfast: ["/enat/breakfast%201.png", "/enat/breakfast%202.png"],
  Chicken: ["/enat/chicken%201.png", "/enat/chicken%202.png"],
  Fish: ["/enat/fish%201.png", "/enat/fish%202.png"],
  Beef: ["/enat/beef%201.png", "/enat/beef%202.png"],
};

export default function MenuPage() {
  const pageRef = useRef(null);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      pageRef.current?.style.setProperty("--hero-shift", `${Math.min(scrollY * 0.18, 120)}px`);
      pageRef.current?.style.setProperty("--copy-shift", `${Math.min(scrollY * 0.1, 70)}px`);
      pageRef.current?.style.setProperty("--hero-turn", `${Math.min(scrollY * 0.035, 24)}deg`);
      pageRef.current?.querySelectorAll(".menu-section").forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - rect.top) / window.innerHeight));
        section.style.setProperty("--section-shift", `${progress * 28}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }), { threshold: 0.08 });
    pageRef.current?.querySelectorAll(".menu-section").forEach((section) => observer.observe(section));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, query]);
  const shown = useMemo(() => sections.filter(([title,,items]) => (active === "All" || title === active) && (!query || title.toLowerCase().includes(query.toLowerCase()) || items.some(i => (i[0]+" "+i[1]).toLowerCase().includes(query.toLowerCase())))).map(s => [s[0], s[1], query ? s[2].filter(i => (i[0]+" "+i[1]).toLowerCase().includes(query.toLowerCase())) : s[2]]).filter(s => s[2].length), [active, query]);
  return <main className="menu-page" ref={pageRef}>
    <header className="hero">
      <nav><a className="brand" href="#top"><span className="plate">◯</span><span>Enat Kitchen</span></a><a href="#menu">Explore menu</a></nav>
      <div className="hero-copy" id="top"><p className="eyebrow">Welcome to our table</p><h1>Food that feels<br/><em>like home.</em></h1><p className="intro">Ethiopian soul, café favorites and generous plates—prepared with care, from our kitchen to your table.</p><a className="cta" href="#menu">View the menu <span>↓</span></a></div>
      <p className="scroll">Addis Ababa · Ethiopia</p>
      <div className="hero-food" aria-hidden="true"><span className="hero-orbit"/><img src="/enat/hero%20asset.png" alt="" /></div>
    </header>
    <section className="menu-shell" id="menu">
      <div className="menu-intro"><p className="eyebrow">Made with love</p><h2>Our Menu</h2><p>Choose a category or search for a favorite.</p></div>
      <div className="tools"><div className="tabs" role="tablist"><button className={active==="All"?"active":""} onClick={()=>setActive("All")}>All</button>{sections.map(s=><button key={s[0]} className={active===s[0]?"active":""} onClick={()=>setActive(s[0])}>{s[0]}</button>)}</div><label className="search"><span>⌕</span><input aria-label="Search menu" placeholder="Search the menu" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
      <div className="sections">{shown.map(([title,subtitle,items], index)=><article className={`menu-section ${sectionImages[title] ? "has-food-art" : ""}`} key={title}>{sectionImages[title]&&<div className="section-food-art" aria-hidden="true">{sectionImages[title].map((src,i)=><img key={src} className={`food-art-${i+1}`} src={src} alt="" loading="lazy" />)}</div>}<div className="section-heading"><span>{String(index+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{subtitle}</p></div></div><div className="items">{items.map(([name,description,price])=><div className="item" key={name}><div className="item-top"><h4>{name}</h4><span className="dots"/><strong>{price ? `${price} Br` : "Price at counter"}</strong></div>{description&&<p>{description}</p>}</div>)}</div></article>)}</div>
      {!shown.length&&<p className="empty">No menu item found. Try another search.</p>}
      <p className="note">Prices are listed in Ethiopian birr. Items without a price in the supplied menu are marked “Price at counter.” Please ask our team about availability and allergens.</p>
    </section>
    <footer><div><p className="brand footer-brand"><span className="plate">◯</span><span>Enat Kitchen</span></p><h2>Come hungry.<br/><em>Leave happy.</em></h2></div><a href="#top">Back to top ↑</a></footer>
  </main>
}
