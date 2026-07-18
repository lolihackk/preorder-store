// Real commune lists for wilayas where we have official data. Any wilaya not
// listed here (or with an empty array) falls back to a free-text commune
// field in the UI — the customer can always type their own commune.
// This is independent from shipping prices (see shippingData.js).

const COMMUNES_BY_WILAYA = {
  Adrar: [
    "Adrar", "Bouda", "Ouled Ahmed Timmi", "Fenoughil", "Zaouiat Kounta",
    "Reggane", "Sali", "Tsabit", "Tamest", "Tamantit", "Tit",
    "Akabli", "Aoulef", "In Zghmir", "Sebaa", "Timekten",
  ],
  Chlef: [
    "Chlef", "Tenes", "Benairia", "El Karimia", "Ouled Fares", "Boukadir",
    "Beni Haoua", "Sobha", "Zeboudja", "Talassa", "El Marsa", "Oued Fodda",
    "Ain Merane", "Taougrit", "Sendjas", "Herenfa", "Sidi Akkacha",
    "Ouled Ben Abdelkader", "Beni Rached", "Dahra", "Abou El Hassane",
    "Harchoun", "Oued Goussine", "Sidi Abderrahmane", "Bouzeghaia",
    "Moussadek", "Chettia", "El Hadjadj", "Tadjena", "Oum Drou",
  ],
  Laghouat: [
    "Laghouat", "Aflou", "Ksar El Hirane", "Hassi R'mel", "Ain Madhi",
    "Gueltat Sidi Saad", "El Ghicha", "Brida", "El Assafia", "Sidi Makhlouf",
    "Oued Morra", "Tadjrouna", "Sebgag", "Sidi Bouzid", "Hassi Delaa",
    "Kheneg", "El Haouaita", "Benacer Benchohra", "Taouiala", "El Beidha",
    "Hadj Mechri", "Ain Sidi Ali", "Oued M'zi", "Tadjemout",
  ],
  "Oum El Bouaghi": [
    "Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Fekroun", "Ain Kercha",
    "Sigus", "Souk Naamane", "Ain Babouche", "Ain Zitoun", "Berriche",
    "Bir Chouhada", "Dhalaa", "El Amiria", "El Belala", "El Djazia",
    "El Fedjoudj Boughrara Saoudi", "F'kirina", "Fkirina", "Hanchir Toumghani",
    "El Harmilia", "Ksar Sbahi", "Meskiana", "Behir Chergui", "Ouled Gacem",
    "Ouled Hamla", "Ouled Zouai", "Oued Nini", "Rahia", "Zorg",
  ],
  Batna: [
    "Batna", "Arris", "Barika", "Merouana", "N'gaous", "Seriana", "Tazoult",
    "Ain Touta", "Ain Djasser", "Ain Yagout", "Bitam", "Boumagueur",
    "Boumia", "Bouzina", "Chemora", "Djezzar", "Djerma", "El Madher",
    "Fesdis", "Foum Toub", "Ghassira", "Gosbat", "Guigba", "Ichemoul",
    "Inoughissen", "Kimmel", "Ksar Bellezma", "Larbaa", "Lemcene", "Maafa",
    "Menaa", "Ouled Ammar", "Ouled Aouf", "Ouled Fadel", "Ouled Sellem",
    "Ouled Si Slimane", "Ouyoun El Assafir", "Rahbat", "Ras El Aioun",
    "Seggana", "Sefiane", "Talkhamt", "Taxlent", "Teniet El Abed",
    "Tighanimine", "Tigharghar", "Tilatou", "Timgad", "T'kout",
    "Zanet El Beida", "Chir", "Oued Chaaba", "Oued El Ma", "Oued Taga",
    "Beni Foudhala El Hakania", "Azil Abedelkader",
  ],
  Béjaïa: [
    "Bejaia", "Akbou", "Amizour", "Aokas", "Adekar", "Barbacha", "Chemini",
    "Darguina", "El Kseur", "Ighil Ali", "Kherrata", "Ouzellaguen",
    "Seddouk", "Sidi Aich", "Souk El Tenine", "Tazmalt", "Tichy",
    "Timezrit", "Toudja", "Ait R'zine", "Ait Smail", "Beni Djellil",
    "Beni K'sila", "Beni Maouche", "Beni Mellikeche", "Boudjellil",
    "Bouhamza", "Chellata", "Fenaia Il Maten", "Feraoun", "Ighram",
    "Kendira", "Leflaye", "M'cisna", "Melbou", "Ouled Yaich",
    "Oued Ghir", "Smaoun", "Souk Oufella", "Tala Hamza", "Tamokra",
    "Tamridjet", "Taourit Ighil", "Taskriout", "Tibane", "Tinebdar",
    "Tizi N'berber", "Sidi Ayad", "Dra El Caid",
  ],
  Biskra: [
    "Biskra", "Sidi Okba", "Tolga", "El Kantara", "El Outaya", "El Ghrous",
    "Djemorah", "Foughala", "Zeribet El Oued", "Ourlal", "Mechouneche",
    "Ain Naga", "Ain Zaatout", "Bordj Ben Azzouz", "Branis", "Chetma",
    "El Hadjab", "El Haouch", "Khenguet Sidi Nadji", "Lioua", "Meziraa",
    "M'lili", "Oumache", "Bouchakroun", "Lichana",
  ],
  Béchar: [
    "Bechar", "Abadla", "Beni Ounif", "Kenadsa", "Taghit", "Tabelbala",
    "Lahmar", "Erg Ferradj", "Machraa Houari Boumediene", "Meridja",
    "Mogheul", "Boukais",
  ],
  Blida: [
    "Blida", "Boufarik", "Larbaa", "El Affroun", "Mouzaia", "Bougara",
    "Meftah", "Ouled Yaich", "Oued El Alleug", "Chebli", "Bouinan",
    "Ain Romana", "Beni Mered", "Beni Tamou", "Benkhelil", "Chiffa",
    "Chrea", "Djebabra", "Guerrouaou", "Hammam Elouane", "Ouled Slama",
    "Soumaa", "Souhane", "Oued Djer",
  ],
  Bouira: [
    "Bouira", "Sour El Ghozlane", "Lakhdaria", "Ain Bessem", "El Hachimia",
    "Kadiria", "M'chedallah", "Bechloul", "Bir Ghbalou", "Haizer",
    "Ahl El Ksar", "Aomar", "Ath Mansour", "Boukram", "Bouderbala",
    "Chorfa", "Dechmia", "Dirah", "El Adjiba", "El Asnam", "El Hakimia",
    "El Khabouzia", "El Mokrani", "Guerrouma", "Hadjera Zerga", "Hanif",
    "Maala", "Mezdour", "Raouraoua", "Ridane", "Saharidj", "Souk El Khemis",
    "Taghzout", "Taguedite", "Z'barbar",
  ],
  Tamanrasset: [
    "Tamanrasset", "Ain Amguel", "Abalessa", "In Ghar", "In Salah",
    "In Amguel", "Idles", "Silet", "Tazrouk", "Foggaret Ezzaouia", "Ain Amguel",
  ],
  Tébessa: [
    "Tebessa", "Bir El Ater", "Cheria", "El Aouinet", "El Kouif", "El Ogla",
    "El Malabiod", "Ferkane", "Morsott", "Negrine", "Ouenza", "Bekkaria",
    "Bedjene", "Bir Dheheb", "Bir Mokadem", "Boukhadra", "Boulhaf Dyr",
    "El Meridj", "El Ogla El Malha", "Guorriguer", "Hammamet", "Oum Ali",
    "Saf Saf El Ouesra", "Stah Guentis", "Telidjen", "Ain Zerga",
  ],
  Tlemcen: [
    "Tlemcen", "Chetouane", "Mansourah", "Hennaya", "Maghnia", "Ghazaouet",
    "Nedroma", "Remchi", "Sebdou", "Bensekrane", "Ain Youcef", "Ain Fezza",
    "Ain Ghoraba", "Ain Kebira", "Ain Nehala", "Ain Tellout", "Ain Fetah",
    "Amieur", "Azail", "Bab El Assa", "Beni Boussaid", "Beni Khellad",
    "Beni Mester", "Beni Ouarsous", "Beni Snous", "Dar Yaghmoracen",
    "Djebala", "El Aricha", "El Fehoul", "El Gor", "Fellaoucene",
    "Honnaine", "Marsa Ben M'hidi", "M'sirda Fouaga", "Ouled Mimoun",
    "Ouled Riyah", "Oued Lakhdar", "Sabra", "Sebbaa Chioukh",
    "Sidi Abdelli", "Sidi Djillali", "Sidi Medjahed", "Souahlia",
    "Souani", "Souk Tleta", "Terny Beni Hediel", "Tianet",
  ],
  Tiaret: [
    "Tiaret", "Frenda", "Ksar Chellala", "Sougueur", "Mahdia", "Medroussa",
    "Meghila", "Rahouia", "Ain Deheb", "Ain Kermes", "Ain Bouchekif",
    "Bougara", "Dahmouni", "Djebilet Rosfa", "Faidja", "Guertoufa",
    "Hamadia", "Madna", "Mechraa Sfa", "Medrissa", "Mellakou", "Naima",
    "Nadorah", "Oued Lili", "Rechaiga", "Sebaine", "Sebt", "Serghine",
    "Si Abdelghani", "Sidi Abderrahmane", "Sidi Ali Mellal", "Sidi Bakhti",
    "Sidi Hosni", "Tagdempt", "Takhemaret", "Tidda", "Tousnina",
    "Zmalet El Emir Abdelkader", "Chehaima", "Djillali Ben Amar",
  ],
  "Tizi Ouzou": [
    "Tizi Ouzou", "Azazga", "Azeffoun", "Ain El Hammam", "Boghni",
    "Draa Ben Khedda", "Draa El Mizan", "Larbaa Nath Irathen",
    "Mekla", "Ouadhias", "Ouaguenoun", "Tigzirt", "Bouzeguene",
    "Beni Douala", "Ain Zaouia", "Frikat", "Freha", "Iferhounene",
    "Illoula Oumalou", "Idjeur", "Aghribs", "Akerrou", "Ait Bouaddou",
    "Ait Chafaa", "Assi Youcef", "Beni Zikki", "Bounouh", "Iflissen",
    "Mechtras", "Mizrana", "Sidi Namane", "Tizi N'tleta",
  ],
};

// Sétif is priced locally (flat rate) and already had a full commune list
// supplied directly by the store owner — kept in shippingData.js.

function getCommunesForWilaya(wilayaName) {
  if (!wilayaName) return [];
  return COMMUNES_BY_WILAYA[wilayaName] || [];
}

module.exports = { COMMUNES_BY_WILAYA, getCommunesForWilaya };
