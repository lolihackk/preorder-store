// Shipping price reference data.
// `home` = Home Delivery price, `stopdesk` = Stop Desk price, in DA (Algerian Dinar).
// A price of 0 means that delivery type is not available for that wilaya.

const WILAYAS = [
  { name: "Adrar", home: 1400, stopdesk: 970 },
  { name: "Chlef", home: 800, stopdesk: 520 },
  { name: "Laghouat", home: 950, stopdesk: 620 },
  { name: "Oum El Bouaghi", home: 750, stopdesk: 520 },
  { name: "Batna", home: 800, stopdesk: 520 },
  { name: "Bejaia", home: 750, stopdesk: 520 },
  { name: "Biskra", home: 950, stopdesk: 620 },
  { name: "Bechar", home: 1100, stopdesk: 720 },
  { name: "Blida", home: 750, stopdesk: 520 },
  { name: "Bouira", home: 750, stopdesk: 520 },
  { name: "Tamanrasset", home: 1600, stopdesk: 1120 },
  { name: "Tebessa", home: 850, stopdesk: 520 },
  { name: "Tlemcen", home: 900, stopdesk: 570 },
  { name: "Tiaret", home: 800, stopdesk: 520 },
  { name: "Tizi Ouzou", home: 750, stopdesk: 520 },
  { name: "Alger", home: 600, stopdesk: 470 },
  { name: "Djelfa", home: 950, stopdesk: 620 },
  { name: "Jijel", home: 750, stopdesk: 520 },
  { name: "Saida", home: 800, stopdesk: 570 },
  { name: "Skikda", home: 750, stopdesk: 520 },
  { name: "Sidi Bel Abbes", home: 800, stopdesk: 520 },
  { name: "Annaba", home: 800, stopdesk: 520 },
  { name: "Guelma", home: 750, stopdesk: 520 },
  { name: "Constantine", home: 750, stopdesk: 520 },
  { name: "Medea", home: 800, stopdesk: 520 },
  { name: "Mostaganem", home: 800, stopdesk: 520 },
  { name: "MSila", home: 850, stopdesk: 570 },
  { name: "Mascara", home: 800, stopdesk: 520 },
  { name: "Ouargla", home: 950, stopdesk: 670 },
  { name: "Oran", home: 750, stopdesk: 520 },
  { name: "El Bayadh", home: 1100, stopdesk: 670 },
  { name: "Bordj Bou Arreridj", home: 600, stopdesk: 520 },
  { name: "Boumerdes", home: 750, stopdesk: 520 },
  { name: "El Tarf", home: 800, stopdesk: 520 },
  { name: "Tissemsilt", home: 800, stopdesk: 520 },
  { name: "El Oued", home: 950, stopdesk: 670 },
  { name: "Khenchela", home: 800, stopdesk: 520 },
  { name: "Souk Ahras", home: 750, stopdesk: 520 },
  { name: "Tipaza", home: 750, stopdesk: 520 },
  { name: "Mila", home: 700, stopdesk: 520 },
  { name: "Ain Defla", home: 750, stopdesk: 520 },
  { name: "Naama", home: 1100, stopdesk: 670 },
  { name: "Ain Temouchent", home: 800, stopdesk: 520 },
  { name: "Ghardaia", home: 950, stopdesk: 620 },
  { name: "Relizane", home: 800, stopdesk: 520 },
  { name: "Timimoun", home: 1400, stopdesk: 970 },
  { name: "Ouled Djellal", home: 900, stopdesk: 520 },
  { name: "Beni Abbes", home: 1200, stopdesk: 970 },
  { name: "In Salah", home: 1600, stopdesk: 1120 },
  { name: "In Guezzam", home: 1600, stopdesk: 0 },
  { name: "Touggourt", home: 950, stopdesk: 670 },
  { name: "El Meghaier", home: 950, stopdesk: 0 },
  { name: "El Menia", home: 1000, stopdesk: 670 },
  // Setif is priced locally, per-commune, flat rate (see SETIF_PRICING below).
  { name: "Setif", home: 500, stopdesk: 370, isLocal: true },
];

const SETIF_PRICING = { home: 500, stopdesk: 370 };

const SETIF_COMMUNES = [
  "Djemila", "Beidha Bordj", "Ain Lahdjar", "Guenzet", "Rosfa", "El Eulma",
  "Salah Bey", "Bouandas", "Bousselam", "Harbil", "Bellaa", "Ain Abessa",
  "Beni Ourtilane", "Ain-Legradj", "Bir Haddada", "Tizi N'bechar", "Ouled Sabor",
  "Beni Chebana", "Serdj-El-Ghoul", "Boutaleb", "El Ouricia", "Ain El Kebira",
  "Ain Oulmene", "Draa-Kebila", "Kasr El Abtal", "Ain Arnat", "Dehamcha", "Taya",
  "Hamma", "Guidjel", "Beni Fouda", "Guellal", "Ain-Sebt", "Ain-Roua", "Maaouia",
  "Ait-Tizi", "Tala-Ifacene", "Tachouda", "Bazer-Sakra", "Hammam Guergour",
  "Beni-Mouhli", "Beni-Aziz", "Ouled Si Ahmed", "Guelta Zerka", "Ouled Tebben",
  "Tella", "Hamam Soukhna", "Oued El Bared", "Ait Naoual Mezada", "Ain Azel",
  "Setif", "Babor", "Maouaklane", "Ouled Addouane", "El-Ouldja", "Amoucha",
  "Beni Oussine", "Bir-El-Arch", "Bougaa", "Mezloug",
];

function findWilaya(name) {
  if (!name) return null;
  const normalized = String(name).trim().toLowerCase();
  return (
    WILAYAS.find((w) => w.name.toLowerCase() === normalized) || null
  );
}

/**
 * Calculate the shipping cost for a given wilaya + delivery type (+ commune, only
 * meaningful for Setif). Returns { available, cost, error }.
 */
function calculateShipping({ wilaya, deliveryType, commune }) {
  const type = deliveryType === "stopdesk" ? "stopdesk" : "home";
  const w = findWilaya(wilaya);

  if (!w) {
    return { available: false, cost: null, error: "Unknown wilaya." };
  }

  if (w.isLocal) {
    // Setif: flat rate regardless of commune, but commune must be one of the known list.
    if (commune && !SETIF_COMMUNES.some((c) => c.toLowerCase() === String(commune).trim().toLowerCase())) {
      return { available: false, cost: null, error: "Unknown commune for Setif." };
    }
    const cost = SETIF_PRICING[type];
    return { available: cost > 0, cost, error: null };
  }

  const cost = w[type];
  if (!cost || cost <= 0) {
    return { available: false, cost: null, error: `${type === "stopdesk" ? "Stop Desk" : "Home Delivery"} is not available for ${w.name}.` };
  }
  return { available: true, cost, error: null };
}

module.exports = { WILAYAS, SETIF_COMMUNES, SETIF_PRICING, findWilaya, calculateShipping };
