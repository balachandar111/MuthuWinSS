// ---------------------------------------------------------------------------
// EDIT THIS FILE to change bot copy, add languages, or update redirect links.
// The whole conversation tree is data, not code, so no component changes are
// needed for most content updates.
//
// FLOW (mirrors the latest Ramajeyam architecture):
//   Language -> Business type (B2B / B2C)
//     B2B -> quotation message (website link)
//     B2C -> Main menu -> Cooking Instructions | Recipe Videos |
//                          Place Order | Complaint | Contact Us
//
// NOTE FOR THE BRAND OWNER / DEV — placeholders that need your real content:
//   - STEPS images: the Ramajeyam version uses the client's own step-by-step
//     cooking photography. No equivalent Muthu WinSS photos were supplied,
//     so every step below has NO `image`, which makes the UI fall back to
//     the neutral rice-bag illustration. Add a real `image` URL per step
//     once you have your own photography, exactly like Ramajeyam did.
//   - recipeVideo: only the YouTube CHANNEL link was provided
//     (https://www.youtube.com/@muthuwinssrice). Paste the exact video URL
//     here if there's one specific recipe video to show.
//   - CLOSING_HASHTAG: no campaign hashtag/prize was specified for Muthu
//     WinSS, so this reuses the same "tag us for a surprise gift" idea with
//     a placeholder handle/hashtag. Confirm the real campaign copy (is
//     there actually a giveaway?) before this goes live.
//   - riceTypePonni / riceTypeIdly: kept the same two categories as the
//     Ramajeyam flow since Muthu WinSS's Blinkit listing confirms at least
//     a Boiled Ponni Rice product. Confirm whether Idly Rice (and/or other
//     varieties) should also be offered here.
//   - Blinkit / Swiggy product images: no photo URLs were supplied, so
//     product cards fall back to the rice-bag illustration.
// ---------------------------------------------------------------------------

// Marketplace / redirect / social links
export const LINKS = {
  website: "https://winssrice.com/index.php",
  // B2B / bulk-order quotation request page.
  b2bQuotation: "https://winssrice.com/contactus.php",
  youtube: "https://www.youtube.com/@muthuwinssrice",
  instagram: "https://www.instagram.com/muthuwinssrice/",
  facebook: "https://www.facebook.com/muthuwinssbrandrice/",
  // Google Maps search built from the address supplied for the brand.
  location:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "151/3B, Palayakottai Road, Kangeyam - 638701, Tiruppur, Tamil Nadu, India"
    ),
  // TODO: replace with the exact recipe video URL if it differs from the channel link.
  recipeVideo: "https://www.youtube.com/@muthuwinssrice",
};

// TODO: confirm the real campaign hashtag/handle with the client before launch.
const CLOSING_HASHTAG = "@muthuwinssrice";

