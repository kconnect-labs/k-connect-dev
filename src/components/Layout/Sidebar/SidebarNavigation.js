import React, { memo, useMemo, useCallback, useContext } from 'react';
import { List, Collapse, styled, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { NavButton, MoreButton } from '../../../UIKIT';
import { SidebarContext } from '../../../context/SidebarContext';
import { useLanguage } from '../../../context/LanguageContext';
import GavelIcon from '@mui/icons-material/Gavel';
import Badge from '@mui/material/Badge';
import { useMessenger } from '../../../contexts/MessengerContext';
import { 
  IoHomeOutline, 
  IoChatbubblesOutline, 
  IoMusicalNotesOutline, 
  IoBagOutline, 
  IoAtOutline, 
  IoMedalOutline, 
  IoPersonOutline, 
  IoPeopleOutline, 
  IoPeopleCircleOutline, 
  IoSearchOutline, 
  IoShieldOutline, 
  IoShieldCheckmarkOutline, 
  IoGameControllerOutline, 
  IoStarOutline, 
  IoEllipsisHorizontalOutline, 
  IoArrowUpOutline, 
  IoArrowDownOutline, 
  IoBarChartOutline, 
  IoBugOutline, 
  IoDocumentTextOutline, 
  IoCodeOutline, 
  IoStorefrontOutline, 
  IoCubeOutline, 
  IoHappyOutline 
} from 'react-icons/io5';

// Clean, minimal nested list styling
const NestedList = styled(List)(({ theme }) => ({
  marginLeft: theme.spacing(2),

}));

// Minimal navigation container
const NavigationContainer = styled(List)(({ theme }) => ({
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

const SidebarNavigation = memo(({ 
  isAdmin, 
  isModeratorUser, 
  isChannel, 
  primaryColor,
  user
}) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { expandedMore, expandedAdminMod, expandedShops, expandedSocial, toggleExpandMore, toggleExpandAdminMod, toggleExpandShops, toggleExpandSocial } = useContext(SidebarContext);
  const { unreadCounts } = useMessenger();
  const totalUnread = useMemo(() => {
    const total = Object.values(unreadCounts || {}).filter(c=>c>0).length;
     return total;
  }, [unreadCounts]);
  
  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  }, [location.pathname]);
  
  const icons = useMemo(() => ({
    home: <IoHomeOutline size={22} />,
    messenger: totalUnread>0 ? (
      <Badge overlap="circular" badgeContent={totalUnread>99? '99+': totalUnread}
        sx={{ '& .MuiBadge-badge': { backgroundColor:'#2f2f2f', border:'1px solid #b1b1b1', color:'#fff' } }}
      >
        <IoChatbubblesOutline size={22} />
      </Badge>
    ) : <IoChatbubblesOutline size={22} />,
    music: <IoMusicalNotesOutline size={22} />,
    shop: <IoBagOutline size={22} />,
    inventory: <IoBagOutline size={22} />,
    auction: <IoAtOutline size={22} />,
    badge: <IoMedalOutline size={22} />,
    person: <IoPersonOutline size={20} />,
    people: <IoPeopleOutline size={20} />,
    channels: <IoPeopleCircleOutline size={20} />,
    search: <IoSearchOutline size={20} />,
    admin: <IoShieldOutline size={20} />,
    moderator: <IoShieldCheckmarkOutline size={20} />,
    games: <IoGameControllerOutline size={20} />,
         subscription: <IoStarOutline size={20} />,
    more: <IoEllipsisHorizontalOutline size={20} />,
    arrowUp: <IoArrowUpOutline size={20} />,
    arrowDown: <IoArrowDownOutline size={20} />,
    leaderboard: <IoBarChartOutline size={20} />,
    bug: <IoBugOutline size={20} />,
    rules: <IoDocumentTextOutline size={20} />,
    api: <IoCodeOutline size={20} />,
    marketplace: <IoStorefrontOutline size={20} />,
         pack: <IoBagOutline size={20} />,
    sticker: <IoHappyOutline size={20} />,
  }), [totalUnread]);
  
  const mainMenu = useMemo(() => (
    <>
      <NavButton
        text={t('sidebar.navigation.feed')}
        icon={icons.home}
        path="/"
        active={isActive('/')}
        themeColor={primaryColor}
      />
      
      <NavButton
        text={t('sidebar.navigation.messenger')}
        icon={icons.messenger}
        path="/messenger"
        active={isActive('/messenger')}
        themeColor={primaryColor}
      />
      
      <NavButton
        text={t('sidebar.navigation.music')}
        icon={icons.music}
        path="/music"
        active={isActive('/music')}
        themeColor={primaryColor}
      />

      <NavButton
        text="Инвентарь"
        icon={icons.inventory}
        path="/economic/inventory"
        active={isActive('/economic/inventory')}
        themeColor={primaryColor}
      />
    </>
  ), [icons, isActive, primaryColor, t]);

  const socialMenu = useMemo(() => (
    <>
      <NavButton
        text="Социальное"
        icon={icons.people}
        active={expandedSocial}
        onClick={toggleExpandSocial}
        endIcon={expandedSocial ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        themeColor={primaryColor}
      />
      <Collapse in={expandedSocial} timeout="auto" unmountOnExit>
        <NestedList component="div" disablePadding>
          <NavButton
            text={t('sidebar.navigation.subscriptions')}
            icon={icons.people}
            path={user && user.username ? `/friends/${user.username}` : '/friends'}
            active={isActive(user && user.username ? `/friends/${user.username}` : '/friends')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="Гранты"
            icon={icons.subscription}
            path="/grant"
            active={isActive('/grant')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text={t('sidebar.navigation.channels')}
            icon={icons.channels}
            path="/channels"
            active={isActive('/channels')}
            themeColor={primaryColor}
            nested={true}
          />
          {!isChannel && (
            <NavButton
              text={t('sidebar.navigation.more.leaderboard')}
              icon={icons.leaderboard}
              path="/leaderboard"
              active={isActive('/leaderboard')}
              themeColor={primaryColor}
              nested={true}
            />
          )}
        </NestedList>
      </Collapse>
    </>
  ), [icons, isActive, primaryColor, expandedSocial, toggleExpandSocial, t, isChannel, user]);
  
  const adminModMenu = useMemo(() => (
    (isAdmin || isModeratorUser) && (
      <>
        <NavButton
          text={t('sidebar.navigation.management')}
          icon={icons.admin}
          active={expandedAdminMod}
          isSpecial={true}
          onClick={toggleExpandAdminMod}
          endIcon={expandedAdminMod ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        />
        
        <Collapse in={expandedAdminMod} timeout="auto" unmountOnExit>
          <NestedList component="div" disablePadding>
            {isAdmin && (
              <NavButton
                text={t('sidebar.navigation.admin_panel')}
                icon={icons.admin}
                path="/admin"
                active={isActive('/admin')}
                isSpecial={true}
                nested={true}
              />
            )}
            
            {isModeratorUser && (
              <NavButton
                text={t('sidebar.navigation.moderate')}
                icon={icons.moderator}
                path="/moderator"
                active={isActive('/moderator')}
                isSpecial={true}
                nested={true}
              />
            )}
          </NestedList>
        </Collapse>
      </>
    )
  ), [icons, isActive, isAdmin, isModeratorUser, expandedAdminMod, toggleExpandAdminMod, t]);

  const shopsMenu = useMemo(() => (
    <>
      <NavButton
        text={t('sidebar.navigation.shops.title')}
        icon={icons.shop}
        active={expandedShops}
        onClick={toggleExpandShops}
        endIcon={expandedShops ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        themeColor={primaryColor}
      />
      <Collapse in={expandedShops} timeout="auto" unmountOnExit>
        <NestedList component="div" disablePadding>
          <NavButton
            text="Бейджи"
            icon={icons.badge}
            path="/badge-shop"
            active={isActive('/badge-shop')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="Маркетплейс"
            icon={icons.marketplace}
            path="/marketplace"
            active={isActive('/marketplace')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="Юзернеймы"
            icon={icons.auction}
            path="/username-auction"
            active={isActive('/username-auction')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="Пачки"
            icon={icons.pack}
            path="/economic/packs"
            active={isActive('/economic/packs')}
            themeColor={primaryColor}
            nested={true}
          />
        </NestedList>
      </Collapse>
    </>
  ), [icons, isActive, primaryColor, expandedShops, toggleExpandShops, t]);
  
  const extraMenu = useMemo(() => (
    !isChannel && (
      <>
              {/* <NavButton
          text={t('sidebar.navigation.minigames')}
          icon={icons.games}
          path="/minigames/clicker"
          active={isActive('/minigames/clicker')}
          themeColor={primaryColor}
        /> */}
        
        <NavButton
          text={t('sidebar.navigation.subscription_plans')}
          icon={icons.subscription}
          path="/sub-planes"
          active={isActive('/sub-planes')}
          themeColor={primaryColor}
        />
      </>
    )
  ), [icons, isActive, isChannel, primaryColor, t]);
  
  const moreSection = useMemo(() => (
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

      <Collapse in={expandedMore} timeout="auto" unmountOnExit>
        <NestedList component="div" disablePadding>
          {!isChannel && (
            <NavButton
              text={t('sidebar.navigation.more.bug_reports')}
              icon={icons.bug}
              path="/bugs"
              active={isActive('/bugs')}
              themeColor={primaryColor}
              nested={true}
            />
          )}
          
          <NavButton
            text={t('sidebar.navigation.more.rules')}
            icon={icons.rules}
            path="/rules"
            active={isActive('/rules')}
            themeColor={primaryColor}
            nested={true}
          />
          
          <NavButton
            text={t('sidebar.navigation.more.api_docs')}
            icon={icons.api}
            path="/documentapi"
            active={isActive('/documentapi')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="СтикерМенеджер"
            icon={icons.sticker}
            path="/inform/sticker"
            active={isActive('/inform/sticker')}
            themeColor={primaryColor}
          />
          
          <NavButton
            text={t('sidebar.navigation.more.about')}
            icon={icons.rules}
            path="/about"
            active={isActive('/about')}
            themeColor={primaryColor}
            nested={true}
            target="_blank"
            rel="noopener noreferrer"
          />
        </NestedList>
      </Collapse>
    </>
  ), [icons, isActive, isChannel, primaryColor, expandedMore, toggleExpandMore, t]);
  
  return (
    <NavigationContainer component="nav">
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
    </NavigationContainer>
  );
});

export default SidebarNavigation; 