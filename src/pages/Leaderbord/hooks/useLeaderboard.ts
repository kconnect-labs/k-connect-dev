import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LeaderboardUser, 
  LeaderboardResponse, 
  TimePeriod, 
  DateRange 
} from '../../../types/leaderboard';

const API_URL = '';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axios.get<LeaderboardResponse>(
          `${API_URL}/api/leaderboard?period=${timePeriod}`
        );
        if (response.data.success) {
          setLeaderboardData(response.data.leaderboard);
          setUserPosition(response.data.current_user.position);
          setUserScore(response.data.current_user.score);

          if (response.data.date_range) {
            setDateRange(response.data.date_range);
          } else {
            setDateRange(null);
          }
        } else {
          setError('Не удалось загрузить данные лидерборда');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(`Ошибка: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timePeriod]);

  const handleTimePeriodChange = (event: React.SyntheticEvent, newValue: TimePeriod): void => {
    setTimePeriod(newValue);
  };

  return {
    leaderboardData,
    loading,
    error,
    timePeriod,
    userPosition,
    userScore,
    dateRange,
    handleTimePeriodChange,
  };
};
