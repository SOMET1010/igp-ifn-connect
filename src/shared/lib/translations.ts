/**
 * Traductions PNAVIM - Version Sociale
 * Ton chaleureux, ivoirien, respectueux, inclusif
 * "PNAVIM parle comme une personne du marché qui veut t'aider"
 */

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
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "Bon {period} 👋",
    welcome_subtitle: "On est {day}. Il est {hour}. Le marché est ouvert.",
    platform_title: "PNAVIM",
    platform_subtitle: "On est ensemble au marché",
    who_are_you: "On est ensemble au marché",
    market_open: "Le marché est ouvert",
    market_closed: "Le marché est fermé",
    choose_access: "Choisis ta case pour commencer",
    click_to_listen: "🔊 Écouter",
    speak: "Parler",
    listening: "J'écoute...",
    help_text: "Tu hésites ? Demande à ton agent.",
    country: "République de Côte d'Ivoire",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "Je vends ici",
    merchant_subtitle: "Encaisser l'argent des clients",
    merchant_desc: "Vendre sans souci",
    i_am_merchant: "Je vends ici",
    agent: "J'aide les vendeuses",
    agent_subtitle: "Inscrire et accompagner",
    agent_desc: "Être aux côtés des marchands",
    field_agent: "J'aide les vendeuses",
    cooperative: "Coopérative",
    cooperative_desc: "Livrer et gérer les produits",
    i_am_cooperative: "Coopérative",
    admin: "Administration",
    admin_desc: "Voir les chiffres",
    view_cooperatives: "Voir les coopératives",
    view_map: "Voir la carte",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "Accueil",
    sell: "Vendre",
    profile: "Moi",
    back: "Retour",
    next: "Suivant",
    close: "Fermer",
    today: "Aujourd'hui",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "Ma sœur, appuie sur le micro et parle doucement.",
    auth_listen: "Dis ton numéro tranquillement.",
    auth_confirm: "J'ai entendu {phone}. C'est bien ça ?",
    auth_success: "C'est bon. Tu es dedans.",
    auth_error: "Ce n'est pas grave. On recommence ensemble.",
    auth_fallback: "Tu peux aussi utiliser le clavier.",
    enter_phone: "Dis ton numéro",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "On vérifie que c'est bien toi",
    
    /* ======================
       DASHBOARD MARCHAND
    ====================== */
    dashboard_welcome: "Ma sœur, voilà ta journée.",
    dashboard_today_amount: "Aujourd'hui tu as encaissé {amount} francs.",
    dashboard_first_sale: "Première vente du jour. Courage !",
    dashboard_tip: "Chaque vente t'aide pour ta santé et ton avenir.",
    my_sales: "Mes ventes",
    sales_today: "Ventes du jour",
    open_day: "Ouvrir ma journée",
    close_day: "Fermer ma journée",
    day_opened: "Ta journée est ouverte. Tu peux encaisser.",
    day_closed: "Ta journée est fermée.",
    
    /* ======================
       CAISSE / VENTE
    ====================== */
    cashier_title: "Encaisser",
    cashier_prompt: "Tu prends combien ?",
    cashier_listening: "Parle, je t'écoute.",
    cashier_confirm: "On confirme ?",
    cashier_success: "C'est fait. L'argent est noté.",
    cashier_error: "Y'a un petit souci. Essaie encore.",
    cashier_minimum: "Il faut au moins cent francs.",
    cashier_cash: "C'est en espèces.",
    cashier_mobile: "C'est Mobile Money.",
    enter_amount: "Tu prends combien ?",
    enter_amount_instruction: "Appuie sur les billets ou dis le montant.",
    amount: "Montant",
    confirm: "Confirmer",
    cancel: "Annuler",
    validate: "Valider",
    
    /* ======================
       ARGENT / RÉSUMÉ
    ====================== */
    your_money: "Ton argent",
    your_sales_today: "Tes ventes aujourd'hui",
    view_history: "Voir ce que tu as déjà fait",
    view_receipt: "Voir le reçu",
    total: "Total",
    balance: "Solde",
    
    /* ======================
       ACTIONS UI
    ====================== */
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    items: "article(s)",
    search: "Rechercher",
    filter: "Filtrer",
    refresh: "Actualiser",
    retry: "Réessayer",
    see_more: "Voir plus",
    see_less: "Voir moins",
    offline_message: "Mode hors ligne disponible",
    what_are_you_selling: "Que vendez-vous ?",
    say_amount: "Dis le montant ou appuie sur un billet",
    how_much: "Tu prends combien ?",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "Tes marchandises",
    stock_empty: "Ton stock est vide.",
    stock_add: "Ajouter un produit",
    stock_low: "Attention, ça va bientôt finir.",
    stock_ok: "Tout est bon.",
    my_stock: "Mes marchandises",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "Ta santé et ton avenir",
    understand_intro: "Chaque vente t'aide. Regarde comment.",
    cmu_title: "Santé",
    cmu_simple: "Comme une tontine pour ta santé",
    cmu_description: "Quand tu vends, une petite partie va pour ta santé. Si tu tombes malade, c'est payé.",
    rsti_title: "Épargne",
    rsti_simple: "Un peu d'argent mis de côté pour toi",
    rsti_description: "Chaque vente met un peu de côté pour ton avenir. C'est ton argent.",
    understand_reassure: "Ton argent travaille pour toi.",
    your_protection: "Ta protection",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Pas de réseau. Mais je note quand même.",
    offline_saved: "C'est noté. On enverra après.",
    offline_synced: "Tout est parti. C'est bon.",
    no_connection: "Pas de réseau",
    connection_restored: "Le réseau est revenu",
    
    /* ======================
       AIDE & MESSAGES
    ====================== */
    need_help: "Besoin d'aide ?",
    call_agent: "Appeler ton agent",
    ask_your_agent: "Demande à ton agent",
    its_done: "C'est fait !",
    i_am_producer: "Je suis producteur",
    initiative_by: "Une initiative de",
    congratulations: "Bravo !",
    loading: "Ça charge...",
    please_wait: "Attends un peu...",
    error: "Y'a un souci",
    success: "C'est bon !",
    warning: "Attention",
    info: "Info",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "matin",
    afternoon: "après-midi",
    evening: "soir",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "Mon profil",
    my_info: "Mes infos",
    my_phone: "Mon numéro",
    my_market: "Mon marché",
    settings: "Réglages",
    language: "Langue",
    sound: "Son",
    notifications: "Notifications",
    logout: "Me déconnecter",
    logout_confirm: "Tu veux vraiment partir ?",
    logout_success: "À bientôt !",
    
    /* ======================
       AGENT TERRAIN
    ====================== */
    enrollment: "Inscription",
    enroll_merchant: "Inscrire une vendeuse",
    merchant_list: "Mes marchands",
    pending_validation: "En attente",
    validated: "Validé",
    rejected: "Refusé",
    
    /* ======================
       COOPÉRATIVE
    ====================== */
    my_orders: "Mes commandes",
    new_order: "Commander",
    delivery: "Livraison",
    products: "Produits",
    order_confirmed: "Commande notée",
    order_delivered: "C'est livré",
  },

  dioula: {
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "I ni sogoma 👋",
    welcome_subtitle: "An bɛ {day}. Sugu bɛ dayɛlɛn.",
    platform_title: "PNAVIM",
    platform_subtitle: "An bɛ ɲɔgɔn fɛ sugu la",
    who_are_you: "An bɛ ɲɔgɔn fɛ sugu la",
    market_open: "Sugu bɛ dayɛlɛn",
    market_closed: "Sugu datugura",
    choose_access: "Sugandi i ka kɛlɛ",
    click_to_listen: "🔊 Lamɛn",
    speak: "Kuma",
    listening: "N bɛ i lamɛn...",
    help_text: "I bɛ dɔɔni tɛmɛ? Fɔ i ka agent ye.",
    country: "Kɔti d'Iwɔri",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "N bɛ feere",
    merchant_subtitle: "Wari ta feerekɛlaw fɛ",
    merchant_desc: "Feere ka hɛrɛya",
    i_am_merchant: "N bɛ feere",
    agent: "N bɛ feerekɛlaw dɛmɛ",
    agent_subtitle: "Sɛbɛn ni dɛmɛ",
    agent_desc: "Kɛ walasa feere bɛ kɛ",
    field_agent: "N bɛ feerekɛlaw dɛmɛ",
    cooperative: "Kooperatif",
    cooperative_desc: "Don ni sigi feere",
    i_am_cooperative: "Kooperatif",
    admin: "Administratiɔn",
    admin_desc: "Jatew lajɛ",
    view_cooperatives: "Kooperatifw lajɛ",
    view_map: "Kart lajɛ",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "Sigi",
    sell: "Feere",
    profile: "N tan",
    back: "Kɔsegi",
    next: "Nata",
    close: "Datugu",
    today: "Bi",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "N bɛ i dɛmɛ. Digi mikro la, kuma cɛ.",
    auth_listen: "Fɔ i ka nimɔrɔ cɛ.",
    auth_confirm: "N ka a lamɛn {phone}. A ye tuma?",
    auth_success: "A ka kɛ. I bɛ kɔnɔ.",
    auth_error: "A tɛ foyi. An bɛ segin ka fɔ.",
    auth_fallback: "I bɛ se ka klavye kɛ.",
    enter_phone: "Fɔ i ka nimɔrɔ",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "An bɛ a lajɛ ko i yɛrɛ don",
    
    /* ======================
       DASHBOARD
    ====================== */
    dashboard_welcome: "N balima, i ka don filɛ.",
    dashboard_today_amount: "Bi i ye {amount} faransi sɔrɔ.",
    dashboard_first_sale: "Feere fɔlɔ. Jigi bɛ!",
    dashboard_tip: "Feere kelen kelen bɛ i dɛmɛ.",
    my_sales: "N ka feereli",
    sales_today: "Bi feereli",
    open_day: "Don dayɛlɛ",
    close_day: "Don datugu",
    day_opened: "I ka don dayɛlɛnna. I bɛ se ka wari ta.",
    day_closed: "I ka don datugura.",
    
    /* ======================
       CAISSE / VENTE
    ====================== */
    cashier_title: "Wari ta",
    cashier_prompt: "Wari joli?",
    cashier_listening: "Kuma, n bɛ i lamɛn.",
    cashier_confirm: "An bɛ a kɛ?",
    cashier_success: "A ka kɛ. Wari bɛ sɛbɛn.",
    cashier_error: "Dɔɔni tɛna. Segin ka kɛ.",
    cashier_minimum: "A ka kan ka kɛ kɛmɛ ye dɔrɔn.",
    cashier_cash: "A ye kasi ye.",
    cashier_mobile: "A ye Mobile Money ye.",
    enter_amount: "Wari joli?",
    enter_amount_instruction: "Digi biyɛw kan walima fɔ hakɛ.",
    amount: "Hakɛ",
    confirm: "Dafa",
    cancel: "Bɔ",
    validate: "Sɛbɛn",
    
    /* ======================
       ARGENT
    ====================== */
    your_money: "I ka wari",
    your_sales_today: "I ka bi feereli",
    view_history: "I ye min kɛ kɔrɔ lajɛ",
    view_receipt: "Reçu lajɛ",
    total: "Bɛɛ",
    balance: "Tɔ",
    
    /* ======================
       ACTIONS UI
    ====================== */
    add: "Fara a kan",
    edit: "Yɛlɛma",
    delete: "Bɔ",
    save: "Mara",
    items: "fɛn",
    search: "Ɲini",
    filter: "Sugandi",
    refresh: "Kura",
    retry: "Segin",
    see_more: "Lajɛ tun",
    see_less: "Lajɛ dɔɔni",
    offline_message: "A bɛ baara kɛ rɛzɔ kɔ",
    what_are_you_selling: "Mun do i bɛ feere?",
    say_amount: "Fɔ hakɛ walima digi biyɛ kan",
    how_much: "Wari joli?",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "I ka fɛn",
    stock_empty: "I ka stɔk bɛ gan.",
    stock_add: "Fɛn dɔ fara a kan",
    stock_low: "A tɛ caya. Fɛn dɔ fara a kan.",
    stock_ok: "A bɛɛ ka ɲi.",
    my_stock: "N ka fɛn",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "I ka kɛnɛya ni sini",
    understand_intro: "Feere kelen kelen bɛ i dɛmɛ.",
    cmu_title: "Kɛnɛya",
    cmu_simple: "I ko tɔntini i ka kɛnɛya kama",
    cmu_description: "Ni i ye feere kɛ, dɔɔni bɛ taa i ka kɛnɛya kama. Ni bana ye i sɔrɔ, a bɛ sara.",
    rsti_title: "Wari mara",
    rsti_simple: "Wari dɔɔni bɛ mara i ye",
    rsti_description: "Feere kelen kelen bɛ wari dɔɔni mara i ye. O ye i yɛrɛ ka wari ye.",
    understand_reassure: "I ka wari bɛ baara kɛ i ye.",
    your_protection: "I ka lakana",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Rɛzɔ tɛ. N bɛ a sɛbɛn.",
    offline_saved: "A ka sɛbɛn. An bɛ sɔrɔ kɔfɛ.",
    offline_synced: "A bɛ taa. A ka kɛ.",
    no_connection: "Rɛzɔ tɛ",
    connection_restored: "Rɛzɔ seginna",
    
    /* ======================
       AIDE & MESSAGES
    ====================== */
    need_help: "I mago bɛ dɛmɛ la?",
    call_agent: "I ka agent wele",
    ask_your_agent: "Fɔ i ka agent ye",
    its_done: "A ka kɛ!",
    i_am_producer: "N ye sèneféla ye",
    initiative_by: "Min bɔra",
    congratulations: "A ni cɛ!",
    loading: "A bɛ don...",
    please_wait: "Mako dɔɔni...",
    error: "Gɛlɛya dɔ",
    success: "A ka kɛ!",
    warning: "Kɔlɔsi",
    info: "Kunnafoni",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "sogoma",
    afternoon: "tilefɛ",
    evening: "wula",
    monday: "Tɛnɛn",
    tuesday: "Tarata",
    wednesday: "Araba",
    thursday: "Alamisa",
    friday: "Juma",
    saturday: "Sibiri",
    sunday: "Kari",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "N ka kun",
    my_info: "N ka kunnafoni",
    my_phone: "N ka nimɔrɔ",
    my_market: "N ka sugu",
    settings: "Labɛn",
    language: "Kan",
    sound: "Mankan",
    notifications: "Lasigiden",
    logout: "Bɔ",
    logout_confirm: "I bɛ taa tiɲɛn na?",
    logout_success: "Ka ben!",
    
    /* ======================
       AGENT TERRAIN
    ====================== */
    enrollment: "Sɛbɛnni",
    enroll_merchant: "Feerekɛla sɛbɛn",
    merchant_list: "N ka feerekɛlaw",
    pending_validation: "A bɛ mako la",
    validated: "A dafara",
    rejected: "A banna",
    
    /* ======================
       COOPÉRATIVE
    ====================== */
    my_orders: "N ka ciyaaruw",
    new_order: "Ciyaaru kura",
    delivery: "Jolili",
    products: "Fɛnw",
    order_confirmed: "Ciyaaru sɛbɛnna",
    order_delivered: "A jolila",
  },

  baoule: {
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "Mo aba 👋",
    welcome_subtitle: "Andɛ yɛ {day}. Gwa'n su ti kpa.",
    platform_title: "PNAVIM",
    platform_subtitle: "É ti nun gwa'n su",
    who_are_you: "É ti nun gwa'n su",
    market_open: "Gwa'n su ti kpa",
    market_closed: "Gwa'n su tannin",
    choose_access: "Fa wɔ akpasua",
    click_to_listen: "🔊 Tie",
    speak: "Kan",
    listening: "N ti'n tie...",
    help_text: "A wunman sran? Flɛ ɔ agent.",
    country: "Kɔtdivwa",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "N yo atɔ",
    merchant_subtitle: "Sika'n sɔ kliɛn'm be sa nun",
    merchant_desc: "Yo atɔ ndɛndɛ",
    i_am_merchant: "N yo atɔ",
    agent: "N uka atɔyofuɛ'm be",
    agent_subtitle: "Klɛ be nin uka be",
    agent_desc: "Jran atɔyofuɛ'm be bo",
    field_agent: "N uka atɔyofuɛ'm be",
    cooperative: "Kooperatif",
    cooperative_desc: "Fa ninnge'm be ba",
    i_am_cooperative: "Kooperatif",
    admin: "Administratiɔn",
    admin_desc: "Nian nɔmbrɛ'm be su",
    view_cooperatives: "Nian kooperatif'm be su",
    view_map: "Nian kart su",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "Awlo",
    sell: "Yo atɔ",
    profile: "Min",
    back: "Sa sin",
    next: "Kɔ",
    close: "Tannin",
    today: "Andɛ",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "Min niaan, miɛn mikro'n su, kan blɛblɛ.",
    auth_listen: "Bo ɔ nimero'n blɛblɛ.",
    auth_confirm: "N ti'n {phone}. I sɔ'n yɛ?",
    auth_success: "Ɔ ti kpa. A wo nun.",
    auth_error: "Ndɛ fi o-man. É sa i bo ɔ.",
    auth_fallback: "A kwla fa klavye'n di junman.",
    enter_phone: "Bo ɔ nimero",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "É nian sɛ ɔ bɔbɔ",
    
    /* ======================
       DASHBOARD
    ====================== */
    dashboard_welcome: "Min niaan, nian ɔ cɛn'n nga.",
    dashboard_today_amount: "Andɛ a ɲan sika {amount}.",
    dashboard_first_sale: "Atɔ klikli. Jran kekle!",
    dashboard_tip: "Atɔ kun kun bɛ ɔ uka.",
    my_sales: "Min atɔ'm",
    sales_today: "Andɛ atɔ'm",
    open_day: "Tike min cɛn",
    close_day: "Tan min cɛn",
    day_opened: "Ɔ cɛn'n tike. A kwla sika sɔ.",
    day_closed: "Ɔ cɛn'n tannin.",
    
    /* ======================
       CAISSE / VENTE
    ====================== */
    cashier_title: "Sika sɔ",
    cashier_prompt: "Sika'n ti nɲɛ?",
    cashier_listening: "Kan, n ti'n tie.",
    cashier_confirm: "É yo?",
    cashier_success: "Ɔ ti kpa. Sika'n ti klɛ.",
    cashier_error: "Sa kaan kun o. Bɔ i ekun.",
    cashier_minimum: "Saan kaan sika ya.",
    cashier_cash: "Ɔ ti sika ngbɛn.",
    cashier_mobile: "Ɔ ti Mobile Money.",
    enter_amount: "Sika'n ti nɲɛ?",
    enter_amount_instruction: "Miɛn biyɛ'm be su annzɛ bo hakɛ'n.",
    amount: "Sika",
    confirm: "Siesie",
    cancel: "Yaci",
    validate: "Klɛ",
    
    /* ======================
       ARGENT
    ====================== */
    your_money: "Ɔ sika",
    your_sales_today: "Ɔ andɛ atɔ'm",
    view_history: "Nian like nga a yo i wɔ",
    view_receipt: "Nian reçu",
    total: "I kwlaa",
    balance: "Tɔ",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "Ɔ ninnge'm",
    stock_empty: "Ɔ stɔk'n ti ngbɛn.",
    stock_add: "Fa ninnge kun fara su",
    stock_low: "Nian, a su wie.",
    stock_ok: "I kwlaa ti kpa.",
    my_stock: "Min ninnge'm",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "Ɔ juejue nin ɔ ainman",
    understand_intro: "Atɔ kun kun bɛ ɔ uka. Nian wafa.",
    cmu_title: "Juejue",
    cmu_simple: "Ɔ ti kɛ tɔntini ɔ juejue ti",
    cmu_description: "Sɛ a yo atɔ, sika kaan kun kɔ ɔ juejue ti. Sɛ tukpacɛ trɔ ɔ, bé tua.",
    rsti_title: "Sika sie",
    rsti_simple: "Sika kaan bɔ a sie ɔ ti",
    rsti_description: "Atɔ kun kun bɛ sika kaan sie ɔ ti. Ɔ bɔbɔ sika ɔ.",
    understand_reassure: "Ɔ sika'n su di junman ɔ ti.",
    your_protection: "Ɔ sasalɛ",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Rezo fi nun. Sanngɛ n klɛ i.",
    offline_saved: "Ɔ ti klɛ. É fa kɔ.",
    offline_synced: "I kwlaa kɔ. Ɔ ti kpa.",
    no_connection: "Rezo fi nun",
    connection_restored: "Rezo'n ba ekun",
    
    /* ======================
       AIDE
    ====================== */
    need_help: "A mian ukalɛ?",
    call_agent: "Flɛ ɔ agent",
    ask_your_agent: "Flɛ ɔ agent",
    its_done: "Ɔ ti kpa!",
    i_am_producer: "N ti fie sufuɛ",
    initiative_by: "Bɔbɔ",
    congratulations: "Mo aba!",
    loading: "Ɔ su ba...",
    please_wait: "Minndɛ kaan...",
    error: "Sa kun o",
    success: "Ɔ ti kpa!",
    warning: "Nian",
    info: "Ndɛ",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "nglɛmun",
    afternoon: "nnɔsua",
    evening: "afiɛn",
    monday: "Mɔnnin",
    tuesday: "Jue",
    wednesday: "Mlan",
    thursday: "Wue",
    friday: "Ya",
    saturday: "Fɔɛ",
    sunday: "Mɔnmɔn",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "Min wun",
    my_info: "Min su ndɛ",
    my_phone: "Min nimero",
    my_market: "Min gwa",
    settings: "Siesielɛ",
    language: "Anwuanman",
    sound: "Nɛn",
    notifications: "Kannganndɛ",
    logout: "Fite",
    logout_confirm: "A klo kɔlɛ sakpa?",
    logout_success: "Yaci!",
    
    /* ======================
       AGENT TERRAIN
    ====================== */
    enrollment: "Klɛlɛ",
    enroll_merchant: "Klɛ atɔyofuɛ",
    merchant_list: "Min atɔyofuɛ'm",
    pending_validation: "Ɔ su minndɛ",
    validated: "Ɔ ti kpa",
    rejected: "Bé kpali",
    
    /* ======================
       COOPÉRATIVE
    ====================== */
    my_orders: "Min ciyaaru'm",
    new_order: "Ciyaaru uflɛ",
    delivery: "Falɛ balɛ",
    products: "Ninnge'm",
    order_confirmed: "Ciyaaru'n ti klɛ",
    order_delivered: "Bé fali ba",
  },

  bete: {
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "A za gba 👋",
    welcome_subtitle: "A yɛ {day}. Zikɛ mlɛ ti.",
    platform_title: "PNAVIM",
    platform_subtitle: "A lɛ nyɛ zikɛ",
    who_are_you: "A lɛ nyɛ zikɛ",
    market_open: "Zikɛ mlɛ ti",
    market_closed: "Zikɛ nɔ ti",
    choose_access: "Kpa wɔ ya",
    click_to_listen: "🔊 Nuru",
    speak: "Gba",
    listening: "Ń nuru...",
    help_text: "A yɛ sro wɔ? Frɛ wɔ agent.",
    country: "Kɔtdivwa",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "Ń yra fɛ",
    merchant_subtitle: "Sika sɔ kliɛnw bɛ",
    merchant_desc: "Yra fɛ pɛpɛɛ",
    i_am_merchant: "Ń yra fɛ",
    agent: "Ń gba yrafuɛw",
    agent_subtitle: "Klɛ bɛ, gba bɛ",
    agent_desc: "Zra yrafuɛw gbɛ",
    field_agent: "Ń gba yrafuɛw",
    cooperative: "Kooperatif",
    cooperative_desc: "Ba fɛ, nɔ fɛ",
    i_am_cooperative: "Kooperatif",
    admin: "Administratiɔn",
    admin_desc: "Nuru nɔmbrɛw",
    view_cooperatives: "Nuru kooperatifw",
    view_map: "Nuru kart",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "Mlɛ",
    sell: "Yra",
    profile: "Mu",
    back: "Sɛ",
    next: "Glɔ",
    close: "Nɔ",
    today: "Yɛni",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "Ń niɔ, miɛn mikro, gba lɛlɛ.",
    auth_listen: "Gba wɔ nimero lɛlɛ.",
    auth_confirm: "Ń nuru {phone}. Yɛ kɔ?",
    auth_success: "A ti. Wɔ lɛ kɔnɔ.",
    auth_error: "Sro yili. A lɛ sɛ a gba.",
    auth_fallback: "Wɔ sɛ kɛ klavye.",
    enter_phone: "Gba wɔ nimero",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "A lɛ nuru ka wɔ yɛ",
    
    /* ======================
       DASHBOARD
    ====================== */
    dashboard_welcome: "Ń niɔ, na wɔ cɛ.",
    dashboard_today_amount: "Yɛni wɔ sɔ sika {amount}.",
    dashboard_first_sale: "Yra fɔlɔ. Zra kekle!",
    dashboard_tip: "Yra kɔ kɔ bɛ wɔ gba.",
    my_sales: "Ń yra",
    sales_today: "Yɛni yra",
    open_day: "Plɛ ń cɛ",
    close_day: "Nɔ ń cɛ",
    day_opened: "Wɔ cɛ plɛ ti. Wɔ sɛ sika sɔ.",
    day_closed: "Wɔ cɛ nɔ ti.",
    
    /* ======================
       CAISSE
    ====================== */
    cashier_title: "Sika sɔ",
    cashier_prompt: "Sika yɛ?",
    cashier_listening: "Gba, ń nuru.",
    cashier_confirm: "A kɔ?",
    cashier_success: "A ti. Sika klɛ.",
    cashier_error: "Sro kaan. Sɛ a gba.",
    cashier_minimum: "Saan kɛmɛ sika.",
    cashier_cash: "A yɛ kasi.",
    cashier_mobile: "A yɛ Mobile Money.",
    enter_amount: "Sika yɛ?",
    enter_amount_instruction: "Miɛn biyɛw annzɛ gba hakɛ.",
    amount: "Hakɛ",
    confirm: "Ti",
    cancel: "Nɔ",
    validate: "Klɛ",
    
    /* ======================
       ARGENT
    ====================== */
    your_money: "Wɔ sika",
    your_sales_today: "Wɔ yɛni yra",
    view_history: "Nuru fɛ wɔ kɛ",
    view_receipt: "Nuru reçu",
    total: "Bɛ lajɛ",
    balance: "Tɔ",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "Wɔ fɛ",
    stock_empty: "Wɔ stɔk ti pɛ.",
    stock_add: "Fra fɛ kɔ kan",
    stock_low: "Nuru, a lɛ wie.",
    stock_ok: "Bɛ lajɛ ti kpa.",
    my_stock: "Ń fɛ",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "Wɔ gblɔ nin wɔ sini",
    understand_intro: "Yra kɔ kɔ bɛ wɔ gba. Nuru ya.",
    cmu_title: "Gblɔ",
    cmu_simple: "A yɛ tɔntini wɔ gblɔ bɛ",
    cmu_description: "Ka wɔ yra, sika kaan kɔ wɔ gblɔ bɛ. Ka bana sɔ wɔ, bɛ tua.",
    rsti_title: "Sika mla",
    rsti_simple: "Sika kaan mla wɔ bɛ",
    rsti_description: "Yra kɔ kɔ bɛ sika kaan mla wɔ bɛ. Wɔ sika yɛ.",
    understand_reassure: "Wɔ sika lɛ di junman wɔ bɛ.",
    your_protection: "Wɔ lakana",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Rezo yili. Ń klɛ i.",
    offline_saved: "A klɛ. A lɛ glɔ.",
    offline_synced: "Bɛ lajɛ glɔ. A ti.",
    no_connection: "Rezo yili",
    connection_restored: "Rezo sɛ",
    
    /* ======================
       AIDE
    ====================== */
    need_help: "Wɔ sro gba?",
    call_agent: "Frɛ wɔ agent",
    ask_your_agent: "Frɛ wɔ agent",
    its_done: "A ti!",
    i_am_producer: "Ń yɛ fiɛfuɛ",
    initiative_by: "Min bɔ",
    congratulations: "A za!",
    loading: "A lɛ ba...",
    please_wait: "Minndɛ kaan...",
    error: "Sro kɔ",
    success: "A ti!",
    warning: "Nuru",
    info: "Kunnafoni",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "bɔtrɔ",
    afternoon: "zani",
    evening: "nɔlu",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "Ń wun",
    my_info: "Ń kunnafoni",
    my_phone: "Ń nimero",
    my_market: "Ń zikɛ",
    settings: "Siesielɛ",
    language: "Anwuanman",
    sound: "Nɛn",
    notifications: "Lasigiden",
    logout: "Glɔ",
    logout_confirm: "Wɔ sro glɔ sakpa?",
    logout_success: "A lɛ nuru nyɛ!",
  },

  senoufo: {
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "I ni tié 👋",
    welcome_subtitle: "A yé {day}. Katiè bé sɔ.",
    platform_title: "PNAVIM",
    platform_subtitle: "An bé nyɔgɔ fé katiè la",
    who_are_you: "An bé nyɔgɔ fé katiè la",
    market_open: "Katiè bé sɔ",
    market_closed: "Katiè datugu",
    choose_access: "Sugandi i ka ya",
    click_to_listen: "🔊 Lamɛn",
    speak: "Fɔ",
    listening: "N bé i lamɛn...",
    help_text: "I yé gɛlɛya? Fɔ i agent ma.",
    country: "Kɔtdivwa",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "N bé feere",
    merchant_subtitle: "Wari ta kliɛnw fɛ",
    merchant_desc: "Feere ka hɛrɛ",
    i_am_merchant: "N bé feere",
    agent: "N bé feerekɛlaw dɛmɛ",
    agent_subtitle: "Sɛbɛn ani dɛmɛ",
    agent_desc: "Jran feerekɛlaw bo",
    field_agent: "N bé feerekɛlaw dɛmɛ",
    cooperative: "Kooperatif",
    cooperative_desc: "Don ani sɔrɔ feere",
    i_am_cooperative: "Kooperatif",
    admin: "Administratiɔn",
    admin_desc: "Nɔmbrɛw lajɛ",
    view_cooperatives: "Kooperatifw lajɛ",
    view_map: "Kart lajɛ",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "Soo",
    sell: "Feere",
    profile: "N yɛrɛ",
    back: "Sɛgi",
    next: "Taa",
    close: "Datugu",
    today: "Bi",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "N balima, digi mikro, fɔ dɔɔni.",
    auth_listen: "Fɔ i nimɔrɔ dɔɔni.",
    auth_confirm: "N yé {phone} lamɛn. A yé tien?",
    auth_success: "A ka kɛ. I bé kɔnɔ.",
    auth_error: "A man fosi. An bé sɛgi ka fɔ.",
    auth_fallback: "I bé se ka klavye kɛ.",
    enter_phone: "Fɔ i nimɔrɔ",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "An bé lajɛ ka i yɛrɛ don",
    
    /* ======================
       DASHBOARD
    ====================== */
    dashboard_welcome: "N balima, i ka don filɛ.",
    dashboard_today_amount: "Bi i yé sika {amount} sɔrɔ.",
    dashboard_first_sale: "Feere fɔlɔ. Jija!",
    dashboard_tip: "Feere kelen kelen bé i dɛmɛ.",
    my_sales: "N ka feereli",
    sales_today: "Bi feereli",
    open_day: "Don dayɛlɛ",
    close_day: "Don datugu",
    day_opened: "I ka don dayɛlɛnna. I bé se ka wari ta.",
    day_closed: "I ka don datugura.",
    
    /* ======================
       CAISSE
    ====================== */
    cashier_title: "Wari ta",
    cashier_prompt: "Wari bé joli?",
    cashier_listening: "Fɔ, n bé i lamɛn.",
    cashier_confirm: "An bé a kɛ?",
    cashier_success: "A ka kɛ. Wari sɛbɛnna.",
    cashier_error: "Gɛlɛya dɔɔni. Sɛgi ka kɛ.",
    cashier_minimum: "A ka kan ka kɛ kɛmɛ ye.",
    cashier_cash: "A yé kasi ye.",
    cashier_mobile: "A yé Mobile Money ye.",
    enter_amount: "Wari bé joli?",
    enter_amount_instruction: "Digi biyɛw kan annzɛ fɔ hakɛ.",
    amount: "Hakɛ",
    confirm: "Dafa",
    cancel: "Bɔ",
    validate: "Sɛbɛn",
    
    /* ======================
       ARGENT
    ====================== */
    your_money: "I ka wari",
    your_sales_today: "I ka bi feereli",
    view_history: "I yé min kɛ kɔrɔ lajɛ",
    view_receipt: "Reçu lajɛ",
    total: "Bɛɛ lajɛ",
    balance: "Tɔ",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "I ka fɛn",
    stock_empty: "I stɔk bé gan.",
    stock_add: "Fɛn dɔ fara a kan",
    stock_low: "Nian, a bé wie.",
    stock_ok: "A bɛɛ ka ɲi.",
    my_stock: "N ka fɛn",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "I kɛnɛya ani i sini",
    understand_intro: "Feere kelen kelen bé i dɛmɛ. Nian wafa.",
    cmu_title: "Kɛnɛya",
    cmu_simple: "I ko tɔntini i kɛnɛya kama",
    cmu_description: "Ni i yé feere kɛ, dɔɔni bé taa i kɛnɛya kama. Ni bana yé i sɔrɔ, a bé sara.",
    rsti_title: "Wari mara",
    rsti_simple: "Wari dɔɔni bé mara i ye",
    rsti_description: "Feere kelen kelen bé wari dɔɔni mara i ye. O yé i yɛrɛ ka wari ye.",
    understand_reassure: "I ka wari bé baara kɛ i ye.",
    your_protection: "I ka lakana",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Rezo tɛ. N bé a sɛbɛn.",
    offline_saved: "A sɛbɛnna. An bé a ci.",
    offline_synced: "A bɛɛ tagara. A ka kɛ.",
    no_connection: "Rezo tɛ",
    connection_restored: "Rezo seginna",
    
    /* ======================
       AIDE
    ====================== */
    need_help: "I mago bé dɛmɛ la?",
    call_agent: "I ka agent wele",
    ask_your_agent: "Fɔ i ka agent ye",
    its_done: "A ka kɛ!",
    i_am_producer: "N bé sènè",
    initiative_by: "Min bɔra",
    congratulations: "A ni tié!",
    loading: "A bé don...",
    please_wait: "Mako dɔɔni...",
    error: "Gɛlɛya dɔ",
    success: "A ka kɛ!",
    warning: "Kɔlɔsi",
    info: "Kunnafoni",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "sogoma",
    afternoon: "tilefɛ",
    evening: "wula",
    monday: "Tɛnɛn",
    tuesday: "Tarata",
    wednesday: "Araba",
    thursday: "Alamisa",
    friday: "Juma",
    saturday: "Sibiri",
    sunday: "Kari",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "N yɛrɛ",
    my_info: "N ka kunnafoni",
    my_phone: "N ka nimɔrɔ",
    my_market: "N ka katiè",
    settings: "Labɛn",
    language: "Kan",
    sound: "Mankan",
    notifications: "Lasigiden",
    logout: "Bɔ",
    logout_confirm: "I bé taa tiɲɛn na?",
    logout_success: "An bé ɲɔgɔn yé!",
    
    /* ======================
       AGENT TERRAIN
    ====================== */
    enrollment: "Sɛbɛnni",
    enroll_merchant: "Feerekɛla sɛbɛn",
    merchant_list: "N ka feerekɛlaw",
    pending_validation: "A bé mako la",
    validated: "A dafara",
    rejected: "A banna",
    
    /* ======================
       COOPÉRATIVE
    ====================== */
    my_orders: "N ka ciyaaruw",
    new_order: "Ciyaaru kura",
    delivery: "Jolili",
    products: "Fɛnw",
    order_confirmed: "Ciyaaru sɛbɛnna",
    order_delivered: "A jolila",
  },

  malinke: {
    /* ======================
       ACCUEIL & GÉNÉRAL
    ====================== */
    welcome: "I ni sogoma 👋",
    welcome_subtitle: "An bɛ {day}. Sugu bɛ da yɛlɛn.",
    platform_title: "PNAVIM",
    platform_subtitle: "An bɛ ɲɔgɔn fɛ sugu kɔnɔ",
    who_are_you: "An bɛ ɲɔgɔn fɛ sugu kɔnɔ",
    market_open: "Sugu bɛ da yɛlɛn",
    market_closed: "Sugu da tugura",
    choose_access: "I ka bolo sugandi",
    click_to_listen: "🔊 Lamɛn",
    speak: "Kuma",
    listening: "N bɛ i lamɛn...",
    help_text: "I bɛ hakili la? I ka agent wele.",
    country: "Kɔtdiwari Jamana",
    
    /* ======================
       RÔLES
    ====================== */
    merchant: "N bɛ feere kɛ",
    merchant_subtitle: "Wari minɛ julakɛlaw fɛ",
    merchant_desc: "Feere ni hɛrɛ ye",
    i_am_merchant: "N bɛ feere kɛ",
    agent: "N bɛ feerekɛlaw dɛmɛ",
    agent_subtitle: "Sɛbɛnni ani dɛmɛ",
    agent_desc: "Jran feerekɛlaw bo",
    field_agent: "N bɛ feerekɛlaw dɛmɛ",
    cooperative: "Kooperatif",
    cooperative_desc: "Fɛn nani ani jolili",
    i_am_cooperative: "Kooperatif",
    admin: "Administratiɔn",
    admin_desc: "Nɔmbrɛw lajɛ",
    view_cooperatives: "Kooperatifw lajɛ",
    view_map: "Kart lajɛ",
    
    /* ======================
       NAVIGATION
    ====================== */
    home: "So",
    sell: "Feere",
    profile: "Ne yɛrɛ",
    back: "Kɔsɛgi",
    next: "Taa ɲɛ",
    close: "Da tugu",
    today: "Bi",
    
    /* ======================
       AUTHENTIFICATION
    ====================== */
    auth_welcome: "N tɛrɛmuso, digi mikoro kan, kuma dɔɔni.",
    auth_listen: "I ka nimɔrɔ fɔ dɔɔni dɔɔni.",
    auth_confirm: "N ye {phone} lamɛn. O de wa?",
    auth_success: "A kɛra. I donna.",
    auth_error: "Fosi tɛ. An bɛ a damina kokura.",
    auth_fallback: "I bɛ se ka klaviye baara.",
    enter_phone: "I ka nimɔrɔ fɔ",
    phone_placeholder: "07 XX XX XX XX",
    verify_identity: "An bɛ a lajɛ ko i yɛrɛ don",
    
    /* ======================
       DASHBOARD
    ====================== */
    dashboard_welcome: "N tɛrɛmuso, i ka don nan filɛ.",
    dashboard_today_amount: "Bi i ye warigwɛ {amount} sɔrɔ.",
    dashboard_first_sale: "Feere fɔlɔ. Jija!",
    dashboard_tip: "Feere kelen kelen bɛ i dɛmɛ.",
    my_sales: "Ne ka feereli",
    sales_today: "Bi feereli",
    open_day: "Don da yɛlɛ",
    close_day: "Don da tugu",
    day_opened: "I ka don yɛlɛnna. I bɛ se ka wari ta.",
    day_closed: "I ka don tugura.",
    
    /* ======================
       CAISSE / VENTE
    ====================== */
    cashier_title: "Wari minɛ",
    cashier_prompt: "Wari joli?",
    cashier_listening: "Kuma, n bɛ i lamɛn.",
    cashier_confirm: "An bɛ a kɛ wa?",
    cashier_success: "A kɛra. Wari sɛbɛnna.",
    cashier_error: "Gɛlɛya dɔɔni. A lasegin.",
    cashier_minimum: "A ka kan ka kɛ kɛmɛ ye dɔrɔn.",
    cashier_cash: "A ye kasi ye.",
    cashier_mobile: "A ye Mobile Money ye.",
    enter_amount: "Wari joli?",
    enter_amount_instruction: "Digi biyɛw kan walima fɔ hakɛ.",
    amount: "Hakɛ",
    confirm: "Latigɛ",
    cancel: "A to yen",
    validate: "Sɛbɛn",
    
    /* ======================
       ARGENT
    ====================== */
    your_money: "I ka wari",
    your_sales_today: "I ka bi feereli",
    view_history: "I ye min kɛ kɔrɔ lajɛ",
    view_receipt: "Reçu lajɛ",
    total: "Bɛɛ lajɛlen",
    balance: "Tɔ",
    
    /* ======================
       STOCK
    ====================== */
    stock_title: "I ka fɛnw",
    stock_empty: "I ka magazɛn bɛ bɔn.",
    stock_add: "Fɛn dɔ fara a kan",
    stock_low: "A hakɛ dɔgɔyara. Fɛn dɔ fara a kan.",
    stock_ok: "A bɛɛ ɲi.",
    my_stock: "Ne ka fɛnw",
    
    /* ======================
       CMU / RSTI
    ====================== */
    understand_title: "I ka kɛnɛya ani i ka sini",
    understand_intro: "Feere kelen kelen bɛ i dɛmɛ.",
    cmu_title: "Kɛnɛya",
    cmu_simple: "A bɛ i ko tɔntini i ka kɛnɛya kama",
    cmu_description: "Ni i ye feere kɛ, dɔɔni bɛ taa i ka kɛnɛya kama. Ni bana ye i sɔrɔ, a bɛ sara.",
    rsti_title: "Wari marayɔrɔ",
    rsti_simple: "Wari dɔɔni bɛ mara i ye",
    rsti_description: "Feere kelen kelen bɛ wari dɔɔni mara i ye. O ye i yɛrɛ ka wari ye.",
    understand_reassure: "I ka wari bɛ baara kɛ i ye.",
    your_protection: "I ka lakana",
    
    /* ======================
       HORS LIGNE
    ====================== */
    offline_detected: "Rezo tɛ. Nka n bɛ a sɛbɛn.",
    offline_saved: "A sɛbɛnna. An bɛ a ci kɔfɛ.",
    offline_synced: "A bɛɛ tagara. A kɛra.",
    no_connection: "Rezo tɛ",
    connection_restored: "Rezo seginna",
    
    /* ======================
       AIDE & MESSAGES
    ====================== */
    need_help: "I mago bɛ dɛmɛ la wa?",
    call_agent: "I ka agent wele",
    ask_your_agent: "Fɔ i ka agent ye",
    its_done: "A kɛra!",
    i_am_producer: "N ye sèneféla ye",
    initiative_by: "Min bɔra",
    congratulations: "A ni cɛ!",
    loading: "A bɛ don...",
    please_wait: "Mako dɔɔni...",
    error: "Gɛlɛya dɔ",
    success: "A kɛra!",
    warning: "Kɔlɔsi",
    info: "Kunnafoni",
    
    /* ======================
       TEMPS
    ====================== */
    morning: "sogoma",
    afternoon: "tile kɔfɛ",
    evening: "wula",
    monday: "Tɛnɛn",
    tuesday: "Tarata",
    wednesday: "Araba",
    thursday: "Alamisa",
    friday: "Juma",
    saturday: "Sibiri",
    sunday: "Kari",
    
    /* ======================
       PROFIL
    ====================== */
    my_profile: "Ne ka kun",
    my_info: "Ne ka kunnafoni",
    my_phone: "Ne ka nimɔrɔ",
    my_market: "Ne ka sugu",
    settings: "Labɛnni",
    language: "Kan",
    sound: "Mankan",
    notifications: "Lasigiden",
    logout: "Bɔ",
    logout_confirm: "I bɛ taa tiɲɛn na wa?",
    logout_success: "An bɛ ɲɔgɔn ye!",
    
    /* ======================
       AGENT TERRAIN
    ====================== */
    enrollment: "Sɛbɛnni",
    enroll_merchant: "Feerekɛla sɛbɛn",
    merchant_list: "Ne ka feerekɛlaw",
    pending_validation: "A bɛ mako la",
    validated: "A dafara",
    rejected: "A banna",
    
    /* ======================
       COOPÉRATIVE
    ====================== */
    my_orders: "Ne ka ciyaaruw",
    new_order: "Ciyaaru kura",
    delivery: "Jolili",
    products: "Fɛnw",
    order_confirmed: "Ciyaaru sɛbɛnna",
    order_delivered: "A jolila",
  },
};

/**
 * Récupère une traduction avec fallback vers le français
 */
export function getTranslation(language: LanguageCode, key: string): string {
  return translations[language]?.[key] || translations.fr[key] || key;
}
