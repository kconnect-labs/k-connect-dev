import { useState, useCallback, useMemo, useRef } from 'react';
import {
  LyricsData,
  SyncedLyricLine,
  Track,
  LyricsUploadResponse,
} from '../types';

export const useLyrics = (
  trackId: number | undefined,
  currentTrack: Track | null
) => {
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsText, setLyricsText] = useState('');
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Мемоизированные отфильтрованные строки
  const filteredLines = useMemo((): SyncedLyricLine[] => {
    if (
      lyricsData?.has_synced_lyrics &&
      Array.isArray(lyricsData.synced_lyrics)
    ) {
      return lyricsData.synced_lyrics
        .filter(line => line && line.text !== undefined)
        .map((line, index) => ({
          ...line,
          key: `${index}-${line.text.slice(0, 10)}`,
        }));
    }
    if (lyricsData?.lyrics) {
      return lyricsData.lyrics
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          text: line,
          startTimeMs: 0,
          key: `static-${index}-${line.slice(0, 10)}`,
        }));
    }
    return [];
  }, [lyricsData]);

  // Загрузка текстов
  const loadLyrics = useCallback(async () => {
    if (!trackId) {
      setLyricsData(null);
      setLoadingLyrics(false);
      return;
    }

    setLoadingLyrics(true);
    setLyricsError(null);

    try {
      if (currentTrack?.lyricsData) {
        setLyricsData(currentTrack.lyricsData);
        setLoadingLyrics(false);
        return;
      }

      const response = await fetch(`/api/music/${trackId}/lyrics`);
      if (!response.ok) {
        throw new Error('Lyrics not found');
      }

      const data: LyricsData = await response.json();
      setLyricsData(data);

      if (currentTrack) {
        currentTrack.lyricsData = data;
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLyricsError('Не удалось загрузить текст песни');
      setLyricsData(null);
    } finally {
      setLoadingLyrics(false);
    }
  }, [trackId, currentTrack]);

  // Сохранение текстов
  const saveLyrics = useCallback(
    async (lyrics: string): Promise<boolean> => {
      if (!trackId) {
        setLyricsError('Трек не выбран');
        return false;
      }

      if (!lyrics.trim()) {
        setLyricsError('Текст песни не может быть пустым');
        return false;
      }

      setIsSaving(true);
      setLyricsError('');

      try {
        const response = await fetch(`/api/music/${trackId}/lyrics/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lyrics,
            source_url: 'manually_added',
          }),
        });

        const data: LyricsUploadResponse = await response.json();

        if (response.ok) {
          // Перезагружаем тексты после успешного сохранения
          await loadLyrics();
          return true;
        } else {
          setLyricsError(data.error || 'Не удалось сохранить текст');
          return false;
        }
      } catch (error) {
        console.error('Error saving lyrics:', error);
        setLyricsError(
          'Ошибка при сохранении текста. Пожалуйста, попробуйте еще раз.'
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [trackId, loadLyrics]
  );

  // Загрузка файла синхронизации
  const uploadSyncFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (!file || !trackId) {
        setLyricsError('Нет файла для загрузки или трек не выбран');
        return false;
      }

      setUploading(true);
      setLyricsError('');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/music/${trackId}/lyrics/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Не удалось загрузить файл синхронизации'
          );
        }

        // Перезагружаем тексты после успешной загрузки
        await loadLyrics();
        return true;
      } catch (error) {
        console.error('Error uploading sync file:', error);
        setLyricsError(
          `Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        );
        return false;
      } finally {
        setUploading(false);
      }
    },
    [trackId, loadLyrics]
  );

  // Создание шаблона LRC для скачивания
  const createLrcTemplate = useCallback(
    (lyrics: string): string => {
      if (!currentTrack) return '';

      const lines = lyrics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      let lrcContent = '[ti:' + (currentTrack.title || 'Unknown Title') + ']\n';
      lrcContent += '[ar:' + (currentTrack.artist || 'Unknown Artist') + ']\n';
      lrcContent += '[al:' + (currentTrack.album || 'Unknown Album') + ']\n';
      lrcContent += '[by:К-Коннект Авто-Генерация LRC]\n\n';

      lines.forEach(line => {
        lrcContent += '[00:00.00]' + line + '\n';
      });

      return lrcContent;
    },
    [currentTrack]
  );

  // Скачивание шаблона LRC
  const downloadLrcTemplate = useCallback(
    (lyrics: string) => {
      if (!trackId || !lyrics.trim() || !currentTrack) {
        setLyricsError('Нет доступного текста для скачивания');
        return;
      }

      try {
        const lrcContent = createLrcTemplate(lyrics);
        const lrcBlob = new Blob([lrcContent], { type: 'text/plain' });
        const lrcUrl = URL.createObjectURL(lrcBlob);
        const lrcLink = document.createElement('a');
        lrcLink.href = lrcUrl;
        lrcLink.download = `${currentTrack.artist} - ${currentTrack.title}.lrc`;

        lrcLink.click();

        setTimeout(() => {
          URL.revokeObjectURL(lrcUrl);
        }, 2000);
      } catch (error) {
        console.error('Error generating download template:', error);
        setLyricsError('Ошибка при создании шаблона для синхронизации');
      }
    },
    [trackId, currentTrack, createLrcTemplate]
  );

  // Обработка выбора файла
  const handleFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      uploadSyncFile(file);
    },
    [uploadSyncFile]
  );

  // Открытие селектора файлов
  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Инициализация текста для редактирования
  const initializeLyricsText = useCallback(() => {
    if (lyricsData?.has_lyrics && lyricsData.lyrics) {
      setLyricsText(lyricsData.lyrics);
    } else {
      setLyricsText('');
    }
  }, [lyricsData]);

  return {
    // Состояния
    lyricsData,
    loadingLyrics,
    lyricsText,
    lyricsError,
    isSaving,
    uploading,
    filteredLines,
    fileInputRef,

    // Методы
    loadLyrics,
    saveLyrics,
    uploadSyncFile,
    downloadLrcTemplate,
    handleFileSelected,
    openFileSelector,
    initializeLyricsText,

    // Сеттеры
    setLyricsData,
    setLoadingLyrics,
    setLyricsText,
    setLyricsError,
    setIsSaving,
    setUploading,
  };
};
