import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useMusic } from '../../../context/MusicContext';
import apiClient from '../../../services/axiosConfig';
import './charts-block.css';

const ChartsBlock = () => {
  const { playTrack, isPlaying, currentTrack, togglePlay } = useMusic();
  const [charts, setCharts] = useState({
    most_played: [],
    trending: [],
    most_liked: [],
    new_releases: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchCharts(); }, []);

  const fetchCharts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/music/charts');
      if (response.data.success && response.data.charts) {
        setCharts(response.data.charts);
      } else {
        setError('Не удалось загрузить чарты');
      }
    } catch (err) {
      setError('Ошибка при загрузке чартов');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlayTrack = useCallback((track, chartType = null) => {
    if (isPlaying && currentTrack?.id === track.id) {
      togglePlay();
    } else {
      let section = 'all';
      if (chartType === 'most_played' || chartType === 'trending') section = 'popular';
      else if (chartType === 'new_releases') section = 'new';
      else if (chartType === 'most_liked') section = 'liked';
      playTrack(track, section);
    }
  }, [isPlaying, currentTrack, playTrack, togglePlay]);

  const handleLikeTrack = async (trackId) => {
    try {
      const response = await apiClient.post(`/api/music/${trackId}/like`);
      if (response.data.success) {
        setCharts(prevCharts => {
          const updateTracks = (tracks) =>
            tracks.map(track =>
              track.id === trackId
                ? { ...track, is_liked: !track.is_liked, likes_count: response.data.likes_count }
                : track
            );
          return {
            most_played: updateTracks(prevCharts.most_played),
            trending: updateTracks(prevCharts.trending),
            most_liked: updateTracks(prevCharts.most_liked),
            new_releases: updateTracks(prevCharts.new_releases)
          };
        });
      }
    } catch (err) {}
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderChartSection = (title, icon, tracks, chartType) => {
    if (!tracks || tracks.length === 0) return null;
    return (
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-header-icon">{icon}</span>
          <span className="chart-header-title">{title}</span>
        </div>
        <ul className="chart-track-list">
          {tracks.slice(0, 5).map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isTrackPlaying = isPlaying && isCurrentTrack;
            return (
              <li
                className={`chart-track-item${isCurrentTrack ? ' active' : ''}`}
                key={track.id}
                onClick={() => handlePlayTrack(track, chartType)}
              >
                <img className="track-avatar" src={track.cover_path} alt={track.title} />
                <div className="track-info">
                  <div className="track-title" title={track.title}>{track.title}</div>
                  <div className="track-artist" title={track.artist}>{track.artist}</div>
                  <div className="track-meta">
                    <Icon icon="solar:clock-circle-bold" width={16} height={16} className="meta-icon" />
                    <span className="track-duration">{formatDuration(track.duration)}</span>
                    {track.genre && <><span className="dot">•</span><span className="track-genre">{track.genre}</span></>}
                  </div>
                </div>
                <div className="track-actions">
                  <button
                    className={`like-btn${track.is_liked ? ' liked' : ''}`}
                    title={track.is_liked ? 'Убрать из любимых' : 'В любимое'}
                    onClick={e => { e.stopPropagation(); handleLikeTrack(track.id); }}
                  >
                    <Icon icon={track.is_liked ? 'solar:heart-bold' : 'solar:heart-outline'} width={22} height={22} />
                  </button>
                  <button
                    className={`play-btn${isCurrentTrack ? ' playing' : ''}`}
                    title={isTrackPlaying ? 'Пауза' : 'Слушать'}
                    onClick={e => { e.stopPropagation(); handlePlayTrack(track, chartType); }}
                  >
                    <Icon icon={isTrackPlaying ? 'solar:pause-bold' : 'solar:play-bold'} width={22} height={22} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="charts-block-loading">
        <Icon icon="svg-spinners:90-ring-with-bg" width={36} height={36} />
      </div>
    );
  }
  if (error) return null;

  // Мобильная версия — списком
  if (window.innerWidth < 900) {
    return (
      <div className="charts-block">
        {renderChartSection(
          'Популярные треки',
          <Icon icon="solar:trending-up-bold" width={22} height={22} />, charts.most_played, 'most_played')}
        {renderChartSection(
          'Новинки',
          <Icon icon="solar:music-note-2-bold" width={22} height={22} />, charts.new_releases, 'new_releases')}
      </div>
    );
  }
  // Десктоп — две колонки
  return (
    <div className="charts-block charts-block-desktop">
      <div className="charts-block-col">
        {renderChartSection(
          'Популярные треки',
          <Icon icon="solar:trending-up-bold" width={22} height={22} />, charts.most_played, 'most_played')}
      </div>
      <div className="charts-block-col">
        {renderChartSection(
          'Новинки',
          <Icon icon="solar:music-note-2-bold" width={22} height={22} />, charts.new_releases, 'new_releases')}
      </div>
    </div>
  );
};

export default ChartsBlock; 