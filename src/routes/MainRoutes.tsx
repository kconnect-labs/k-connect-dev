import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import MainLayout from '../components/Layout/MainLayout';
import { RequireAuth } from '../App';
import { LoadingIndicator } from '../components/Loading/LoadingComponents';

interface User {
  id: number;
  username: string;
  [key: string]: any;
}

interface MainRoutesProps {
  setUser: (user: User | null) => void;
  background?: any;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface ProfileRequiredRouteProps {
  children: React.ReactNode;
}

// Lazy imports
const ProfilePage = React.lazy(() => import('../pages/User/ProfilePage'));
const MainPage = React.lazy(() => import('../pages/Main/MainPage'));
const PostDetailPage = React.lazy(() => import('../pages/Main/PostDetailPage'));
const SettingsPage = React.lazy(() => import('../pages/User/SettingsPage'));
const NotificationsPage = React.lazy(
  () => import('../pages/Info/NotificationsPage')
);
const SearchPage = React.lazy(() => import('../pages/Main/SearchPage'));
const MusicPage = React.lazy(() => import('../pages/MusicPage/MusicPage.js'));
const ArtistPage = React.lazy(() => import('../pages/Main/ArtistPage'));
const MessengerPage = React.lazy(
  () => import('../pages/Messenger/MessengerPage')
);
const SubscriptionsPage = React.lazy(
  () => import('../pages/Economic/SubscriptionsPage')
) as React.LazyExoticComponent<React.ComponentType<{ tabIndex?: number }>>;
const BugReportPage = React.lazy(
  () => import('../pages/BugPages/BugReportPage')
);
const LeaderboardPage = React.lazy(
  () => import('../pages/Main/LeaderboardPage')
);
const RulesPage = React.lazy(() => import('../pages/Info/RulesPage'));
const PrivacyPolicyPage = React.lazy(
  () => import('../pages/Info/PrivacyPolicyPage')
);
const TermsOfServicePage = React.lazy(
  () => import('../pages/Info/TermsOfServicePage')
);
const MorePage = React.lazy(() => import('../pages/Main/MorePage'));
const NotFound = React.lazy(() => import('../pages/Info/NotFound'));
const AdminPage = React.lazy(() => import('../pages/Admin/AdminPage'));
const ModeratorPage = React.lazy(() => import('../pages/Admin/ModeratorPage'));
const UpdatesPage = React.lazy(() => import('../pages/Main/UpdatesPage'));
const BadgeShopPage = React.lazy(
  () => import('../pages/Economic/BadgeShopPage')
);
const BalancePage = React.lazy(() => import('../pages/Economic/BalancePage'));
const UsernameAuctionPage = React.lazy(
  () => import('../pages/Economic/UsernameAuction/UsernameAuctionPage')
);
const InventoryPackPage = React.lazy(
  () => import('../pages/Economic/components/inventoryPack/InventoryPackPage')
);
const InventoryPage = React.lazy(
  () => import('../pages/Economic/components/inventoryPack/InventoryPage')
);
const MarketplacePage = React.lazy(
  () => import('../pages/Economic/components/marketplace/MarketplacePage')
);
const GrantsPage = React.lazy(
  () => import('../pages/Economic/components/grantPage/GrantsPage')
);
const SimpleApiDocsPage = React.lazy(
  () => import('../pages/Info/SimpleApiDocsPage')
);
const SubPlanes = React.lazy(() => import('../pages/Economic/SubPlanes'));
const AboutPage = React.lazy(() => import('../pages/Info/AboutPage'));
const LikedTracksPage = React.lazy(
  () => import('../pages/MusicPage/components/LikedTracksPage')
);
const AllTracksPage = React.lazy(
  () => import('../pages/MusicPage/AllTracksPage')
);
const PlaylistsPage = React.lazy(
  () => import('../pages/MusicPage/PlaylistsPage')
);
const FriendsPage = React.lazy(() => import('../pages/User/FriendsPage'));
const StickerManagePage = React.lazy(
  () => import('../pages/Info/StickerManagePage')
);
const StreetBlacklistPage = React.lazy(
  () => import('../pages/Collab/StreetBlacklistPage')
);
const StreetBlacklistV1Page = React.lazy(
  () => import('../pages/Collab/StreetBlacklistV1Page')
);
const MiniGamesPage = React.lazy(
  () => import('../pages/MiniGames/MiniGamesPage')
);
const CupsGamePage = React.lazy(
  () => import('../pages/MiniGames/CupsGamePage')
);
const BlackjackPage = React.lazy(
  () => import('../pages/MiniGames/BlackjackPage')
);
const ChannelsPage = React.lazy(() => import('../pages/Main/ChannelsPage'));
const JoinGroupChat = React.lazy(
  () => import('../pages/Messenger/JoinGroupChat')
);
const ItemRedirectPage = React.lazy(() =>
  import('../components/Redirects/ItemRedirectPage').then(module => ({
    default: module.ItemRedirectPage,
  }))
);
const FriendsRedirect = React.lazy(() =>
  import('../components/Redirects/FriendsRedirect').then(module => ({
    default: module.FriendsRedirect,
  }))
);
const ReferralPage = React.lazy(() => import('../pages/ReferralPage'));

const MainRoutes: React.FC<MainRoutesProps> = ({ setUser, background }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Вспомогательная функция для проверки профиля
  const hasProfile = (): boolean => {
    return user ? !!((user as User).username && (user as User).id) : false;
  };

  // Компонент для защищенных роутов с проверкой профиля
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    // Если пользователь аутентифицирован, но у него нет профиля, и мы не на страницах регистрации
    if (!hasProfile() && !location.pathname.includes('/register/')) {
      return <Navigate to='/register/profile' replace />;
    }

    return <>{children}</>;
  };

