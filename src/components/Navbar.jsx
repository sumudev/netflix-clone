import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, X, Sun, Moon } from 'lucide-react';

const API_KEY = "8453fd0f070ffe11d0144258f9765a99";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92"; // Small width thumbnail for suggestions list

const Navbar = ({
  searchQuery,
  setSearchQuery,
  activeProfile,
  onSwitchProfile,
  theme,
  onToggleTheme,
  onSelectSuggestion,
  activeTab,
  setActiveTab
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Scroll listener for sticky solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside mobile menu to close
  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMobile);
    return () => document.removeEventListener('mousedown', handleClickOutsideMobile);
  }, []);

  // Fetch search suggestions debounced
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (data && data.results) {
          // Filter results with backdrops/posters and check for movies or tv shows, take first 5
          const filtered = data.results
            .filter(
              item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.backdrop_path || item.poster_path)
            )
            .slice(0, 5);
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("Suggestions API failed", err);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside search box to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target) &&
        searchQuery === ''
      ) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchQuery]);

  const handleSearchClick = () => {
    setIsSearchActive(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleSuggestionClick = (id, mediaType) => {
    onSelectSuggestion(id, mediaType);
    setSearchQuery(''); // clear query on selection
    setSuggestions([]);
  };

  const handleNavClick = (tab, e) => {
    e.preventDefault();
    setActiveTab(tab);
    // Clear search values when navigating tabs
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchActive(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <a href="/" className="logo-link" onClick={(e) => handleNavClick('home', e)}>
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            alt="Netflix Logo"
          />
        </a>
        <ul className="nav-links">
          <li>
            <a 
              href="#" 
              className={activeTab === 'home' ? 'active' : ''} 
              onClick={(e) => handleNavClick('home', e)}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === 'tv' ? 'active' : ''} 
              onClick={(e) => handleNavClick('tv', e)}
            >
              TV Shows
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === 'movies' ? 'active' : ''} 
              onClick={(e) => handleNavClick('movies', e)}
            >
              Movies
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === 'new' ? 'active' : ''} 
              onClick={(e) => handleNavClick('home', e)} /* Default to home trending */
            >
              New & Popular
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === 'mylist' ? 'active' : ''} 
              onClick={(e) => handleNavClick('mylist', e)}
            >
              My List
            </a>
          </li>
        </ul>

        {/* Mobile Navigation Dropdown Trigger */}
        <div className="mobile-browse-menu" ref={mobileMenuRef}>
          <button 
            className="mobile-browse-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            Browse <ChevronDown size={14} className={`browse-arrow ${isMobileMenuOpen ? 'open' : ''}`} />
          </button>
          
          {isMobileMenuOpen && (
            <div className="mobile-browse-dropdown">
              <div className="mobile-dropdown-arrow"></div>
              <ul>
                <li>
                  <a href="#" className={activeTab === 'home' ? 'active' : ''} onClick={(e) => { handleNavClick('home', e); setIsMobileMenuOpen(false); }}>Home</a>
                </li>
                <li>
                  <a href="#" className={activeTab === 'tv' ? 'active' : ''} onClick={(e) => { handleNavClick('tv', e); setIsMobileMenuOpen(false); }}>TV Shows</a>
                </li>
                <li>
                  <a href="#" className={activeTab === 'movies' ? 'active' : ''} onClick={(e) => { handleNavClick('movies', e); setIsMobileMenuOpen(false); }}>Movies</a>
                </li>
                <li>
                  <a href="#" className={activeTab === 'new' ? 'active' : ''} onClick={(e) => { handleNavClick('home', e); setIsMobileMenuOpen(false); }}>New & Popular</a>
                </li>
                <li>
                  <a href="#" className={activeTab === 'mylist' ? 'active' : ''} onClick={(e) => { handleNavClick('mylist', e); setIsMobileMenuOpen(false); }}>My List</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        {/* Theme Switcher Toggle */}
        <button 
          className="nav-icon" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Animated Search Box */}
        <div ref={searchBoxRef} className={`search-box ${isSearchActive ? 'active' : ''}`}>
          <Search className="search-icon nav-icon" onClick={handleSearchClick} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Titles, people, genres"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X className="search-clear-icon visible nav-icon" onClick={handleClearSearch} />
          )}

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div ref={dropdownRef} className="search-suggestions-dropdown">
              {suggestions.map(item => {
                const sTitle = item.title || item.name || item.original_title || item.original_name;
                const path = item.backdrop_path || item.poster_path;
                const thumbUrl = path ? `${IMAGE_BASE_URL}${path}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=92";
                const sDate = item.release_date || item.first_air_date || "";
                const sYear = sDate ? sDate.substring(0, 4) : "";
                const mType = item.media_type === 'tv' ? 'TV Show' : 'Movie';

                return (
                  <div 
                    key={item.id} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item.id, item.media_type)}
                  >
                    <img src={thumbUrl} alt={sTitle} className="suggestion-thumb" />
                    <div className="suggestion-info">
                      <span className="suggestion-title">{sTitle}</span>
                      <span className="suggestion-meta">{sYear ? `${sYear} • ` : ''}{mType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="notifications-dropdown">
          <Bell className="nav-icon" />
          <span className="badge">3</span>
        </div>

        {/* User Profile */}
        {activeProfile && (
          <div className="user-profile">
            <img
              className="avatar"
              src={activeProfile.avatar}
              alt={activeProfile.name}
            />
            <ChevronDown className="profile-arrow" />
            
            <div className="profile-dropdown">
              <ul>
                <li>
                  <a href="#" style={{ pointerEvents: 'none' }}>
                    <span style={{ fontWeight: '600' }}>{activeProfile.name}</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={onSwitchProfile}>
                    Switch Profiles
                  </a>
                </li>
                <li><a href="#">Account</a></li>
                <li><a href="#">Help Center</a></li>
                <li className="divider"></li>
                <li>
                  <a href="#" className="sign-out" onClick={onSwitchProfile}>
                    Sign out of Netflix
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
