import React from 'react';

export interface MobilePlayerProps {
  isMobile?: boolean;
  isModalOpen?: boolean;
}

declare const MobilePlayer: React.ComponentType<MobilePlayerProps>;

export default MobilePlayer;
