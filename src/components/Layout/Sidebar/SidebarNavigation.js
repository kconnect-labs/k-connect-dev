import React, { memo, useMemo, useCallback, useContext } from 'react';
import { List, Collapse, styled } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { NavButton, MoreButton } from '../../../UIKIT';
import { SidebarContext } from '../../../context/SidebarContext';
import { useLanguage } from '../../../context/LanguageContext';
import GavelIcon from '@mui/icons-material/Gavel';

// Стили для веток
const BranchedList = styled(List)(({ theme }) => ({
  position: 'relative',
  marginLeft: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    background: theme.palette.divider,
    zIndex: 0,
    opacity: 0.4,
  },
}));

const BranchedListItem = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -theme.spacing(2),
    top: '50%',
    width: theme.spacing(2),
    height: '1px',
    background: theme.palette.divider,
    zIndex: 1,
    opacity: 0.4,
    transform: 'translateY(-50%)',
  },
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
  
  
  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  }, [location.pathname]);
  
  
  const icons = useMemo(() => ({
    person: <Icon icon="solar:user-outline" width="20" height="20" />,
    home: <Icon icon="solar:home-outline" width="20" height="20" />,
    music: <Icon icon="solar:music-notes-outline" width="20" height="20" />,
    people: <Icon icon="solar:users-group-two-rounded-outline" width="20" height="20" />,
    channels: <Icon icon="solar:users-group-rounded-outline" width="20" height="20" />,
    search: <Icon icon="solar:magnifer-outline" width="20" height="20" />,
    shop: <Icon icon="solar:shop-outline" width="20" height="20" />,
    admin: <Icon icon="solar:shield-user-outline" width="20" height="20" />,
    moderator: <Icon icon="solar:shield-star-outline" width="20" height="20" />,
    games: <Icon icon="solar:gamepad-outline" width="20" height="20" />,
    subscription: <Icon icon="solar:crown-outline" width="20" height="20" />,
    more: <Icon icon="solar:menu-dots-outline" width="20" height="20" />,
    arrowUp: <Icon icon="solar:alt-arrow-up-outline" width="20" height="20" />,
    arrowDown: <Icon icon="solar:alt-arrow-down-outline" width="20" height="20" />,
    leaderboard: <Icon icon="solar:chart-outline" width="20" height="20" />,
    bug: <Icon icon="solar:bug-outline" width="20" height="20" />,
    rules: <Icon icon="solar:document-text-outline" width="20" height="20" />,
    api: <Icon icon="solar:code-outline" width="20" height="20" />,
    auction: <GavelIcon sx={{ fontSize: 20 }} />,
    marketplace: <Icon icon="solar:shop-2-outline" width="20" height="20" />,
    pack: <Icon icon="solar:box-outline" width="20" height="20" />,
    inventory: <Icon icon="solar:bag-outline" width="20" height="20" />
  }), []);
  
  
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
        icon={<Icon icon="solar:chat-round-outline" width="20" height="20" />}
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
        <List component="div" disablePadding sx={{ pl: 1.5, pt: 0.5 }}>
          <NavButton
            text={t('sidebar.navigation.subscriptions')}
            icon={icons.people}
            path="/subscriptions"
            active={isActive('/subscriptions')}
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
        </List>
      </Collapse>
    </>
  ), [icons, isActive, primaryColor, expandedSocial, toggleExpandSocial, t, isChannel]);
  
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
          <List component="div" disablePadding sx={{ pl: 1.5, pt: 0.5 }}>
            
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
          </List>
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
        <List component="div" disablePadding sx={{ pl: 1.5, pt: 0.5 }}>
          <NavButton
            text="Бейджи"
            icon={icons.shop}
            path="/badge-shop"
            active={isActive('/badge-shop')}
            themeColor={primaryColor}
            nested={true}
          />
          <NavButton
            text="Маркетплейс"
            icon={icons.marketplace}
            path="/marketplace"
            active={isActive('/economic/marketplace')}
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
        </List>
      </Collapse>
    </>
  ), [icons, isActive, primaryColor, expandedShops, toggleExpandShops, t]);
  
  const extraMenu = useMemo(() => (
    !isChannel && (
      <>
        <NavButton
          text={t('sidebar.navigation.minigames')}
          icon={icons.games}
          path="/minigames"
          active={isActive('/minigames')}
          themeColor={primaryColor}
        />
        
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
        <List component="div" disablePadding sx={{ pl: 1.5, pt: 0.5 }}>
          
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
            path="/api-docs"
            active={isActive('/api-docs')}
            themeColor={primaryColor}
            nested={true}
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
        </List>
      </Collapse>
    </>
  ), [icons, isActive, isChannel, primaryColor, expandedMore, toggleExpandMore, t]);
  
  return (
    <List component="nav" sx={{ p: 1 }}>
      {mainMenu}
      {socialMenu}
      {adminModMenu}
      {shopsMenu}
      {extraMenu}
      {moreSection}
    </List>
  );
});

export default SidebarNavigation; 