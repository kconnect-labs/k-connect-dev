import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { RequireAuth } from '../App';
import { LoadingIndicator } from '../components/Loading/LoadingComponents';

// Lazy imports
const RegisterProfile = React.lazy(() => import('../pages/Auth/RegisterProfile'));
const RegisterChannel = React.lazy(() => import('../pages/Auth/RegisterChannel'));
const EmailConfirmation = React.lazy(() => import('../pages/Auth/EmailConfirmation'));
const ProfilePage = React.lazy(() => import('../pages/User/ProfilePage'));
const MainPage = React.lazy(() => import('../pages/Main/MainPage'));
const PostDetailPage = React.lazy(() => import('../pages/Main/PostDetailPage'));
const SettingsPage = React.lazy(() => import('../pages/User/SettingsPage'));
const NotificationsPage = React.lazy(() => import('../pages/Info/NotificationsPage'));
const SearchPage = React.lazy(() => import('../pages/Main/SearchPage'));
const MusicPage = React.lazy(() => import('../pages/MusicPage/MusicPage.js'));
const ArtistPage = React.lazy(() => import('../pages/Main/ArtistPage'));
const MessengerPage = React.lazy(() => import('../pages/Messenger/MessengerPage'));
const SubscriptionsPage = React.lazy(() => import('../pages/Economic/SubscriptionsPage'));
const BugReportPage = React.lazy(() => import('../pages/BugPages/BugReportPage'));
const LeaderboardPage = React.lazy(() => import('../pages/Main/LeaderboardPage'));
const RulesPage = React.lazy(() => import('../pages/Info/RulesPage'));
const PrivacyPolicyPage = React.lazy(() => import('../pages/Info/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('../pages/Info/TermsOfServicePage'));
const MorePage = React.lazy(() => import('../pages/Main/MorePage'));
const NotFound = React.lazy(() => import('../pages/Info/NotFound'));
const AdminPage = React.lazy(() => import('../pages/Admin/AdminPage'));
const ModeratorPage = React.lazy(() => import('../pages/Admin/ModeratorPage'));
const UpdatesPage = React.lazy(() => import('../pages/Main/UpdatesPage'));
const BadgeShopPage = React.lazy(() => import('../pages/Economic/BadgeShopPage'));
const BalancePage = React.lazy(() => import('../pages/Economic/BalancePage'));
const UsernameAuctionPage = React.lazy(() => import('../pages/Economic/UsernameAuctionPage'));
const InventoryPackPage = React.lazy(() => import('../pages/Economic/components/inventoryPack/InventoryPackPage'));
const InventoryPage = React.lazy(() => import('../pages/Economic/components/inventoryPack/InventoryPage'));
const MarketplacePage = React.lazy(() => import('../pages/Economic/components/marketplace/MarketplacePage'));
const GrantsPage = React.lazy(() => import('../pages/Economic/components/grantPage/GrantsPage'));
const SimpleApiDocsPage = React.lazy(() => import('../pages/Info/SimpleApiDocsPage'));
const SubPlanes = React.lazy(() => import('../pages/Economic/SubPlanes'));
const AboutPage = React.lazy(() => import('../pages/Info/AboutPage'));
const LikedTracksPage = React.lazy(() => import('../pages/MusicPage/components/LikedTracksPage'));
const AllTracksPage = React.lazy(() => import('../pages/MusicPage/AllTracksPage'));
const PlaylistsPage = React.lazy(() => import('../pages/MusicPage/PlaylistsPage'));
const FriendsPage = React.lazy(() => import('../pages/User/FriendsPage'));
const StickerManagePage = React.lazy(() => import('../pages/Info/StickerManagePage'));
const StreetBlacklistPage = React.lazy(() => import('../pages/Collab/StreetBlacklistPage'));
const StreetBlacklistV1Page = React.lazy(() => import('../pages/Collab/StreetBlacklistV1Page'));
const MiniGamesPage = React.lazy(() => import('../pages/MiniGames/MiniGamesPage'));
const CupsGamePage = React.lazy(() => import('../pages/MiniGames/CupsGamePage'));
const BlackjackPage = React.lazy(() => import('../pages/MiniGames/BlackjackPage'));
const ChannelsPage = React.lazy(() => import('../pages/Main/ChannelsPage'));
const JoinGroupChat = React.lazy(() => import('../pages/Messenger/JoinGroupChat'));
const ItemRedirectPage = React.lazy(() => import('../components/Redirects/ItemRedirectPage').then(module => ({ default: module.ItemRedirectPage })));
const FriendsRedirect = React.lazy(() => import('../components/Redirects/FriendsRedirect').then(module => ({ default: module.FriendsRedirect })));

const MainRoutes = ({ setUser, background }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  return (
    <MainLayout>
      <React.Suspense fallback={<LoadingIndicator />}>
        <Routes location={background || location}>
          <Route path="/register/profile" element={<RegisterProfile setUser={setUser} />} />
          <Route path="/register/channel" element={<RegisterChannel />} />
          <Route path="/confirm-email/:token" element={<EmailConfirmation />} />                    
          <Route path="/" element={
            loading ? (
              <LoadingIndicator />
            ) : isAuthenticated ? (
              <MainPage />
            ) : (
              <Navigate to="/login" replace state={{ from: location.pathname }} />
            )
          } />
          <Route path="/feed" element={<Navigate to="/" replace />} />
          <Route path="/main" element={<Navigate to="/" replace />} />                  
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/followers" element={isAuthenticated ? <SubscriptionsPage tabIndex={0} /> : <Navigate to="/login" replace />} />
          <Route path="/profile/:username/following" element={isAuthenticated ? <SubscriptionsPage tabIndex={1} /> : <Navigate to="/login" replace />} />
          <Route path="/subscriptions" element={isAuthenticated ? <SubscriptionsPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />} />
          <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" replace />} />
          <Route path="/music" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/liked" element={isAuthenticated ? <LikedTracksPage onBack={() => window.history.back()} /> : <Navigate to="/login" replace />} />
          <Route path="/music/all" element={isAuthenticated ? <AllTracksPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/playlists" element={isAuthenticated ? <PlaylistsPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/:section" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/track/:trackId" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/artist/:artistParam" element={isAuthenticated ? <ArtistPage /> : <Navigate to="/login" replace />} />
          <Route path="/messenger" element={isAuthenticated ? <MessengerPage /> : <Navigate to="/login" replace />} />
          <Route path="/messenger/join/:inviteCode" element={isAuthenticated ? <JoinGroupChat /> : <Navigate to="/login" replace />} />
          <Route path="/bugs" element={<BugReportPage />} />
          <Route path="/leaderboard" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />          
          <Route path="/more" element={isAuthenticated ? <MorePage /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path="/moderator" element={isAuthenticated ? <ModeratorPage /> : <Navigate to="/login" replace />} />
          <Route path="/badge-shop" element={isAuthenticated ? <BadgeShopPage /> : <Navigate to="/login" replace />} />
          <Route path="/username-auction" element={isAuthenticated ? <UsernameAuctionPage /> : <Navigate to="/login" replace />} />         
          <Route path="/economic/packs" element={isAuthenticated ? <InventoryPackPage /> : <Navigate to="/login" replace />} />
          <Route path="/economic/inventory" element={isAuthenticated ? <InventoryPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames" element={isAuthenticated ? <MiniGamesPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/cups" element={isAuthenticated ? <CupsGamePage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/blackjack" element={isAuthenticated ? <BlackjackPage /> : <Navigate to="/login" replace />} />
          <Route path="/balance" element={isAuthenticated ? <BalancePage /> : <Navigate to="/login" replace />} />
          <Route path="/documentapi" element={isAuthenticated ? <SimpleApiDocsPage /> : <Navigate to="/login" replace />} />
          <Route path="/sub-planes" element={isAuthenticated ? <SubPlanes /> : <Navigate to="/login" replace />} />
          <Route path="/channels" element={<RequireAuth><ChannelsPage /></RequireAuth>} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/badge/:badgeId" element={<Navigate to="/badge-shop" replace state={{ openBadgeId: (location.pathname.match(/\/badge\/(\d+)/)?.[1] || null) }} />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/grant" element={isAuthenticated ? <GrantsPage /> : <Navigate to="/login" replace />} />
          <Route path="/item/:itemId" element={<ItemRedirectPage />} />
          <Route path="/friends/:username" element={<FriendsPage />} />
          <Route path="/friends" element={<FriendsRedirect />} />
          <Route path="/inform/sticker" element={isAuthenticated ? <StickerManagePage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>                
        {background && (
          <Routes>
            <Route 
              path="/post/:postId" 
              element={<PostDetailPage isOverlay={true} />} 
            />
          </Routes>
        )}
      </React.Suspense>
    </MainLayout>
  );
};

export default MainRoutes; 