import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Default to browser language
      const browserLang = navigator.language.split("-")[0];
      if (LANGUAGES.some(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem("language", languageCode);
    setIsOpen(false);
    // In a real app, you would trigger a re-render of the UI with the new language
    // and potentially reload translated content
    console.log(`Language changed to: ${languageCode}`);
  };

  const currentLanguageData = LANGUAGES.find(lang => lang.code === currentLanguage);

  return (
    <div className="flex items-center space-x-2">
      <Select 
        value={currentLanguage} 
        onValueChange={handleLanguageChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0">
          <SelectValue>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="flex items-center">
                {currentLanguageData?.flag}
                <span className="ml-2">{currentLanguageData?.name}</span>
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center">
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
                {language.code === currentLanguage && (
                  <span className="ml-2 text-xs text-muted-foreground">(Current)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;