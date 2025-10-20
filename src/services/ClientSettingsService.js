import axios from 'axios';

class ClientSettingsService {
  constructor() {
    this.settings = this.loadFromLocalStorage();
  }

  // Загрузка настроек из localStorage
  loadFromLocalStorage() {
    const defaultSettings = {
      player_sidebar: 1,
      ads: 1,
      update: 1,
      sidebar_version: 'v1',
      global_profile_bg: false
    };

    try {
      const stored = localStorage.getItem('clientSettings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading client settings from localStorage:', error);
    }

    return defaultSettings;
  }

  // Сохранение настроек в localStorage
  saveToLocalStorage(settings) {
    try {
      localStorage.setItem('clientSettings', JSON.stringify(settings));
      this.settings = settings;
    } catch (error) {
      console.error('Error saving client settings to localStorage:', error);
    }
  }

  // Загрузка настроек с сервера
  async loadFromServer() {
    try {
      const response = await axios.get('/api/user/settings/client');
      if (response.data && response.data.success) {
        const serverSettings = {
          player_sidebar: response.data.player_sidebar,
          ads: response.data.ads,
          update: response.data.update,
          sidebar_version: response.data.sidebar_version,
          global_profile_bg: response.data.global_profile_bg,
          background_url: response.data.background_url
        };
        this.saveToLocalStorage(serverSettings);
        return serverSettings;
      }
    } catch (error) {
      console.error('Error loading client settings from server:', error);
    }
    return this.settings;
  }

  // Обновление настроек на сервере
  async updateOnServer(settings) {
    try {
      // Отправляем только те настройки, которые есть в API
      const apiSettings = {
        player_sidebar: settings.player_sidebar,
        ads: settings.ads,
        update: settings.update,
        sidebar_version: settings.sidebar_version,
        global_profile_bg: settings.global_profile_bg
      };
      
      console.log('Sending settings to server:', apiSettings);
      console.log('API URL: /api/user/settings/client');
      
      const response = await axios.post('/api/user/settings/client', apiSettings);
      console.log('Server response status:', response.status);
      console.log('Server response data:', response.data);
      
      if (response.data && response.data.success) {
        // Обновляем локальные настройки с данными с сервера
        const updatedSettings = {
          ...settings,
          sidebar_version: response.data.sidebar_version,
          global_profile_bg: response.data.global_profile_bg,
          background_url: response.data.background_url
        };
        this.saveToLocalStorage(updatedSettings);
        console.log('Settings saved to localStorage:', updatedSettings);
        return true;
      } else {
        console.log('Server returned success: false');
        return false;
      }
    } catch (error) {
      console.error('Error updating client settings on server:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return false;
    }
  }

  // Получение текущих настроек
  getSettings() {
    return this.settings;
  }

  // Обновление конкретной настройки
  async updateSetting(key, value) {
    console.log(`ClientSettingsService: Updating ${key} to ${value}`);
    const newSettings = { ...this.settings, [key]: value };
    console.log('ClientSettingsService: New settings:', newSettings);
    
    // Сначала обновляем локально
    this.saveToLocalStorage(newSettings);
    console.log('ClientSettingsService: Saved to localStorage');
    
    // Затем отправляем на сервер
    console.log('ClientSettingsService: Calling updateOnServer...');
    const success = await this.updateOnServer(newSettings);
    console.log('ClientSettingsService: updateOnServer result:', success);
    
    if (!success) {
      // Если не удалось обновить на сервере, откатываем локальные изменения
      console.log('ClientSettingsService: Server update failed, reverting...');
      this.loadFromLocalStorage();
    }
    
    return success;
  }

  // Получение конкретной настройки
  getSetting(key) {
    return this.settings[key];
  }

  // Проверка включена ли настройка
  isEnabled(key) {
    return this.settings[key] === 1 || this.settings[key] === true;
  }

  // Включение/выключение настройки
  async toggleSetting(key) {
    const currentValue = this.settings[key];
    const newValue = currentValue === 1 ? 0 : 1;
    return await this.updateSetting(key, newValue);
  }
}

// Создаем единственный экземпляр сервиса
const clientSettingsService = new ClientSettingsService();

export default clientSettingsService;
