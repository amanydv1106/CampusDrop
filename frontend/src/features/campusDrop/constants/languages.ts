export type LanguageOption = {
  nativeName: string;
  englishName?: string;
};

export const languageOptions: LanguageOption[] = [
  { nativeName: "English" },
  { nativeName: "Deutsch", englishName: "German" },
  { nativeName: "Espanol", englishName: "Spanish" },
  { nativeName: "Francais", englishName: "French" },
  { nativeName: "Italiano", englishName: "Italian" },
  { nativeName: "Nederlands", englishName: "Dutch" },
  { nativeName: "Portugues do Brasil", englishName: "Brazilian Portuguese" },
  { nativeName: "Romanian", englishName: "Romanian" },
  { nativeName: "Turkce", englishName: "Turkish" },
  { nativeName: "Ukrainian", englishName: "Ukrainian" },
  { nativeName: "Japanese", englishName: "Japanese" },
  { nativeName: "Korean", englishName: "Korean" }
];
