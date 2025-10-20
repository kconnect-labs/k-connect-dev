import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import clientSettingsService from '../services/ClientSettingsService';

interface ClientSettings {
  player_sidebar: number;
  ads: number;
  update: number;
  sidebar_version: string;
  global_profile_bg: boolean;
  background_url?: string;
}

interface ClientSettingsContextType {
  settings: ClientSettings;
  loading: boolean;
  updateSetting: (key: keyof ClientSettings, value: any) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const ClientSettingsContext = createContext<ClientSettingsContextType | undefined>(undefined);

interface ClientSettingsProviderProps {
  children: ReactNode;
}

export const ClientSettingsProvider: React.FC<ClientSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ClientSettings>({
    player_sidebar: 1,
    ads: 1,
    update: 1,
    sidebar_version: 'v1',
    global_profile_bg: false,
    background_url: undefined
  });
  const [loading, setLoading] = useState(true);

  // Загружаем настройки при инициализации
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Сначала проверяем localStorage
        const localSettings = clientSettingsService.getSettings();
        console.log('Local settings from localStorage:', localSettings);
        if (localSettings && Object.keys(localSettings).length > 0) {
          setSettings(localSettings);
        }
        
        // Затем загружаем с сервера
        const clientSettings = await clientSettingsService.loadFromServer();
        setSettings(clientSettings);
      } catch (error) {
        console.error('Error loading client settings:', error);
        // Используем настройки из localStorage как fallback
        const localSettings = clientSettingsService.getSettings();
        setSettings(localSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Функция для обновления настройки
  const updateSetting = async (key: keyof ClientSettings, value: any): Promise<boolean> => {
    try {
      console.log(`ClientSettingsContext: Updating setting ${key} to ${value}`);
      console.log('ClientSettingsContext: Current settings:', settings);
      
      // Обновляем локально сразу для оптимистичного UI
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      console.log('ClientSettingsContext: Updated local settings:', newSettings);
      
      // Отправляем на сервер через сервис
      console.log('ClientSettingsContext: Calling clientSettingsService.updateSetting...');
      const success = await clientSettingsService.updateSetting(key, value);
      console.log('ClientSettingsContext: Service updateSetting result:', success);
      
      if (success) {
        // Обновляем состояние из сервиса после успешного обновления
        const updatedSettings = clientSettingsService.getSettings();
        setSettings(updatedSettings);
        console.log('ClientSettingsContext: Updated settings from service:', updatedSettings);
        
        // Отправляем события для обновления других компонентов
        if (key === 'player_sidebar') {
          const event = new CustomEvent('sidebarPlayerToggled', { 
            detail: { enabled: value === 1 } 
          });
          document.dispatchEvent(event);
          console.log('ClientSettingsContext: Dispatched sidebarPlayerToggled event');
        }
        
        if (key === 'sidebar_version') {
          const event = new CustomEvent('sidebarVersionChanged', { 
            detail: { version: value } 
          });
          document.dispatchEvent(event);
          console.log('ClientSettingsContext: Dispatched sidebarVersionChanged event');
        }
      } else {
        // Если не удалось обновить на сервере, откатываем изменения
        const revertedSettings = clientSettingsService.getSettings();
        setSettings(revertedSettings);
        console.log('ClientSettingsContext: Reverted settings due to server error:', revertedSettings);
        return false;
      }
      
      return success;
    } catch (error) {
      console.error('ClientSettingsContext: Error updating setting:', error);
      // Откатываем изменения при ошибке
      const revertedSettings = clientSettingsService.getSettings();
      setSettings(revertedSettings);
      return false;
    }
  };

  // Функция для обновления настроек
  const refreshSettings = async (): Promise<void> => {
    try {
      const clientSettings = await clientSettingsService.loadFromServer();
      setSettings(clientSettings);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  const contextValue: ClientSettingsContextType = {
    settings,
    loading,
    updateSetting,
    refreshSettings
  };

  return (
    <ClientSettingsContext.Provider value={contextValue}>
      {children}
    </ClientSettingsContext.Provider>
  );
};

export const useClientSettings = (): ClientSettingsContextType => {
  const context = useContext(ClientSettingsContext);
  if (context === undefined) {
    throw new Error('useClientSettings must be used within a ClientSettingsProvider');
  }
  return context;
};
