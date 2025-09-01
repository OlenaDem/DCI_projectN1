import i18next from "i18next";
import en from "../src/i18n/en";
import de from "../src/i18n/de";

export const resources = {
  en,
  de,
};

const savedLang: string = localStorage.getItem("language") || "en";

i18next
  .init({
    lng: savedLang,
    debug: true,
    resources,
  })
  .then(() => {
    translateAll(); // Translate immediately
    setLanguageSelector(); // Set the dropdown to current language
  });

function setLanguageSelector(): void {
  const switcher =
    document.querySelector<HTMLSelectElement>(".language-switcher");
  if (!switcher) return;

  switcher.value = i18next.language; // Set current language in dropdown

  switcher.addEventListener("change", (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;

    i18next.changeLanguage(lang).then(() => {
      localStorage.setItem("language", lang); // Save selected language
      translateAll();
    });
  });
}

function translateAll(): void {
  const translateTargets = document.querySelectorAll<HTMLElement>("[data-t]");
  translateTargets.forEach((el) => {
    const key = el.getAttribute("data-t");
    if (key) {
      el.textContent = i18next.t(key);
    }
  });
}

type Entry = {
  name: string;
  email: string;
  phone: string;
  date: string;
  timestamp: string;
};

const form = document.querySelector<HTMLFormElement>("#userForm")!;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const entry: Entry = {
    name: document.querySelector<HTMLInputElement>("#nameInput")!.value.trim(),
    email: document
      .querySelector<HTMLInputElement>("#emailInput")!
      .value.trim(),
    phone: document
      .querySelector<HTMLInputElement>("#phoneInput")!
      .value.trim(),
    date: document.querySelector<HTMLInputElement>("#dateInput")!.value,
    timestamp: new Date().toISOString(),
  };

  // Get existing entries from localStorage
  const existingData = localStorage.getItem("formEntries");
  const entries: Entry[] = existingData ? JSON.parse(existingData) : [];

  // Add new entry
  entries.push(entry);

  // Save back to localStorage
  localStorage.setItem("formEntries", JSON.stringify(entries));

  alert("Entry saved locally!");
  form.reset();
});
