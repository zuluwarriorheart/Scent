// Ingredient guide data. Each file holds one group of notes. origins are written as [place, note] pairs and turned into objects here.
import florals from "./florals.js";
import citrusFruit from "./citrus-fruit.js";
import spiceHerb from "./spice-herb.js";
import woodResin from "./wood-resin.js";
import gourmandDrinks from "./gourmand-drinks.js";

const raw = { ...florals, ...citrusFruit, ...spiceHerb, ...woodResin, ...gourmandDrinks };
const MORE = {};
Object.keys(raw).forEach(k => {
  const g = raw[k];
  MORE[k] = { ...g, origins: (g.origins || []).map(o => (Array.isArray(o) ? { p: o[0], n: o[1] } : o)) };
});
export default MORE;
