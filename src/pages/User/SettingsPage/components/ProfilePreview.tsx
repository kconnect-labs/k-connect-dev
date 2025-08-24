import React from 'react';
import { Grid } from '@mui/material';
import ProfileCard from '../../ProfilePage/components/ProfileCard';

interface ProfilePreviewProps {
  displayUser: any;
  equippedItems: any[];
  isEditMode: boolean;
  isOnline: boolean;
  isCurrentUserModerator: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  ownedUsernames: string[];
  userBanInfo: any;
  fallbackAvatarUrl: string;
  t: (key: string) => string;
  getLighterColor: (color: string) => string;
  openLightbox: (imageUrl: string) => void;
  setFallbackAvatarUrl: (url: string) => void;
  handleItemPositionUpdate: (itemId: number, newPosition: { x: number; y: number }) => void;
  handleEditModeActivate: () => void;
  handleUsernameClick: (event: React.MouseEvent, username: string) => void;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = React.memo(({
  displayUser,
  equippedItems,
  isEditMode,
  isOnline,
  isCurrentUserModerator,
  postsCount,
  followersCount,
  followingCount,
  ownedUsernames,
  userBanInfo,
  fallbackAvatarUrl,
  t,
  getLighterColor,
  openLightbox,
  setFallbackAvatarUrl,
  handleItemPositionUpdate,
  handleEditModeActivate,
  handleUsernameClick,
}) => {
  return (
    <Grid
      item
      xs={12}
      lg={5}
      sx={{
        position: { xs: 'static', lg: 'sticky' },
        top: '50px',
        height: 'fit-content',
        zIndex: 2,
        order: { xs: 2, lg: 2 },
        display: { xs: 'none', lg: 'block' },
      }}
    >
      <ProfileCard
        user={displayUser}
        currentUser={displayUser}
        equippedItems={equippedItems}
        isOwnProfile={true}
        isEditMode={isEditMode}
        isOnline={isOnline}
        isCurrentUser={true}
        isCurrentUserModerator={isCurrentUserModerator}
        postsCount={postsCount}
        followersCount={followersCount}
        followingCount={followingCount}
        ownedUsernames={ownedUsernames}
        userBanInfo={userBanInfo}
        fallbackAvatarUrl={fallbackAvatarUrl}
        t={t}
        getLighterColor={getLighterColor}
        openLightbox={openLightbox}
        setFallbackAvatarUrl={setFallbackAvatarUrl}
        handleItemPositionUpdate={handleItemPositionUpdate}
        handleEditModeActivate={handleEditModeActivate}
        handleUsernameClick={handleUsernameClick}
      />
    </Grid>
  );
});

ProfilePreview.displayName = 'ProfilePreview';

export default ProfilePreview;
