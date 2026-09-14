"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Sunrise, Drumstick, Fish, Beef,
  Hamburger, UtensilsCrossed, Pizza, Soup, Salad,
  Shell, Scroll, CircleDot, Wheat, Sparkles,
  CupSoda, Coffee, IceCreamCone, Plus, ExternalLink,
} from "lucide-react";
import "./menu.css";

const isGroup = (name, price) => price == null && /\/(?:Non\s*)?Fasting$/i.test(name);

const ICON_SIZE = 18;
const categoryIcons = {
  All:                LayoutGrid,
  Breakfast:          Sunrise,
  Chicken:            Drumstick,
  Fish:               Fish,
  Beef:               Beef,
  Burgers:            Hamburger,
  Sandwiches:         UtensilsCrossed,
  Pizza:              Pizza,
  Soups:              Soup,
  Salads:             Salad,
  Spaghetti:          Shell,
  Wraps:              Scroll,
  Shawarma:           CircleDot,
  Rice:               Wheat,
  "Ethiopian Corner": Sparkles,
  "Juices & Shakes":  CupSoda,
  "Hot Beverages":    Coffee,
  "Cold Beverages":   IceCreamCone,
  Extras:             Plus,
  Takeaway:           ExternalLink,
};

function CategoryIcon({ name }) {
  const Icon = categoryIcons[name] ?? LayoutGrid;
  return <Icon size={ICON_SIZE} strokeWidth={1.6} aria-hidden="true" />;
}

export default function MenuClient({ initialSections }) {
  const [sections, setSections] = useState(initialSections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(initialSections.length === 0);
    setError(false);
    fetch("/api/menu", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Menu unavailable");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid menu");
        setSections(data);
      })
      .catch((err) => { if (err.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt, initialSections]);

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();
    return sections
      .filter(([title]) => active === "All" || title === active)
      .map(([title, subtitle, items]) => [
        title, subtitle,
        !term || title.toLowerCase().includes(term) ? items :
          items.filter(([name, description, price]) =>
            !isGroup(name, price) && (name + " " + description).toLowerCase().includes(term)),
      ])
      .map(([title, subtitle, items]) => [title, subtitle, sort === "featured" ? items : [...items].sort((a, b) => {
        if (isGroup(a[0], a[2]) || isGroup(b[0], b[2])) return 0;
        if (sort === "name") return a[0].localeCompare(b[0]);
        return (a[2] ?? Infinity) - (b[2] ?? Infinity);
      })])
      .filter((section) => section[2].length);
  }, [sections, active, query, sort]);

  return <main className="menu-page" id="top">
    <header className="hero">
      <nav aria-label="Main navigation">
        <a className="brand" href="#top"><span className="plate" aria-hidden="true">◯</span><span>Enat Kitchen</span></a>
        <a href="#menu">Explore menu ↗</a>
      </nav>
      <div className="hero-copy">
        <p className="eyebrow">Welcome to our table</p>
        <h1>Food that feels<br/><em>like home.</em></h1>
        <p className="intro">Ethiopian soul, café favorites and generous plates—prepared with care, from our kitchen to your table.</p>
        <a className="cta" href="#menu">View the menu <span aria-hidden="true">↓</span></a>
      </div>
      <div className="hero-food" aria-hidden="true">
        <span className="hero-orbit"/><img src="/enat/hero%20asset.png" alt="" width="650" height="650" fetchPriority="high"/>
      </div>
      <p className="scroll">Addis Ababa · Ethiopia</p>
    </header>
    <section className="menu-shell" id="menu" aria-labelledby="menu-title">
      <div className="menu-leaves menu-leaves-left" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="menu-leaves menu-leaves-right" aria-hidden="true"><i/><i/><i/><i/></div>
      <p className="menu-side-note menu-side-note-left" aria-hidden="true">Simple<br/>ingredients<br/>great moments</p>
      <p className="menu-side-note menu-side-note-right" aria-hidden="true">Good food<br/>happier people</p>
      <div className="menu-intro">
        <p className="eyebrow"><span/>Made with love<span/></p><h2 id="menu-title">Our Menu</h2>
        <p>Choose a category or search for a favorite.</p>
      </div>
      <div className="tools">
        <p className="browse-label">Browse by category</p>
        <div className="tabs" role="group" aria-label="Menu categories">
          {["All", ...sections.map(([title]) => title)].map((title) =>
            <button key={title} type="button" className={active === title ? "active" : ""}
              aria-pressed={active === title} onClick={() => setActive(title)}><CategoryIcon name={title} />{title}</button>)}
        </div>
        <label className="category-picker">Category
          <select aria-label="Category" value={active} onChange={(event) => setActive(event.target.value)}>
            <option value="All">All categories</option>
            {sections.map(([title]) => <option key={title} value={title}>{title}</option>)}
          </select>
        </label>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
          <input type="search" aria-label="Search menu" placeholder="Search the menu (e.g. pasta, chicken...)" value={query} onChange={(event) => setQuery(event.target.value)}/>
        </label>
        <label className="sort-control"><span aria-hidden="true">☷</span><select aria-label="Sort menu" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="price">Price: low to high</option></select></label>
      </div>
      <div className="sections" aria-busy={loading}>
        {loading ? <p className="empty" role="status">Preparing your menu…</p> :
          error && !sections.length ? <div className="empty" role="alert">The menu couldn’t load.<button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div> :
          shown.map(([title, subtitle, items]) =>
            <article className="menu-section" key={title}>
              <div className="section-heading">
                <span aria-hidden="true">{String(sections.findIndex(([name]) => name === title) + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><p>{subtitle}</p></div>
              </div>
              <div className="items">{items.map(([name, description, price]) =>
                isGroup(name, price) ? <div className="item-group" key={name}>{name}</div> :
                <div className="item" key={name}>
                  <div className="item-top"><h4>{name}</h4><strong>{price != null ? price.toLocaleString() + " Br" : "Ask our team"}</strong></div>
                  {description && <p>{description}</p>}
                </div>)}
              </div>
            </article>)}
      </div>
      {!loading && !error && !shown.length && <div className="empty" role="status">No matching dishes found.<button type="button" onClick={() => { setActive("All"); setQuery(""); }}>Show full menu</button></div>}
      <p className="note">All prices are in Ethiopian birr. Please ask our team about availability and allergens.</p>
    </section>
    <footer>
      <div><p className="brand"><span className="plate" aria-hidden="true">◯</span><span>Enat Kitchen</span></p><h2>Come hungry.<br/><em>Leave happy.</em></h2></div>
      <a href="#top">Back to top ↑</a>
    </footer>
  </main>;
}
