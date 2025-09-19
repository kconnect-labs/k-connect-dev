import React, { memo, useMemo, useCallback, useContext, useState } from 'react';
import { List, Collapse, styled, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { NavButton, MoreButton } from '../../../UIKIT';
import { SidebarContext } from '../../../context/SidebarContext';
import { useLanguage } from '../../../context/LanguageContext';
import GavelIcon from '@mui/icons-material/Gavel';
import Badge from '@mui/material/Badge';
import axios from 'axios';
import { useMessenger } from '../../../contexts/MessengerContext';
import UniversalModal from '../../../UIKIT/UniversalModal/UniversalModal';
import { Typography } from '@mui/material';
import { ArtistErrorModal } from './artistErrorModal/artistErrorModal';

// Clean, minimal nested list styling
const NestedList = styled(List)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

// Minimal navigation container
const NavigationContainer = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
  '& .MuiListItem-root': {
    marginBottom: theme.spacing(0.25),
    borderRadius: theme.spacing(1),
    transition: 'all 0.15s ease',
  },
}));

// Subtle section spacer
const SectionSpacer = styled(Box)(({ theme }) => ({
  height: theme.spacing(1),
}));

const SidebarNavigation = memo(
  ({ isModeratorUser, isChannel, primaryColor, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const {
      expandedMore,
      expandedAdminMod,
      expandedShops,
      expandedSocial,
      toggleExpandMore,
      toggleExpandAdminMod,
      toggleExpandShops,
      toggleExpandSocial,
    } = useContext(SidebarContext);
    // Получаем данные мессенджера
    const { unreadCounts, getTotalUnreadCount } = useMessenger();
    const totalUnread = getTotalUnreadCount();
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
    const [artistModalError, setArtistModalError] = useState('');

    // Функция для проверки наличия артиста и навигации
    const handleArtistManagementClick = useCallback(async () => {
      try {
        const response = await axios.get(
          '/api/artist-management/check-has-artist'
        );
        if (response.data.success && response.data.has_artist) {
          navigate('/artist-management');
        } else {
          // Показываем сообщение что у пользователя нет привязанных артистов
          setArtistModalError(
            'У вас нет привязанных артистов. Обратитесь к модератору для привязки карточки артиста.'
          );
          setIsArtistModalOpen(true);
          // alert('У вас нет привязанных артистов. Обратитесь к модератору для привязки карточки артиста.');
        }
      } catch (error) {
        console.error('Ошибка проверки артистов:', error);
        // alert('Произошла ошибка при проверке артистов');
        setArtistModalError('Произошла ошибка при проверке артистов');
        setIsArtistModalOpen(true);
      }
    }, [navigate]);

    const isActive = useCallback(
      path => {
        if (path === '/' && location.pathname === '/') {
          return true;
        }
        return location.pathname === path;
      },
      [location.pathname]
    );

    const icons = useMemo(
      () => ({
        home: (
          <Icon icon='material-symbols:home-outline' width='22' height='22' />
        ),
        messenger:
          totalUnread > 0 ? (
            <Badge
              overlap='circular'
              badgeContent={totalUnread > 99 ? '99+' : totalUnread}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#2f2f2f',
                  border: '1px solid #b1b1b1',
                  color: '#fff',
                },
              }}
            >
              <Icon icon='tabler:mail' width='22' height='22' />
            </Badge>
          ) : (
            <Icon icon='tabler:mail' width='22' height='22' />
          ),
        music: <Icon icon='tabler:music' width='22' height='22' />,
        shop: <Icon icon='tabler:coins' width='22' height='22' />,
        inventory: <Icon icon='tabler:backpack' width='22' height='22' />,
        auction: <Icon icon='tabler:at' width='22' height='22' />,
        badge: <Icon icon='tabler:award' width='22' height='22' />,
        person: <Icon icon='solar:user-outline' width='20' height='20' />,
        people: (
          <Icon
            icon='solar:users-group-two-rounded-outline'
            width='20'
            height='20'
          />
        ),
        channels: (
          <Icon
            icon='solar:users-group-rounded-outline'
            width='20'
            height='20'
          />
        ),
        search: <Icon icon='solar:magnifer-outline' width='20' height='20' />,
        admin: <Icon icon='solar:shield-user-outline' width='20' height='20' />,
        moderator: (
          <Icon icon='solar:shield-star-outline' width='20' height='20' />
        ),
        games: <Icon icon='solar:gamepad-outline' width='20' height='20' />,
        subscription: (
          <Icon icon='solar:crown-outline' width='20' height='20' />
        ),
        more: <Icon icon='solar:menu-dots-outline' width='20' height='20' />,
        arrowUp: (
          <Icon icon='solar:alt-arrow-up-outline' width='20' height='20' />
        ),
        arrowDown: (
          <Icon icon='solar:alt-arrow-down-outline' width='20' height='20' />
        ),
        leaderboard: <Icon icon='solar:chart-outline' width='20' height='20' />,
        bug: <Icon icon='solar:bug-outline' width='20' height='20' />,
        rules: (
          <Icon icon='solar:document-text-outline' width='20' height='20' />
        ),
        api: <Icon icon='solar:code-outline' width='20' height='20' />,
        marketplace: (
          <Icon icon='solar:shop-2-outline' width='20' height='20' />
        ),
        pack: <Icon icon='solar:box-outline' width='20' height='20' />,
        sticker: (
          <Icon
            icon='solar:sticker-smile-circle-2-bold'
            width='20'
            height='20'
          />
        ),
        referral: (
          <Icon
            icon='solar:users-group-two-rounded-bold'
            width='20'
            height='20'
          />
        ),
        brand: <Icon icon='solar:palette-outline' width='20' height='20' />,
        tickets: <Icon icon='solar:ticket-outline' width='20' height='20' />,
      }),
      [totalUnread]
    );

    const mainMenu = useMemo(
      () => (
        <>
          <NavButton
            text={t('sidebar.navigation.feed')}
            icon={icons.home}
            path='/'
            active={isActive('/')}
            themeColor={primaryColor}
          />

          <NavButton
            text={t('sidebar.navigation.messenger')}
            icon={icons.messenger}
            path='/messenger'
            active={isActive('/messenger')}
            themeColor={primaryColor}
          />

          <NavButton
            text={t('sidebar.navigation.music')}
            icon={icons.music}
            path='/music'
            active={isActive('/music')}
            themeColor={primaryColor}
          />

          <NavButton
            text={t('sidebar.navigation.inventory')}
            icon={icons.inventory}
            path='/economic/inventory'
            active={isActive('/economic/inventory')}
            themeColor={primaryColor}
          />
        </>
      ),
      [icons, isActive, primaryColor, t]
    );

    const socialMenu = useMemo(
      () => (
        <>
          <NavButton
            text={t('sidebar.navigation.social.title')}
            icon={icons.people}
            active={expandedSocial}
            onClick={toggleExpandSocial}
            endIcon={expandedSocial ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            themeColor={primaryColor}
          />
          <Collapse in={expandedSocial} timeout='auto' unmountOnExit>
            <NestedList component='div' disablePadding>
              <NavButton
                text={t('sidebar.navigation.social.subscriptions')}
                icon={icons.people}
                path={
                  user && user.username
                    ? `/friends/${user.username}`
                    : '/friends'
                }
                active={isActive(
                  user && user.username
                    ? `/friends/${user.username}`
                    : '/friends'
                )}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.social.grants')}
                icon={icons.subscription}
                path='/grant'
                active={isActive('/grant')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.social.channels')}
                icon={icons.channels}
                path='/channels'
                active={isActive('/channels')}
                themeColor={primaryColor}
                nested={true}
              />
              {!isChannel && (
                <NavButton
                  text={t('sidebar.navigation.social.leaderboard')}
                  icon={icons.leaderboard}
                  path='/leaderboard'
                  active={isActive('/leaderboard')}
                  themeColor={primaryColor}
                  nested={true}
                />
              )}
            </NestedList>
          </Collapse>
        </>
      ),
      [
        icons,
        isActive,
        primaryColor,
        expandedSocial,
        toggleExpandSocial,
        t,
        isChannel,
        user,
      ]
    );

    const adminModMenu = useMemo(
      () =>
        isModeratorUser && (
          <>
            <NavButton
              text={t('sidebar.navigation.management')}
              icon={icons.admin}
              active={expandedAdminMod}
              isSpecial={true}
              onClick={toggleExpandAdminMod}
              endIcon={
                expandedAdminMod ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
            />

            <Collapse in={expandedAdminMod} timeout='auto' unmountOnExit>
              <NestedList component='div' disablePadding>
                {isModeratorUser && (
                  <>
                    <NavButton
                      text={t('sidebar.navigation.moderate')}
                      icon={icons.moderator}
                      path='/moderator'
                      active={isActive('/moderator')}
                      isSpecial={true}
                      nested={true}
                    />
                    <NavButton
                      text={t('Nitro Панель')}
                      icon={icons.moderator}
                      path='/panel/nitro'
                      active={isActive('/panel/nitro')}
                      isSpecial={true}
                      nested={true}
                    />
                  </>
                )}
              </NestedList>
            </Collapse>
          </>
        ),
      [
        icons,
        isActive,
        isModeratorUser,
        expandedAdminMod,
        toggleExpandAdminMod,
        t,
      ]
    );

    const shopsMenu = useMemo(
      () => (
        <>
          <NavButton
            text={t('sidebar.navigation.shops.title')}
            icon={icons.shop}
            active={expandedShops}
            onClick={toggleExpandShops}
            endIcon={expandedShops ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            themeColor={primaryColor}
          />
          <Collapse in={expandedShops} timeout='auto' unmountOnExit>
            <NestedList component='div' disablePadding>
              <NavButton
                text={t('sidebar.navigation.shops.badge_shop')}
                icon={icons.badge}
                path='/badge-shop'
                active={isActive('/badge-shop')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.shops.marketplace')}
                icon={icons.marketplace}
                path='/marketplace'
                active={isActive('/marketplace')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.shops.username_auction')}
                icon={icons.auction}
                path='/username-auction'
                active={isActive('/username-auction')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.shops.packs')}
                icon={icons.pack}
                path='/economic/packs'
                active={isActive('/economic/packs')}
                themeColor={primaryColor}
                nested={true}
              />
            </NestedList>
          </Collapse>
        </>
      ),
      [icons, isActive, primaryColor, expandedShops, toggleExpandShops, t]
    );

    const extraMenu = useMemo(
      () =>
        !isChannel && (
          <>
            <NavButton
              text={t('sidebar.navigation.minigames')}
              icon={icons.games}
              path='/minigames'
              active={isActive('/minigames')}
              themeColor={primaryColor}
            />

            <NavButton
              text={t('sidebar.navigation.subscription_plans')}
              icon={icons.subscription}
              path='/sub-planes'
              active={isActive('/sub-planes')}
              themeColor={primaryColor}
            />
          </>
        ),
      [icons, isActive, isChannel, primaryColor, t]
    );

    const moreSection = useMemo(
      () => (
        <>
          <MoreButton
            text={t('sidebar.navigation.more.title')}
            icon={icons.more}
            active={expandedMore}
            themeColor={primaryColor}
            onClick={toggleExpandMore}
            arrowUpIcon={icons.arrowUp}
            arrowDownIcon={icons.arrowDown}
          />

          <Collapse in={expandedMore} timeout='auto' unmountOnExit>
            <NestedList component='div' disablePadding>
              {!isChannel && (
                <NavButton
                  text={t('sidebar.navigation.more.bug_reports')}
                  icon={icons.bug}
                  path='/bugs'
                  active={isActive('/bugs')}
                  themeColor={primaryColor}
                  nested={true}
                />
              )}
              <NavButton
                text='Мои тикеты'
                icon={icons.tickets}
                path='/tickets'
                active={isActive('/tickets')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.more.brand')}
                icon={icons.brand}
                path='/brand'
                active={isActive('/brand')}
                themeColor={primaryColor}
                nested={true}
              />

              <NavButton
                text={t('sidebar.navigation.more.referral')}
                icon={icons.referral}
                path='/referral'
                active={isActive('/referral')}
                themeColor={primaryColor}
                nested={true}
              />

              <NavButton
                text={t('sidebar.navigation.more.rules')}
                icon={icons.rules}
                path='/rules'
                active={isActive('/rules')}
                themeColor={primaryColor}
                nested={true}
              />

              <NavButton
                text={t('sidebar.navigation.more.api_docs')}
                icon={icons.api}
                path='/documentapi'
                active={isActive('/documentapi')}
                themeColor={primaryColor}
                nested={true}
              />
              <NavButton
                text={t('sidebar.navigation.more.stickers')}
                icon={icons.sticker}
                path='/inform/sticker'
                active={isActive('/inform/sticker')}
                themeColor={primaryColor}
              />

              <NavButton
                text={t('sidebar.navigation.more.about')}
                icon={icons.rules}
                path='/about'
                active={isActive('/about')}
                themeColor={primaryColor}
                nested={true}
                target='_blank'
                rel='noopener noreferrer'
              />

              {/* Карточка артиста - всегда показываем, проверяем при нажатии */}
              <NavButton
                text='Карточка артиста'
                icon={icons.person}
                onClick={handleArtistManagementClick}
                active={isActive('/artist-management')}
                themeColor={primaryColor}
                nested={true}
              />
            </NestedList>
          </Collapse>
        </>
      ),
      [
        icons,
        isActive,
        isChannel,
        primaryColor,
        expandedMore,
        toggleExpandMore,
        t,
      ]
    );

    return (
      <NavigationContainer component='nav'>
        {mainMenu}
        <SectionSpacer />
        {socialMenu}
        {adminModMenu && (
          <>
            <SectionSpacer />
            {adminModMenu}
          </>
        )}
        <SectionSpacer />
        {shopsMenu}
        {extraMenu && (
          <>
            <SectionSpacer />
            {extraMenu}
          </>
        )}
        <SectionSpacer />
        {moreSection}
        <ArtistErrorModal
          isArtistModalOpen={isArtistModalOpen}
          setIsArtistModalOpen={setIsArtistModalOpen}
          artistModalError={artistModalError}
        />
      </NavigationContainer>
    );
  }
);

export default SidebarNavigation;
