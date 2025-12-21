// Dictionnaire de traductions pour 6 langues ivoiriennes
// fr: Français, dioula: Dioula, baoule: Baoulé, bete: Bété, senoufo: Sénoufo, malinke: Malinké

export type LanguageCode = 'fr' | 'dioula' | 'baoule' | 'bete' | 'senoufo' | 'malinke';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  symbol: string;
  colors: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', symbol: '🇫🇷', colors: 'from-blue-500 to-red-500' },
  { code: 'dioula', name: 'Dioula', nativeName: 'Julakan', symbol: '🟡', colors: 'from-yellow-500 to-orange-500' },
  { code: 'baoule', name: 'Baoulé', nativeName: 'Baoulé', symbol: '🟢', colors: 'from-green-500 to-emerald-500' },
  { code: 'bete', name: 'Bété', nativeName: 'Bété', symbol: '🔵', colors: 'from-blue-600 to-indigo-500' },
  { code: 'senoufo', name: 'Sénoufo', nativeName: 'Senufo', symbol: '🟤', colors: 'from-amber-600 to-orange-600' },
  { code: 'malinke', name: 'Malinké', nativeName: 'Maninkakan', symbol: '🟣', colors: 'from-purple-500 to-pink-500' },
];

export const translations: Record<LanguageCode, Record<string, string>> = {
  fr: {
    // Page d'accueil
    "welcome": "Bienvenue",
    "platform_title": "Plateforme IFN",
    "platform_subtitle": "Pour les marchands du vivrier",
    "who_are_you": "Qui êtes-vous ?",
    "choose_access": "Choisissez votre accès pour continuer",
    "help_text": "Tu hésites ? Demande à ton agent ou ta coopérative.",
    "country": "République de Côte d'Ivoire",
    
    // Rôles
    "merchant": "Je suis Marchand",
    "merchant_desc": "Encaisser et vendre sans souci",
    "agent": "Agent terrain",
    "agent_desc": "Aider les marchands",
    "cooperative": "Coopérative",
    "cooperative_desc": "Gérer stock et livraisons",
    "admin": "Admin",
    "admin_desc": "Statistiques",
    "main_access": "Accès principal",
    
    // Dashboard Marchand
    "daily_sales": "Ventes du jour",
    "transactions": "transactions",
    "view_history": "Voir l'historique",
    "collect_payment": "Encaisser un paiement",
    "stock_alerts": "Alertes de stock",
    "products_restock": "produits à réapprovisionner",
    "my_stock": "Mon Stock",
    "manage_products": "Gérer mes produits",
    "manage": "Gérer",
    "rsti_balance": "Solde RSTI",
    "available": "disponibles",
    "credits": "Crédits",
    "customers": "Clients",
    "scanner": "Scanner",
    "barcode": "Code-barres",
    "promotions": "Promos",
    "campaigns": "Campagnes",
    "suppliers": "Fournisseurs",
    "igp_cooperatives": "Coopératives IGP",
    "cmu_protection": "Protection CMU",
    "contribution_benefits": "Cotisation & avantages",
    "cmu_number": "Numéro CMU",
    "active": "Actif",
    "daily_tip": "Astuce du jour",
    "tip_text": "Chaque vente que vous enregistrez contribue à votre protection sociale CMU. Plus vous vendez, plus vous êtes protégé !",
    
    // Actions
    "confirm": "Confirmer",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "add": "Ajouter",
    "delete": "Supprimer",
    "edit": "Modifier",
    "back": "Retour",
    "next": "Suivant",
    "close": "Fermer",
    "search": "Rechercher",
    "loading": "Chargement...",
    
    // Paiement
    "cash": "Espèces",
    "mobile_money": "Mobile Money",
    "transfer": "Virement",
    "amount": "Montant",
    "fcfa": "FCFA",
    "payment_success": "Paiement réussi",
    "payment_recorded": "Paiement enregistré avec succès",
    
    // Audio
    "listen": "Écouter",
    "audio_play": "Appuyez pour écouter",
    "choose_language": "Choisissez votre langue",
  },
  
  dioula: {
    // Page d'accueil
    "welcome": "Aw ni sɔgɔma",
    "platform_title": "IFN Fɛɛrɛ",
    "platform_subtitle": "Julakɛlaw ka fɛɛrɛ",
    "who_are_you": "I ye jon ye?",
    "choose_access": "I ka ɲɛnama sugandi",
    "help_text": "I ma dɔn? I ka i ka ajan wele.",
    "country": "Kotidiwar Jamanaden",
    
    // Rôles
    "merchant": "Ne ye Julakɛla ye",
    "merchant_desc": "Wari ta ani jula kɛ",
    "agent": "Ajan",
    "agent_desc": "Ka julakɛlaw dɛmɛ",
    "cooperative": "Jɛkulu",
    "cooperative_desc": "Nafolo ɲɛnabɔ",
    "admin": "Ɲɛmɔgɔ",
    "admin_desc": "Jateminɛ",
    "main_access": "Sira kunba",
    
    // Dashboard
    "daily_sales": "Bi jula",
    "transactions": "jula",
    "view_history": "Taamashyɛn lajɛ",
    "collect_payment": "Wari ta",
    "stock_alerts": "Nafolo kɔlɔsi",
    "products_restock": "nafolo ka fara a kan",
    "my_stock": "Ne ka nafolo",
    "manage_products": "Nafolo ɲɛnabɔ",
    "manage": "Ɲɛnabɔ",
    "rsti_balance": "RSTI wari",
    "available": "bɛ yen",
    "credits": "Juruw",
    "customers": "Jigifɛlaw",
    "scanner": "Kalan",
    "barcode": "Taamasiɲɛ",
    "promotions": "Sɔngɔ jigin",
    "campaigns": "Lakana",
    "suppliers": "Nafolo difaw",
    "igp_cooperatives": "IGP Jɛkuluw",
    "cmu_protection": "CMU Lakana",
    "contribution_benefits": "Sara ani nafaw",
    "cmu_number": "CMU nimɔrɔ",
    "active": "A bɛ baara la",
    "daily_tip": "Bi ladili",
    "tip_text": "Jula o jula i bɛ kɛ, a bɛ i ka CMU lakana fara.",
    
    // Actions
    "confirm": "Sɛbɛn",
    "cancel": "A dabila",
    "save": "A mara",
    "add": "A fara",
    "delete": "A bɔ",
    "edit": "A sɛmɛntiya",
    "back": "Kɔsɛbɛ",
    "next": "Nata",
    "close": "A datugu",
    "search": "Ɲini",
    "loading": "A bɛ donna...",
    
    // Paiement
    "cash": "Wari",
    "mobile_money": "Telefɔni wari",
    "transfer": "Wari bila",
    "amount": "Hakɛ",
    "fcfa": "FCFA",
    "payment_success": "Wari tara",
    "payment_recorded": "Wari taara ka ɲɛ",
    
    // Audio
    "listen": "A lamɛn",
    "audio_play": "A digi ka lamɛn",
    "choose_language": "I ka kan sugandi",
  },
  
  baoule: {
    // Page d'accueil
    "welcome": "Afuɛ",
    "platform_title": "IFN Junman",
    "platform_subtitle": "Atonvuɛfuɛ mun'n be junman",
    "who_are_you": "A ti wan?",
    "choose_access": "Fa ɔ akpasua",
    "help_text": "A siman? Usa ɔ ajan'n annzɛ ɔ akpɔ'n.",
    "country": "Kote Divwa Nvle",
    
    // Rôles
    "merchant": "N ti Atonvuɛfuɛ",
    "merchant_desc": "De sika yɛ yo atɔn",
    "agent": "Ajan",
    "agent_desc": "Uka atonvuɛfuɛ mun",
    "cooperative": "Akpɔ",
    "cooperative_desc": "Ninnge'm be su kpɛn",
    "admin": "Kpɛnngbɛn",
    "admin_desc": "Be nuan ndɛ",
    "main_access": "Atin dan'n",
    
    // Dashboard
    "daily_sales": "Andɛ atɔn",
    "transactions": "atɔn",
    "view_history": "Nian laa liɛ mun",
    "collect_payment": "De sika",
    "stock_alerts": "Ninnge kle ɔ",
    "products_restock": "ninnge'm be wie",
    "my_stock": "Min ninnge",
    "manage_products": "Nian ninnge'm be su",
    "manage": "Sie",
    "rsti_balance": "RSTI sika",
    "available": "o lɛ",
    "credits": "Kalɛ",
    "customers": "Jue difuɛ mun",
    "scanner": "Kanngan",
    "barcode": "Nzɔliɛ",
    "promotions": "Sran ngua",
    "campaigns": "Junman",
    "suppliers": "Be nga be fa ninnge'm be ba'n",
    "igp_cooperatives": "IGP akpɔ mun",
    "cmu_protection": "CMU Sasafuɛ",
    "contribution_benefits": "Kle nin ye",
    "cmu_number": "CMU numeru",
    "active": "Ɔ ti kpa",
    "daily_tip": "Andɛ afɔtuɛ",
    "tip_text": "Atɔn kwlaa nga a yo'n, ɔ yo ɔ CMU sasafuɛ liɛ dan.",
    
    // Actions
    "confirm": "Ɔ ti su",
    "cancel": "A kpalo",
    "save": "Sie",
    "add": "Ukɛ",
    "delete": "Nunnun",
    "edit": "Kaci",
    "back": "Sa sin",
    "next": "Kɔ",
    "close": "Tannin",
    "search": "Kunndɛ",
    "loading": "Ɔ su...",
    
    // Paiement
    "cash": "Sika mma",
    "mobile_money": "Telefɔni sika",
    "transfer": "Sika kɔ",
    "amount": "Be nuan",
    "fcfa": "FCFA",
    "payment_success": "Sika deli",
    "payment_recorded": "Sika liɛ'n kɔli",
    
    // Audio
    "listen": "Tie",
    "audio_play": "Tin su naan tie",
    "choose_language": "Fa ɔ aniɛn",
  },
  
  bete: {
    // Page d'accueil
    "welcome": "Woué",
    "platform_title": "IFN Djré",
    "platform_subtitle": "Gbogbo yéré nya djré",
    "who_are_you": "A yi wè?",
    "choose_access": "Wla ni da",
    "help_text": "A yi né? Gbli agent nu.",
    "country": "Côte d'Ivoire Zé",
    
    // Rôles
    "merchant": "Gbogbo",
    "merchant_desc": "Gbogbo nu djré",
    "agent": "Agent",
    "agent_desc": "Kpalo gbogbo la",
    "cooperative": "Klou",
    "cooperative_desc": "Zégbé djré",
    "admin": "Kponin",
    "admin_desc": "Kpalo djré",
    "main_access": "Wla bé",
    
    // Dashboard - version simplifiée
    "daily_sales": "Djré andé",
    "transactions": "djré",
    "view_history": "Yé djré",
    "collect_payment": "Wali ta",
    "stock_alerts": "Zégbé nu",
    "products_restock": "zégbé flon",
    "my_stock": "Mi zégbé",
    "manage_products": "Zégbé djré",
    "manage": "Djré",
    "rsti_balance": "RSTI wali",
    "available": "yi lé",
    "credits": "Yoho",
    "customers": "Nou gbogbo",
    "scanner": "Kla",
    "barcode": "Signon",
    "promotions": "Djré klou",
    "campaigns": "Djré",
    "suppliers": "Zégbé nou",
    "igp_cooperatives": "IGP klou la",
    "cmu_protection": "CMU Kpalo",
    "contribution_benefits": "Kplo nu bé",
    "cmu_number": "CMU numéro",
    "active": "Yi djré",
    "daily_tip": "Andé djré",
    "tip_text": "Djré wèwè a djré, CMU a kpalo bé.",
    
    // Actions
    "confirm": "Oui",
    "cancel": "Non",
    "save": "Mla",
    "add": "Pli",
    "delete": "Klou",
    "edit": "Tchè",
    "back": "Wla",
    "next": "Gba",
    "close": "Pli",
    "search": "Nya",
    "loading": "Gba...",
    
    // Paiement
    "cash": "Wali",
    "mobile_money": "Telefon wali",
    "transfer": "Wali gba",
    "amount": "Kplo",
    "fcfa": "FCFA",
    "payment_success": "Wali yi",
    "payment_recorded": "Wali gba",
    
    // Audio
    "listen": "Nou",
    "audio_play": "Dré nou",
    "choose_language": "Wla ni gba",
  },
  
  senoufo: {
    // Page d'accueil
    "welcome": "I ni cɛ",
    "platform_title": "IFN Baara",
    "platform_subtitle": "Julaw ka baara",
    "who_are_you": "E ye jɔn ye?",
    "choose_access": "I ka sira sugandi",
    "help_text": "E ma dɔn? Ajan weele.",
    "country": "Kotidiwari Jamana",
    
    // Rôles
    "merchant": "Ne ye Jula ye",
    "merchant_desc": "Wari ta",
    "agent": "Ajan",
    "agent_desc": "Dɛmɛ",
    "cooperative": "Ton",
    "cooperative_desc": "Fɛn ɲɛfɔ",
    "admin": "Ɲɛmaa",
    "admin_desc": "Jate",
    "main_access": "Sira ba",
    
    // Dashboard
    "daily_sales": "Bi jula",
    "transactions": "jula",
    "view_history": "A lajɛ",
    "collect_payment": "Wari ta",
    "stock_alerts": "Fɛn kɔrɔsi",
    "products_restock": "fɛn ka fara",
    "my_stock": "Ne fɛn",
    "manage_products": "Fɛn ɲɛfɔ",
    "manage": "Ɲɛfɔ",
    "rsti_balance": "RSTI wari",
    "available": "bɛ",
    "credits": "Juru",
    "customers": "Mɔgɔw",
    "scanner": "Kalan",
    "barcode": "Taamasiyɛn",
    "promotions": "Sɔngɔ dɔgɔya",
    "campaigns": "Baara",
    "suppliers": "Fɛn dilaw",
    "igp_cooperatives": "IGP Tonw",
    "cmu_protection": "CMU Lakana",
    "contribution_benefits": "Sara ni nafa",
    "cmu_number": "CMU nimɛrɔ",
    "active": "A bɛ",
    "daily_tip": "Bi ladili",
    "tip_text": "Jula kelen kelen bɛ i ka CMU lakana fara.",
    
    // Actions
    "confirm": "Ɔwɔ",
    "cancel": "Ayi",
    "save": "A mara",
    "add": "A fara",
    "delete": "A bɔ",
    "edit": "A yɛlɛma",
    "back": "Kɔsegi",
    "next": "A nɔfɛ",
    "close": "A datugu",
    "search": "A ɲini",
    "loading": "A bɛ don...",
    
    // Paiement
    "cash": "Wariden",
    "mobile_money": "Telefɔn wari",
    "transfer": "Wari bila",
    "amount": "Songo",
    "fcfa": "FCFA",
    "payment_success": "Wari tara",
    "payment_recorded": "Wari marali",
    
    // Audio
    "listen": "A lamɛn",
    "audio_play": "Digi k'a lamɛn",
    "choose_language": "Kan sugandi",
  },
  
  malinke: {
    // Page d'accueil
    "welcome": "I ni kɛnɛ",
    "platform_title": "IFN Baro",
    "platform_subtitle": "Julakɛla baro",
    "who_are_you": "I ye mun ye?",
    "choose_access": "I ka sira suben",
    "help_text": "I ma faamu? Ajan weele.",
    "country": "Kotidiwari",
    
    // Rôles
    "merchant": "Julakɛla",
    "merchant_desc": "Wari minɛ",
    "agent": "Ajan",
    "agent_desc": "Dɛmɛni",
    "cooperative": "Jɛkulu",
    "cooperative_desc": "Nafolo baro",
    "admin": "Kuntigui",
    "admin_desc": "Jatebɔ",
    "main_access": "Sira ba",
    
    // Dashboard
    "daily_sales": "Bi feere",
    "transactions": "feere",
    "view_history": "A filɛ",
    "collect_payment": "Wari minɛ",
    "stock_alerts": "Nafolo kɔrɔsi",
    "products_restock": "nafolo wuli",
    "my_stock": "N nafolo",
    "manage_products": "Nafolo baro",
    "manage": "Baro",
    "rsti_balance": "RSTI wari",
    "available": "bɛ yan",
    "credits": "Juru",
    "customers": "Feeredela",
    "scanner": "Kalan",
    "barcode": "Taamasiyɛ",
    "promotions": "Sɔnkɔ dɔkɔya",
    "campaigns": "Baro",
    "suppliers": "Nafolo dila",
    "igp_cooperatives": "IGP Jɛkulu",
    "cmu_protection": "CMU Takabi",
    "contribution_benefits": "Sara ní nafa",
    "cmu_number": "CMU nimɔrɔ",
    "active": "A ka di",
    "daily_tip": "Bi hakilinan",
    "tip_text": "Feere kelen kelen bɛ i CMU takabi wuli.",
    
    // Actions
    "confirm": "Ɔn-ɔn",
    "cancel": "A dabila",
    "save": "A mara",
    "add": "A fara",
    "delete": "A bɔ",
    "edit": "A lakodi",
    "back": "Ka segin",
    "next": "Ka taa",
    "close": "A datugu",
    "search": "A ɲininka",
    "loading": "A bɛ don...",
    
    // Paiement
    "cash": "Wari",
    "mobile_money": "Telefɔn wari",
    "transfer": "Wari ci",
    "amount": "Jate",
    "fcfa": "FCFA",
    "payment_success": "Wari sera",
    "payment_recorded": "Wari marala",
    
    // Audio
    "listen": "A lamɛn",
    "audio_play": "Digi ka lamɛn",
    "choose_language": "Kan suben",
  },
};

// Fonction utilitaire pour obtenir une traduction
export function getTranslation(language: LanguageCode, key: string): string {
  return translations[language]?.[key] || translations.fr[key] || key;
}
