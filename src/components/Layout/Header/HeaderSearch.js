import React from 'react';
import './HeaderSearch.css';

const SearchInputWrapper = ({ focused, isMobile, children, ...props }) => {
  return (
    <div 
      className={`search-input-wrapper ${focused ? 'focused' : ''} ${isMobile ? 'mobile' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const StyledSearchInput = React.forwardRef(({ focused, placeholder, value, onChange, onFocus, onBlur, startAdornment, endAdornment, ...props }, ref) => {
  return (
    <div className="search-input-container">
      {startAdornment && (
        <div className="search-input-start-adornment">
          {startAdornment}
        </div>
      )}
      <input
        ref={ref}
        type="text"
        className={`search-input ${focused ? 'focused' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
      {endAdornment && (
        <div className="search-input-end-adornment">
          {endAdornment}
        </div>
      )}
    </div>
  );
});

const SearchResultsContainer = ({ focused, children, ...props }) => {
  return (
    <div 
      className={`search-results-container ${focused ? 'focused' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const SearchResultTabs = ({ value, onChange, children, ...props }) => {
  return (
    <div className="search-result-tabs" {...props}>
      {children}
    </div>
  );
};

const SearchResultTab = ({ label, active, onClick, ...props }) => {
  return (
    <button 
      className={`search-result-tab ${active ? 'active' : ''}`}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};

const HeaderSearch = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchTab,
  setSearchTab,
  searchLoading,
  showSearchResults,
  setShowSearchResults,
  searchInputRef,
  t,
  theme,
  handleSearchChange,
  handleSearchFocus,
  handleClickAway,
  handleSearchTabChange,
  handleViewAll,
  handleSearchItemClick,
  toggleSearch,
  isMobile
}) => {
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (showSearch) setFocused(true);
    else setFocused(false);
  }, [showSearch]);

  const handleClickOutside = (event) => {
    if (handleClickAway) {
      handleClickAway(event);
    }
  };

  const handleTabClick = (tabIndex) => {
    if (handleSearchTabChange) {
      handleSearchTabChange({}, tabIndex);
    }
  };

  if (!showSearch) return null;

  return (
    <SearchInputWrapper focused={focused} isMobile={isMobile}>
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <StyledSearchInput
          focused={focused}
          placeholder={t('header.search.placeholder')}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => { 
            if (handleSearchFocus) handleSearchFocus(); 
            setFocused(true); 
          }}
          onBlur={() => setFocused(false)}
          ref={searchInputRef}
          startAdornment={
            <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          }
          endAdornment={
            <button 
              className="clear-button"
              onClick={toggleSearch}
              type="button"
            >
              <svg className="clear-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          }
        />
        
        {showSearchResults && (
          <SearchResultsContainer focused={focused}>
            <SearchResultTabs>
              <SearchResultTab 
                label={t('header.search.tabs.all')} 
                active={searchTab === 0}
                onClick={() => handleTabClick(0)}
              />
              <SearchResultTab 
                label={t('header.search.tabs.channels')} 
                active={searchTab === 1}
                onClick={() => handleTabClick(1)}
              />
            </SearchResultTabs>
            
            <div className="search-results-content">
              {searchLoading ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                </div>
              ) : searchTab === 0 ? (
                searchResults.users.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.users.map(user => (
                      <div 
                        key={user.id} 
                        className="search-result-item"
                        onClick={() => handleSearchItemClick(`/profile/${user.username}`)}
                      >
                        <div className="search-result-avatar">
                          <img 
                            src={user.photo ? `/static/uploads/avatar/${user.id}/${user.photo}` : '/static/uploads/avatar/system/avatar.png'} 
                            alt={user.name || user.username}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/static/uploads/avatar/system/avatar.png';
                            }}
                          />
                        </div>
                        <div className="search-result-content">
                          <div className="search-result-name">
                            {user.name}
                            {user.verification_status === 'verified' && (
                              <svg className="verified-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            )}
                          </div>
                          <div className="search-result-username">@{user.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="search-no-results">
                    <span>{t('header.search.no_results.users')}</span>
                  </div>
                )
              ) : (
                searchResults.channels.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.channels.map(channel => (
                      <div 
                        key={channel.id} 
                        className="search-result-item"
                        onClick={() => handleSearchItemClick(`/profile/${channel.username}`)}
                      >
                        <div className="search-result-avatar">
                          <img 
                            src={channel.photo} 
                            alt={channel.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/static/uploads/avatar/system/avatar.png';
                            }}
                          />
                        </div>
                        <div className="search-result-content">
                          <div className="search-result-name">
                            {channel.name}
                            {channel.is_verified && (
                              <svg className="verified-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            )}
                          </div>
                          <div className="search-result-username">@{channel.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="search-no-results">
                    <span>{t('header.search.no_results.channels')}</span>
                  </div>
                )
              )}
              
              {((searchTab === 0 && searchResults.users.length > 0) || 
                (searchTab === 1 && searchResults.channels.length > 0)) && (
                <div className="search-view-all">
                  <button 
                    className="view-all-button"
                    onClick={handleViewAll}
                  >
                    {t('header.search.view_all')}
                  </button>
                </div>
              )}
            </div>
          </SearchResultsContainer>
        )}
      </div>
    </SearchInputWrapper>
  );
};

export default HeaderSearch; 