import React, { createContext, useContext, useState, useCallback } from 'react';
import EN from '@/Language/EN.json';
import RU from '@/Language/RU.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  
  const translations = {
    EN,
    RU
  };

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (!value || !value[k]) {
        console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
        return key;
      }
      value = value[k];
    }
    
    // Если значение - строка и есть параметры, выполняем интерполяцию
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }
    
    return value;
  }, [currentLanguage]);

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
    } else {
      console.warn(`Language ${lang} not supported`);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ t, currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 