  // Компонент для роутов, которые требуют профиль
  const ProfileRequiredRoute: React.FC<ProfileRequiredRouteProps> = ({
    children,
  }) => {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    if (!hasProfile()) {
      return <Navigate to='/register/profile' replace />;
    }

    return <>{children}</>;
  };

  return (
    <MainLayout>
      <React.Suspense fallback={<LoadingIndicator />}>
        <Routes location={background || location}>
          <Route
            path='/'
            element={
              loading ? (
                <LoadingIndicator />
              ) : isAuthenticated ? (
                hasProfile() ? (
                  <MainPage />
                ) : (
                  <Navigate to='/register/profile' replace />
                )
              ) : (
                <Navigate to='/login' replace state={{ from: location.pathname }} />
              )
            }
          />
          <Route path='/feed' element={<Navigate to='/' replace />} />
          <Route path='/main' element={<Navigate to='/' replace />} />
          <Route path='/post/:postId' element={<PostDetailPage />} />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile/:username'
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile/:username/followers'
            element={
              <ProtectedRoute>
                <SubscriptionsPage tabIndex={0} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile/:username/following'
            element={
              <ProtectedRoute>
                <SubscriptionsPage tabIndex={1} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/subscriptions'
            element={
              <ProtectedRoute>
                <SubscriptionsPage tabIndex={0} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/notifications'
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/search'
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music'
            element={
              <ProtectedRoute>
                <MusicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music/liked'
            element={
              <ProtectedRoute>
                <LikedTracksPage onBack={() => window.history.back()} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music/all'
            element={
              <ProtectedRoute>
                <AllTracksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music/playlists'
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music/:section'
            element={
              <ProtectedRoute>
                <MusicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/music/track/:trackId'
            element={
              loading ? (
                <LoadingIndicator />
              ) : isAuthenticated ? (
                hasProfile() ? (
                  <MusicPage />
                ) : (
                  <Navigate to='/register/profile' replace />
                )
              ) : (
                <Navigate
                  to='/login'
                  replace
                  state={{ from: location.pathname }}
                />
              )
            }
          />
          <Route
            path='/artist/:artistParam'
            element={
              <ProtectedRoute>
                <ArtistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/messenger'
            element={
              <ProtectedRoute>
                <MessengerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/messenger/join/:inviteCode'
            element={
              <ProtectedRoute>
                <JoinGroupChat />
              </ProtectedRoute>
            }
          />
          <Route path='/bugs' element={<BugReportPage />} />
          <Route
            path='/leaderboard'
            element={
              <RequireAuth>
                <LeaderboardPage />
              </RequireAuth>
            }
          />
          <Route
            path='/more'
            element={
              <ProtectedRoute>
                <MorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin'
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/moderator'
            element={
              <ProtectedRoute>
                <ModeratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/badge-shop'
            element={
              <ProtectedRoute>
                <BadgeShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/username-auction'
            element={
              <ProtectedRoute>
                <UsernameAuctionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/economic/packs'
            element={
              <ProtectedRoute>
                <InventoryPackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/economic/inventory'
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/minigames'
            element={
              <ProtectedRoute>
                <MiniGamesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/minigames/cups'
            element={
              <ProtectedRoute>
                <CupsGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/minigames/blackjack'
            element={
              <ProtectedRoute>
                <BlackjackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/balance'
            element={
              <ProtectedRoute>
                <BalancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/documentapi'
            element={
              <ProtectedRoute>
                <SimpleApiDocsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/sub-planes'
            element={
              <ProtectedRoute>
                <SubPlanes />
              </ProtectedRoute>
            }
          />
          <Route
            path='/channels'
            element={
              <RequireAuth>
                <ChannelsPage />
              </RequireAuth>
            }
          />
          <Route path='/updates' element={<UpdatesPage />} />
          <Route
            path='/badge/:badgeId'
            element={
              <Navigate
                to='/badge-shop'
                replace
                state={{
                  openBadgeId:
                    location.pathname.match(/\/badge\/(\d+)/)?.[1] || null,
                }}
              />
            }
          />
          <Route path='/marketplace' element={<MarketplacePage />} />
          <Route
            path='/grant'
            element={
              <ProtectedRoute>
                <GrantsPage />
              </ProtectedRoute>
            }
          />
          <Route path='/item/:itemId' element={<ItemRedirectPage />} />
          <Route path='/friends/:username' element={<FriendsPage />} />
          <Route path='/friends' element={<FriendsRedirect />} />
          <Route
            path='/referral'
            element={
              <ProtectedRoute>
                <ReferralPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/inform/sticker'
            element={
              <ProtectedRoute>
                <StickerManagePage />
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<NotFound />} />
        </Routes>
        {background && (
          <Routes>
            <Route
              path='/post/:postId'
              element={<PostDetailPage isOverlay={true} />}
            />
          </Routes>
        )}
      </React.Suspense>
    </MainLayout>
  );
};

export default MainRoutes;
