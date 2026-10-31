import { useEffect, useState } from "react";

const KEY = "dhc-language";
const translations = {
  Dashboard: "ड्यासबोर्ड", Today: "आज", Requests: "अनुरोधहरू", Schedule: "तालिका", Team: "टोली",
  Inventory: "सामान", Customers: "ग्राहकहरू", Reports: "प्रतिवेदन", Settings: "सेटिङहरू",
  "Workspace location": "कार्यस्थल", "Log out": "लगआउट", "Service operations": "सेवा सञ्चालन",
  "Welcome back": "फेरि स्वागत छ", Refresh: "ताजा गर्नुहोस्", "Light mode": "उज्यालो मोड", "Dark mode": "गाढा मोड",
  "New request": "नयाँ अनुरोध", "Service board": "सेवा बोर्ड", "Service call closure status": "सेवा बन्द स्थिति",
  "Search requests, customers, appliances...": "अनुरोध, ग्राहक वा उपकरण खोज्नुहोस्...", "Customer sign in": "ग्राहक लगइन",
  "Sign in": "लगइन गर्नुहोस्", "Create customer account": "ग्राहक खाता खोल्नुहोस्", "Full name": "पूरा नाम",
  "Contact number": "सम्पर्क नम्बर", "Email address": "इमेल ठेगाना", Password: "पासवर्ड",
  "Choose your profile avatar": "आफ्नो प्रोफाइल अवतार छान्नुहोस्", "Home appliances": "घरायसी उपकरणहरू",
  "Book a service": "सेवा बुक गर्नुहोस्", "My requests": "मेरा अनुरोधहरू", Profile: "प्रोफाइल",
  Services: "सेवाहरू", Language: "भाषा", English: "अङ्ग्रेजी", Nepali: "नेपाली",
  "Total active requests": "कुल सक्रिय अनुरोध", "Open service requests": "खुला सेवा अनुरोध", "Pending approvals": "अनुमोदन बाँकी",
  "Waiting for review": "समीक्षा पर्खँदै", "In-progress services": "सेवा जारी", "Technicians on the job": "काममा प्राविधिक",
  "Completed jobs": "सम्पन्न काम", "Service overview": "सेवा सारांश", "Open any service call to assign a technician or review its status": "प्राविधिक तोक्न वा स्थिति हेर्न सेवा कल खोल्नुहोस्",
  "CUSTOMER ACCOUNTS": "ग्राहक खाताहरू", "Review registered customers and update their account details.": "दर्ता भएका ग्राहक हेर्नुहोस् र खाता विवरण अद्यावधिक गर्नुहोस्।",
  "No registered customer accounts found.": "दर्ता भएका ग्राहक खाता भेटिएन।", "Edit details": "विवरण सम्पादन",
  "Customer details": "ग्राहक विवरण", "Your contact details help us coordinate service visits.": "तपाईंको सम्पर्क विवरणले सेवा भ्रमण मिलाउन मद्दत गर्छ।",
  "Home appliance care, made simple": "घरायसी उपकरण सेवा सजिलो बनाउँदै", "How can we help": "हामी कसरी सहयोग गर्न सक्छौँ",
  "your home today?": "आज तपाईंको घरमा?", "Choose an appliance, tell us what’s happening, and we’ll take it from there.": "उपकरण छान्नुहोस्, समस्या बताउनुहोस्, बाँकी हामी सम्हाल्छौँ।",
  "What needs attention?": "कुन उपकरणमा समस्या छ?", "Select an appliance to see what our technicians can help with.": "हाम्रा प्राविधिकको सेवा हेर्न उपकरण छान्नुहोस्।",
  "Your service history starts here": "तपाईंको सेवा इतिहास यहाँ सुरु हुन्छ", "Track visits and review your service history.": "भ्रमण र सेवा इतिहास हेर्नुहोस्।",
  "Contact number or email": "सम्पर्क नम्बर वा इमेल", "10-digit phone or email": "१० अङ्कको फोन वा इमेल",
  "For email or password changes, please call DHC support.": "इमेल वा पासवर्ड परिवर्तनका लागि DHC मा फोन गर्नुहोस्।",
  "Here’s what’s happening today.": "आजको अवस्था यहाँ छ।", "All calls planned, opened or closed today": "आजका सबै नियोजित, खुला वा बन्द कलहरू",
  "Customer": "ग्राहक", "Contact number": "सम्पर्क नम्बर", "Email": "इमेल", "Address": "ठेगाना", "Account": "खाता",
  "Edit": "सम्पादन", "Delete": "मेटाउनुहोस्", "Customer account deleted; service history retained.": "ग्राहक खाता हटाइयो; सेवा इतिहास सुरक्षित छ।",
  "Customer details updated.": "ग्राहक विवरण अद्यावधिक भयो।", "Set a new password": "नयाँ पासवर्ड राख्नुहोस्",
  "HOME APPLIANCE CARE, MADE SIMPLE": "घरायसी उपकरणको हेरचाह, सजिलो बनाउँदै",
  "Choose an appliance, tell us what’s happening, and we’ll take it from there.": "उपकरण छान्नुहोस् र समस्या बताउनुहोस्, त्यसपछि हामी सम्हाल्छौँ।",
  "Select an appliance to see what our technicians can help with.": "प्राविधिकले सेवा दिन सक्ने उपकरण छान्नुहोस्।",
};

export function useLanguage() {
  const [language, setCurrent] = useState(() => localStorage.getItem(KEY) || "en");
  useEffect(() => {
    const sync = () => setCurrent(localStorage.getItem(KEY) || "en");
    window.addEventListener("dhc-language-change", sync);
    return () => window.removeEventListener("dhc-language-change", sync);
  }, []);
  const setLanguage = (next) => {
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event("dhc-language-change"));
  };
  const t = (text) => language === "ne" ? (translations[text] || text) : text;
  return { language, setLanguage, t };
}

export function LanguageSwitch({ language, setLanguage, compact = false }) {
  return <label className={`language-switch${compact ? " is-compact" : ""}`}><span>文</span><select aria-label="Choose language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">EN</option><option value="ne">नेपाली</option></select></label>;
}