// Per-platform product catalogues shown as cards once a platform is picked.
export const PRODUCTS = {
  blinkit: {
    label: "Blinkit",
    moreLink: "https://blinkit.com/s/?q=muthu%20win%20ss%20rice",
    items: [
      {
        name: "Muthu Win SS Brand Rice - Boiled Ponni Rice (Medium Grain)",
        url: "https://blinkit.com/prn/muthu-win-ss-brand-rice-boiled-ponni-rice-medium-grain/prid/737929",
        // TODO: add a real packshot URL here if available.
      },
    ],
  },
  swiggy: {
    label: "Swiggy Instamart",
    items: [
      {
        name: "Muthu Win SS Brand Rice",
        url: "https://instamart.in/item/W83R79JOWI",
        // TODO: add a real packshot URL here if available.
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Interactive step data. No client photography was supplied for Muthu
// WinSS, so `image` is intentionally omitted on every step below — the UI
// (StepVisual in Chatbot.jsx) falls back to a plain rice-bag illustration
// automatically. Swap in real `image` URLs, one per step, once available.
// The cooking technique text itself is generic rice-cooking know-how (not
// brand-specific IP), so it's safe to reuse as a starting point — edit
// freely to match Muthu WinSS's own recommended method if it differs.
// ---------------------------------------------------------------------------
export const STEPS = {
  ponniCooker: {
    english: [
      {
        title: "Wash & Soak",
        desc: "Wash 1 cup of rice 2–3 times until the water runs clear, then soak for 20 minutes before cooking.",
      },
      {
        title: "Add to Cooker",
        desc: "Add 1 cup soaked rice and 2 to 2.5 cups water into the pressure cooker.",
      },
      {
        title: "Cook 3 Whistles & Release",
        desc: "Close the lid with the weight on and cook on medium-high heat for 3 whistles. Turn off the heat and let the pressure release naturally for 10–15 minutes.",
      },
      {
        title: "Fluff & Serve",
        desc: "Open the lid and fluff the rice gently with a fork.",
      },
    ],
    tamil: [
      {
        title: "கழுவி ஊறவைக்கவும்",
        desc: "1 கப் அரிசியை 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவி, சமைப்பதற்கு முன் 20 நிமிடங்கள் ஊறவைக்கவும்.",
      },
      {
        title: "குக்கரில் சேர்க்கவும்",
        desc: "குக்கரில் 1 கப் ஊறவைத்த அரிசிக்கு 2 முதல் 2.5 கப் தண்ணீர் சேர்க்கவும்.",
      },
      {
        title: "3 விசில் விட்டு பிரஷர் குறையவும்",
        desc: "குக்கர் மூடி மற்றும் விசில் போட்டு, மிதமான தீயில் 3 விசில் விடவும். அடுப்பை அணைத்து, தானாகவே பிரஷர் குறையும் வரை 10–15 நிமிடங்கள் காத்திருக்கவும்.",
      },
      {
        title: "கிளறி பரிமாறவும்",
        desc: "மூடியைத் திறந்து, கரண்டியால் லேசாகக் கிளறி பரிமாறவும்.",
      },
    ],
  },
  ponniPotSteam: {
    english: [
      {
        title: "Wash & Soak",
        desc: "Wash 1 cup of rice 2–3 times until the water runs clear, then soak for 20 minutes before cooking.",
      },
      {
        title: "Boil Water",
        desc: "Boil 4 to 5 cups of water in a wide vessel.",
      },
      {
        title: "Add Rice & Cook Uncovered",
        desc: "Add the soaked rice to the boiling water and cook uncovered on medium-high heat for 18–25 minutes until the grains are soft.",
      },
      {
        title: "Drain",
        desc: "Turn off the heat and drain the excess starch water using a colander or vessel lid.",
      },
      {
        title: "Rest & Serve",
        desc: "Cover with a lid and let it rest for 5 minutes before serving.",
      },
    ],
    tamil: [
      {
        title: "கழுவி ஊறவைக்கவும்",
        desc: "1 கப் அரிசியை 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவி, சமைப்பதற்கு முன் 20 நிமிடங்கள் ஊறவைக்கவும்.",
      },
      {
        title: "தண்ணீர் கொதிக்க வையுங்கள்",
        desc: "ஒரு அகலமான பாத்திரத்தில் 4 முதல் 5 கப் தண்ணீர் ஊற்றி கொதிக்க வைக்கவும்.",
      },
      {
        title: "அரிசியைச் சேர்த்து மூடாமல் வேகவைக்கவும்",
        desc: "கொதிக்கும் தண்ணீரில் ஊறவைத்த அரிசியைச் சேர்த்து, மிதமான தீயில் 18–25 நிமிடங்கள் அரிசி நன்கு வேகும் வரை மூடாமல் கொதிக்க விடவும்.",
      },
      {
        title: "வடிகட்டவும்",
        desc: "சாதம் வெந்ததும், தட்டை வைத்து கஞ்சியை வடிகட்டவும்.",
      },
      {
        title: "மூடி வைத்து பரிமாறவும்",
        desc: "பாத்திரத்தை மூடி 5 நிமிடங்கள் கழித்து பரிமாறவும்.",
      },
    ],
  },
  idlyRice: {
    english: [
      {
        title: "Ingredients (4:1 Ratio)",
        desc: "Idli rice 4 cups, whole urad dal 1 cup, fenugreek seeds 1 tsp, rock salt 1.5–2 tsp.",
      },
      {
        title: "Wash & Soak Rice",
        desc: "Wash the idli rice 2–3 times until the water is clear, then soak for 4 to 5 hours.",
      },
      {
        title: "Soak Dal & Fenugreek",
        desc: "Wash urad dal and fenugreek seeds together and soak separately for 4 to 5 hours.",
      },
      {
        title: "Grind",
        desc: "Grind the urad dal first with ice-cold water for 20–25 minutes until fluffy, then grind the rice to a coarse, semolina-like texture.",
      },
      {
        title: "Mix by Hand",
        desc: "Add rock salt and mix the rice and dal batters thoroughly by hand for 2–3 minutes. Keep the vessel only half full.",
      },
      {
        title: "Ferment",
        desc: "Cover and let the batter ferment in a warm place for 8 to 12 hours.",
      },
      {
        title: "Steam Idlis or Make Dosas",
        desc: "Days 1–2: gently fold the batter and steam in idli plates for 10–12 minutes. Day 3+: thin the batter with a little water and spread it on a hot tawa for crispy dosas.",
      },
    ],
    tamil: [
      {
        title: "பொருட்கள் (4:1 அளவு)",
        desc: "இட்லி அரிசி 4 கப், முழு உளுந்தம்பருப்பு 1 கப், வெந்தயம் 1 தேக்கரண்டி, கல் உப்பு 1.5–2 தேக்கரண்டி.",
      },
      {
        title: "அரிசியைக் கழுவி ஊறவைக்கவும்",
        desc: "இட்லி அரிசியை 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவி, 4 முதல் 5 மணி நேரம் ஊறவைக்கவும்.",
      },
      {
        title: "பருப்பு & வெந்தயம் ஊறவைக்கவும்",
        desc: "உளுந்தம்பருப்பு மற்றும் வெந்தயத்தை ஒன்றாகக் கழுவி, தனி பாத்திரத்தில் 4 முதல் 5 மணி நேரம் ஊறவைக்கவும்.",
      },
      {
        title: "அரைக்கவும்",
        desc: "முதலில் உளுந்தை ஜில்லென்ற தண்ணீருடன் 20-25 நிமிடங்கள் மிருதுவாக அரைத்து, பின் அரிசியை கொரகொரப்பாக அரைக்கவும்.",
      },
      {
        title: "கையால் கலக்கவும்",
        desc: "கல் உப்பு சேர்த்து, சுத்தமான கைகளால் 2-3 நிமிடங்கள் நன்றாக கலக்கவும். பாத்திரத்தில் பாதி அளவு மட்டுமே மாவு இருக்க வேண்டும்.",
      },
      {
        title: "புளிக்க வைக்கவும்",
        desc: "மூடி, வெதுவெதுப்பான இடத்தில் 8 முதல் 12 மணி நேரம் புளிக்க விடவும்.",
      },
      {
        title: "இட்லி வேகவைக்கவும் அல்லது தோசை சுடவும்",
        desc: "1-2 நாட்கள்: மாவை லேசாகக் கிளறி, இட்லி தட்டில் ஊற்றி 10-12 நிமிடங்கள் வேகவைக்கவும். 3 நாட்களுக்குப் பிறகு: சிறிது தண்ணீர் சேர்த்து மாவை தளரக் கரைத்து, தோசைக் கல்லில் ஊற்றி சுடவும்.",
      },
    ],
  },
};

// Text strings per language. Add more keys / languages here as needed.
export const STRINGS = {
  english: {
    welcome: "Thank you for visiting Muthu WinSS Rice 🌾",
    chooseLanguage: "Please choose your language",
    mainMenu: "How can we help you today?",

    // Business type (B2B / B2C)
    businessTypePrompt: "Are you ordering for business (bulk) or personal use?",
    menuB2B: "B2B (Bulk / Business Order)",
    menuB2C: "B2C (Individual Order)",
    b2bMessage:
      "For bulk and business orders, please visit our website to get a quotation 🙏",
    b2bCta: "Get Quotation on our Website",

    // Main menu options
    menuCookingInstructions: "Cooking instructions",
    menuRecipeVideos: "Recipe videos",
    menuPlaceOrder: "Place order",
    menuComplaint: "Complaint",
    menuContactUs: "Contact Us",

    // Cooking instructions
    riceTypePrompt: "Please choose the rice type:",
    riceTypePonni: "Ponni Rice",
    riceTypeIdly: "Idly Rice",
    ponniMethodPrompt: "How would you like to cook it?",
    methodCooker: "Cooker (Pressure Cooker)",
    methodPotSteam: "Pot Steam (Open Pan)",
    stepsIntro: "Here's how to make it, step by step 👇",
    closingTitle: "You're Done! 🎉",
    closingMessage: `Thank you for connecting with us! 🌾 Once you complete cooking, capture a pic with the Muthu WinSS bag and tag us on Instagram ${CLOSING_HASHTAG} for a chance to WIN A SURPRISE GIFT! 🎁`,
    stepCounter: "Step {current} of {total}",
    stepNext: "Next",
    stepBack: "Back",
    stepFinish: "Finish",

    // Recipe video
    recipeVideoIntro: "Here's our recipe video for you 🎥",
    watchVideoBtn: "▶ Watch on YouTube",

    // Place order
    placeOrderPrompt: "How would you like to place your order?",
    quickCommerceLabel: "Quick commerce",
    websiteLabel: "Website",
    quickCommercePrompt: "Choose your quick commerce platform:",
    blinkitTitle: "Muthu WinSS Rice on Blinkit ⚡",
    swiggyTitle: "Muthu WinSS Rice on Swiggy Instamart 🛵",
    viewProduct: "View product",
    moreProducts: "See more products",
    websiteRedirectIntro: "Tap below to place your order on our website:",
    websiteRedirectBtn: "Visit our Website →",

    // Contact us
    contactUsIntro: "You can reach Muthu WinSS Rice here:",
    contactYoutube: "YouTube",
    contactInstagram: "Instagram",
    contactFacebook: "Facebook",
    contactLocation: "Our Location",
    contactWebsite: "Website",

    // Complaint form
    formTitle: "Complaint details",
    complaintIntro: "Sorry for the inconvenience 🙏\nPlease share the details below:",
    purchaseTypeLabel: "Where did you purchase from?",
    purchaseTypeOnline: "Online",
    purchaseTypeOffline: "Offline (Store)",
    orderPlatformLabel: "Which platform?",
    orderIdLabel: "Order ID",
    storeNameLabel: "Store name",
    areaLabel: "Area",
    nameLabel: "Name",
    contactLabel: "Contact number",
    problemLabel: "Please describe the problem",
    attachmentLabel: "Attach a photo or PDF (optional)",
    attachmentHint: "JPG, PNG, WEBP, GIF or PDF, up to 5MB",
    attachmentChoose: "Choose file",
    attachmentChange: "Change file",
    attachmentRemove: "Remove",
    attachmentTooLarge: "File is too large. Max size is 5MB.",
    attachmentBadType: "Only image or PDF files are allowed.",
    selectPlaceholder: "-- Select --",
    submit: "Submit",
    thankYou:
      "Thank you for sharing the details. Our customer agent will connect with you shortly.",
    restart: "Start over",
    goBack: "Back to menu",
  },
  tamil: {
    welcome: "முத்து வின்எஸ்எஸ் அரிசி பிராண்டைப் பார்வையிட்டதற்கு நன்றி 🌾",
    chooseLanguage: "தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    mainMenu: "இன்று நாங்கள் எப்படி உதவலாம்?",

    businessTypePrompt:
      "நீங்கள் வணிக (மொத்த) தேவைக்கா அல்லது சொந்த பயன்பாட்டுக்கா ஆர்டர் செய்கிறீர்கள்?",
    menuB2B: "B2B (மொத்த / வணிக ஆர்டர்)",
    menuB2C: "B2C (தனிநபர் ஆர்டர்)",
    b2bMessage:
      "மொத்த மற்றும் வணிக ஆர்டர்களுக்கு, மேற்கோள் (quotation) பெற எங்கள் இணையதளத்தைப் பார்வையிடவும் 🙏",
    b2bCta: "இணையதளத்தில் மேற்கோள் பெறவும்",

    menuCookingInstructions: "சமையல் முறை விவரங்கள்",
    menuRecipeVideos: "செய்முறை வீடியோக்கள்",
    menuPlaceOrder: "ஆர்டர் செய்யுங்கள்",
    menuComplaint: "புகார்",
    menuContactUs: "தொடர்பு கொள்ள",

    riceTypePrompt: "அரிசி வகையைத் தேர்ந்தெடுக்கவும்:",
    riceTypePonni: "பொன்னி அரிசி",
    riceTypeIdly: "இட்லி அரிசி",
    ponniMethodPrompt: "எந்த முறையில் சமைக்க விரும்புகிறீர்கள்?",
    methodCooker: "குக்கர் (பிரஷர் குக்கர்)",
    methodPotSteam: "பாத்திரத்தில் வடிக்கும் முறை",
    stepsIntro: "படிப்படியாக செய்முறையை பாருங்கள் 👇",
    closingTitle: "முடிந்தது! 🎉",
    closingMessage: `எங்களுடன் இணைந்ததற்கு நன்றி! 🌾 சமையலை முடித்தவுடன், முத்து வின்எஸ்எஸ் பையுடன் ஒரு புகைப்படம் எடுத்து, Instagram-இல் ${CLOSING_HASHTAG} என டேக் செய்து ஒரு சர்ப்ரைஸ் பரிசை வெல்லும் வாய்ப்பைப் பெறுங்கள்! 🎁`,
    stepCounter: "படி {current} / {total}",
    stepNext: "அடுத்து",
    stepBack: "பின்செல்",
    stepFinish: "முடி",

    recipeVideoIntro: "இதோ எங்கள் செய்முறை வீடியோ 🎥",
    watchVideoBtn: "யூடியூபில் பார்க்க",

    placeOrderPrompt: "நீங்கள் எப்படி ஆர்டர் செய்ய விரும்புகிறீர்கள்?",
    quickCommerceLabel: "குயிக் காமர்ஸ்",
    websiteLabel: "இணையதளம்",
    quickCommercePrompt: "உங்கள் குயிக் காமர்ஸ் தளத்தைத் தேர்ந்தெடுக்கவும்:",
    blinkitTitle: "Blinkit இல் முத்து வின்எஸ்எஸ் அரிசி ⚡",
    swiggyTitle: "Swiggy Instamart இல் முத்து வின்எஸ்எஸ் அரிசி 🛵",
    viewProduct: "பொருளைப் பார்க்க",
    moreProducts: "மேலும் பொருட்களைப் பார்க்க",
    websiteRedirectIntro: "எங்கள் இணையதளத்தில் ஆர்டர் செய்ய கீழே தட்டவும்:",
    websiteRedirectBtn: "எங்கள் இணையதளத்திற்குச் செல்லவும் →",

    contactUsIntro: "முத்து வின்எஸ்எஸ் அரிசியை இங்கே தொடர்பு கொள்ளலாம்:",
    contactYoutube: "YouTube",
    contactInstagram: "Instagram",
    contactFacebook: "Facebook",
    contactLocation: "எங்கள் இருப்பிடம்",
    contactWebsite: "இணையதளம்",

    formTitle: "புகார் விவரங்கள்",
    complaintIntro: "சிரமத்திற்கு வருந்துகிறோம் 🙏\nதயவுசெய்து பின்வரும் விவரங்களைப் பகிரவும்:",
    purchaseTypeLabel: "எங்கிருந்து வாங்கினீர்கள்?",
    purchaseTypeOnline: "ஆன்லைன்",
    purchaseTypeOffline: "ஆஃப்லைன் (கடை)",
    orderPlatformLabel: "எந்த தளம்?",
    orderIdLabel: "ஆர்டர் ஐடி",
    storeNameLabel: "கடை பெயர்",
    areaLabel: "பகுதி",
    nameLabel: "பெயர்",
    contactLabel: "தொடர்பு எண்",
    problemLabel: "பிரச்சனையை விவரிக்கவும்",
    attachmentLabel: "புகைப்படம் / PDF இணைக்கவும் (விருப்பத்தேர்வு)",
    attachmentHint: "JPG, PNG, WEBP, GIF அல்லது PDF, அதிகபட்சம் 5MB",
    attachmentChoose: "கோப்பைத் தேர்ந்தெடுக்கவும்",
    attachmentChange: "கோப்பை மாற்றவும்",
    attachmentRemove: "அகற்று",
    attachmentTooLarge: "கோப்பு மிகப் பெரியது. அதிகபட்சம் 5MB.",
    attachmentBadType: "படம் அல்லது PDF கோப்புகள் மட்டுமே அனுமதிக்கப்படும்.",
    selectPlaceholder: "-- தேர்ந்தெடுக்கவும் --",
    submit: "சமர்ப்பிக்கவும்",
    thankYou:
      "விவரங்களைப் பகிர்ந்ததற்கு நன்றி. எங்கள் வாடிக்கையாளர் பிரதிநிதி விரைவில் உங்களைத் தொடர்பு கொள்வார்.",
    restart: "மீண்டும் தொடங்கு",
    goBack: "மெனுவிற்குத் திரும்பு",
  },
};

// The conversation tree. Each node id is referenced by "next" pointers.
// node types: "options" | "products" | "steps" | "form" | "end"
// "steps" renders an interactive, photo-illustrated step-by-step card
// (see STEPS above and the steps renderer in Chatbot.jsx).
export const FLOW = {
  welcome: {
    type: "options",
    text: (t) => t.welcome,
    options: [{ label: "Continue / தொடரவும்", next: "language" }],
  },

  language: {
    type: "options",
    text: (t) => t.chooseLanguage,
    // value sets the active language for all subsequent screens
    options: [
      { label: "1. English", value: "english", next: "business_type" },
      { label: "2. Tamil", value: "tamil", next: "business_type" },
    ],
  },

  // Fork: bulk/business buyers are shown a quotation message (website
  // link); individual buyers continue into the normal ordering / support
  // flow via main_menu.
  business_type: {
    type: "options",
    text: (t) => t.businessTypePrompt,
    options: [
      { label: (t) => t.menuB2B, next: "b2b_info" },
      { label: (t) => t.menuB2C, next: "main_menu" },
    ],
  },

  b2b_info: {
    type: "options",
    text: (t) => t.b2bMessage,
    options: [
      { label: (t) => t.b2bCta, link: LINKS.b2bQuotation },
      { label: (t) => t.goBack, next: "business_type" },
    ],
  },

  main_menu: {
    type: "options",
    text: (t) => t.mainMenu,
    options: [
      { label: (t) => t.menuCookingInstructions, next: "cooking_instructions" },
      { label: (t) => t.menuRecipeVideos, next: "recipe_video" },
      { label: (t) => t.menuPlaceOrder, next: "place_order" },
      { label: (t) => t.menuComplaint, next: "complaint_form" },
      { label: (t) => t.menuContactUs, next: "contact_us" },
    ],
  },

  // ---------------------------------------------------------------------
  // Flow 1: Cooking Instructions
  // ---------------------------------------------------------------------
  cooking_instructions: {
    type: "options",
    text: (t) => t.riceTypePrompt,
    options: [
      { label: (t) => t.riceTypePonni, next: "ponni_method" },
      { label: (t) => t.riceTypeIdly, next: "idly_rice_result" },
    ],
  },

  ponni_method: {
    type: "options",
    text: (t) => t.ponniMethodPrompt,
    options: [
      { label: (t) => t.methodCooker, next: "ponni_cooker_result" },
      { label: (t) => t.methodPotSteam, next: "ponni_pot_steam_result" },
    ],
  },

  ponni_cooker_result: {
    type: "steps",
    text: (t) => t.stepsIntro,
    stepsKey: "ponniCooker",
    goBack: "main_menu",
  },

  ponni_pot_steam_result: {
    type: "steps",
    text: (t) => t.stepsIntro,
    stepsKey: "ponniPotSteam",
    goBack: "main_menu",
  },

  idly_rice_result: {
    type: "steps",
    text: (t) => t.stepsIntro,
    stepsKey: "idlyRice",
    goBack: "main_menu",
  },

  // ---------------------------------------------------------------------
  // Flow 2: Recipe Video
  // ---------------------------------------------------------------------
  recipe_video: {
    type: "options",
    text: (t) => t.recipeVideoIntro,
    options: [
      { label: (t) => t.watchVideoBtn, link: LINKS.recipeVideo },
      { label: (t) => t.goBack, next: "main_menu" },
    ],
  },

  // ---------------------------------------------------------------------
  // Flow 3: Place Order — Quick Commerce (Blinkit / Swiggy only, no
  // E-commerce) or Website.
  // ---------------------------------------------------------------------
  place_order: {
    type: "options",
    text: (t) => t.placeOrderPrompt,
    options: [
      { label: (t) => t.quickCommerceLabel, next: "quick_commerce" },
      { label: (t) => t.websiteLabel, next: "website_order" },
    ],
  },

  quick_commerce: {
    type: "options",
    text: (t) => t.quickCommercePrompt,
    options: [
      { label: "Blinkit", next: "blinkit_products" },
      { label: "Swiggy Instamart", next: "swiggy_products" },
      { label: (t) => t.goBack, next: "place_order" },
    ],
  },

  blinkit_products: {
    type: "products",
    text: (t) => t.blinkitTitle,
    platform: "blinkit",
    accent: "blinkit",
  },

  swiggy_products: {
    type: "products",
    text: (t) => t.swiggyTitle,
    platform: "swiggy",
    accent: "swiggy",
  },

  website_order: {
    type: "options",
    text: (t) => t.websiteRedirectIntro,
    options: [
      { label: (t) => t.websiteRedirectBtn, link: LINKS.website },
      { label: (t) => t.goBack, next: "place_order" },
    ],
  },

  // ---------------------------------------------------------------------
  // Flow 4: Contact Us
  // ---------------------------------------------------------------------
  contact_us: {
    type: "options",
    text: (t) => t.contactUsIntro,
    options: [
      { label: (t) => `▶ ${t.contactYoutube}`, link: LINKS.youtube },
      { label: (t) => `📸 ${t.contactInstagram}`, link: LINKS.instagram },
      { label: (t) => `👍 ${t.contactFacebook}`, link: LINKS.facebook },
      { label: (t) => `📍 ${t.contactLocation}`, link: LINKS.location },
      { label: (t) => `🌐 ${t.contactWebsite}`, link: LINKS.website },
      { label: (t) => t.goBack, next: "main_menu" },
    ],
  },

  // ---------------------------------------------------------------------
  // Flow 5: Complaint (renamed from "Query")
  // Conditional fields:
  //   purchaseType = "online"  -> show orderPlatform (select) + orderId
  //   purchaseType = "offline" -> show storeName + area
  // ---------------------------------------------------------------------
  complaint_form: {
    type: "form",
    text: (t) => t.complaintIntro,
    title: (t) => t.formTitle,
    fields: [
      {
        key: "purchaseType",
        labelKey: "purchaseTypeLabel",
        type: "select",
        required: true,
        options: [
          { value: "online", labelKey: "purchaseTypeOnline" },
          { value: "offline", labelKey: "purchaseTypeOffline" },
        ],
      },
      {
        key: "orderPlatform",
        labelKey: "orderPlatformLabel",
        type: "select",
        required: true,
        showIf: { key: "purchaseType", equals: "online" },
        options: [
          { value: "blinkit", label: "Blinkit" },
          { value: "swiggy", label: "Swiggy Instamart" },
        ],
      },
      {
        key: "orderId",
        labelKey: "orderIdLabel",
        required: true,
        showIf: { key: "purchaseType", equals: "online" },
      },
      {
        key: "storeName",
        labelKey: "storeNameLabel",
        required: true,
        showIf: { key: "purchaseType", equals: "offline" },
      },
      {
        key: "area",
        labelKey: "areaLabel",
        required: true,
        showIf: { key: "purchaseType", equals: "offline" },
      },
      { key: "customerName", labelKey: "nameLabel", required: true },
      { key: "contactNumber", labelKey: "contactLabel", required: true },
      {
        key: "problem",
        labelKey: "problemLabel",
        multiline: true,
        required: true,
      },
      { key: "attachment", labelKey: "attachmentLabel", type: "file" },
    ],
    next: "thank_you",
  },

  thank_you: {
    type: "end",
    text: (t) => t.thankYou,
  },
};

export const START_NODE = "welcome";
