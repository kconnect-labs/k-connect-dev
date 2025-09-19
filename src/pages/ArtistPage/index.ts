// Экспорт основного компонента
export { default } from './ArtistPage';

// Экспорт типов
export type * from './types';

// Экспорт хуков
export { useArtistData } from './hooks/useArtistData';
export { useArtistActions } from './hooks/useArtistActions';

// Экспорт компонентов (если нужны для переиспользования)
export { default as ArtistHeader } from './components/ArtistHeader';
export { default as ArtistBiography } from './components/ArtistBiography';
export { default as TrackSection } from './components/TrackSection';
export { default as TrackList } from './components/TrackList';
export { default as FeaturedTrackGrid } from './components/FeaturedTrackGrid';
export { default as NotFoundCard } from './components/NotFoundCard';
export { default as LoadingState, DetailedLoadingState } from './components/LoadingState';
export { default as ErrorState } from './components/ErrorState';
