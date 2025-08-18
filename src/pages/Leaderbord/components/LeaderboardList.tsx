import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { LeaderboardUserCard } from '../../../components/Leaderboard';
import { LeaderboardUser } from '../../../types/leaderboard';

const LeaderboardListContainer = styled('div')(({ theme }) => ({
  width: '100%',
  padding: 0,
  maxWidth: 1200,
  minWidth: 320,
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
  },
}));

interface LeaderboardListProps {
  leaderboardData: LeaderboardUser[];
  onCardClick: (user: LeaderboardUser) => void;
  onUserHover?: (user: LeaderboardUser | null) => void;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  leaderboardData,
  onCardClick,
  onUserHover,
}) => {
  return (
    <LeaderboardListContainer>
      {leaderboardData.map((user, index) => (
        <div
          key={user.id}
          onMouseEnter={() => onUserHover?.(user)}
          onMouseLeave={() => onUserHover?.(null)}
        >
          <LeaderboardUserCard
            user={user}
            position={index + 1}
            index={index}
            onCardClick={onCardClick}
          />
        </div>
      ))}
    </LeaderboardListContainer>
  );
};
