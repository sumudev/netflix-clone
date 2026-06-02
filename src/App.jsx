import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MovieRow from './components/MovieRow';
import MovieModal from './components/MovieModal';
import MovieCard from './components/MovieCard';
import UserProfile from './components/UserProfile';
import Toast from './components/Toast';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const API_KEY = "8453fd0f070ffe11d0144258f9765a99";
const BASE_URL = "https://api.themoviedb.org/3";

const App = () => {
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('netflix_theme') || 'dark';
  });

  // Profile Selector State
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Page Tab State ('home', 'tv', 'movies', 'mylist')
  const [activeTab, setActiveTab] = useState('home');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal State
  const [activeModal, setActiveModal] = useState(null); // { id, mediaType }

  // Watchlist State (Profile-specific, loaded in useEffect)
  const [myList, setMyList] = useState(new Map());

  // Continue Watching State (Profile-specific MRU list, loaded in useEffect)
  const [continueWatching, setContinueWatching] = useState(new Map());

  // Liked Titles (Session state, in memory)
  const [likedTitles, setLikedTitles] = useState(new Set());

  // Toasts Notification State
  const [toasts, setToasts] = useState([]);

  // Theme Body Class Sync
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : '';
    localStorage.setItem('netflix_theme', theme);
  }, [theme]);

  // Load profile-specific lists when activeProfile changes
  useEffect(() => {
    if (!activeProfile) {
      setMyList(new Map());
      setContinueWatching(new Map());
      return;
    }

    // 1. Load Profile-specific Watchlist
    try {
      const savedList = localStorage.getItem(`netflix_react_mylist_${activeProfile.id}`);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        const map = new Map();
        parsed.forEach(item => map.set(String(item.id), item));
        setMyList(map);
      } else {
        setMyList(new Map());
      }
    } catch (e) {
      setMyList(new Map());
    }

    // 2. Load Profile-specific Continue Watching
    try {
      const savedContinue = localStorage.getItem(`netflix_react_continue_${activeProfile.id}`);
      if (savedContinue) {
        const parsed = JSON.parse(savedContinue);
        const map = new Map();
        parsed.forEach(item => map.set(String(item.id), item));
        setContinueWatching(map);
      } else {
        setContinueWatching(new Map());
      }
    } catch (e) {
      setContinueWatching(new Map());
    }
  }, [activeProfile]);

  // Persist Watchlist when it updates
  useEffect(() => {
    if (!activeProfile) return;
    try {
      const listArr = Array.from(myList.values());
      localStorage.setItem(`netflix_react_mylist_${activeProfile.id}`, JSON.stringify(listArr));
    } catch (e) {
      console.error("Failed to save watchlist to LocalStorage", e);
    }
  }, [myList, activeProfile]);

  // Persist Continue Watching when it updates
  useEffect(() => {
    if (!activeProfile) return;
    try {
      const continueArr = Array.from(continueWatching.values());
      localStorage.setItem(`netflix_react_continue_${activeProfile.id}`, JSON.stringify(continueArr));
    } catch (e) {
      console.error("Failed to save continue watching to LocalStorage", e);
    }
  }, [continueWatching, activeProfile]);

  // Fetch TMDB Search results
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (data && data.results) {
          const filtered = data.results.filter(
            item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.backdrop_path || item.poster_path)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Toast Trigger
  const showToast = (message) => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, message }]);
  };

  const handleRemoveToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Watchlist Toggle
  const handleToggleMyList = (id, cardData) => {
    const idStr = String(id);
    const title = cardData.title;
    setMyList(prev => {
      const newMap = new Map(prev);
      if (newMap.has(idStr)) {
        newMap.delete(idStr);
        showToast(`Removed "${title}" from My List`);
      } else {
        newMap.set(idStr, cardData);
        showToast(`Added "${title}" to My List`);
      }
      return newMap;
    });
  };

  // Like Toggle
  const handleToggleLike = (id) => {
    setLikedTitles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Open Details Modal and Log MRU Continue Watching card
  const handleOpenModal = async (id, mediaType) => {
    setActiveModal({ id, mediaType });
    
    // Quick query TMDB to build a clean card data representation for Continue Watching
    try {
      const res = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}`);
      const details = await res.json();
      if (details) {
        const title = details.title || details.name || details.original_title || details.original_name;
        const cardData = {
          id: details.id,
          media_type: mediaType,
          title: title,
          backdrop_path: details.backdrop_path,
          poster_path: details.poster_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date
        };

        setContinueWatching(prev => {
          const newMap = new Map();
          // Insert the most recently opened title at the front of the queue
          newMap.set(String(details.id), cardData);
          let count = 1;
          for (const [key, val] of prev) {
            if (key !== String(details.id) && count < 10) {
              newMap.set(key, val);
              count++;
            }
          }
          return newMap;
        });
      }
    } catch (e) {
      console.error("Failed to log Continue Watching track", e);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSelectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('netflix_active_profile', JSON.stringify(profile));
    showToast(`Logged in as ${profile.name}`);
  };

  const handleSwitchProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem('netflix_active_profile');
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // If no profile is active, redirect to selection screen
  if (!activeProfile) {
    return (
      <div className="App">
        <UserProfile onSelectProfile={handleSelectProfile} />
        {/* Render Toast notifications in the corner */}
        <div className="toasts-container">
          {toasts.map(t => (
            <Toast key={t.id} id={t.id} message={t.message} onClose={handleRemoveToast} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* NAVBAR */}
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeProfile={activeProfile}
        onSwitchProfile={handleSwitchProfile}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectSuggestion={handleOpenModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {searchQuery.trim() !== '' ? (
        /* SEARCH GRID DISPLAY */
        <section className="search-results-section">
          <h2 className="search-results-heading">
            Search Results for: <span>"{searchQuery}"</span>
          </h2>
          {isSearching ? (
            <p style={{ color: 'var(--text-sub)' }}>Searching TMDB catalog...</p>
          ) : searchResults.length > 0 ? (
            <div className="search-grid">
              {searchResults.map(movie => {
                const isAdded = myList.has(String(movie.id));
                const isLiked = likedTitles.has(movie.id);
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    mediaType={movie.media_type}
                    onCardClick={handleOpenModal}
                    isAddedToList={isAdded}
                    onToggleMyList={handleToggleMyList}
                    isLiked={isLiked}
                    onToggleLike={handleToggleLike}
                  />
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <p>Your search did not have any matches.</p>
              <p>Suggestions:</p>
              <ul>
                <li>Try different keywords</li>
                <li>Looking for a movie or TV show? Try its title</li>
                <li>Try a genre, like Sci-Fi, Drama, or Action</li>
              </ul>
            </div>
          )}
        </section>
      ) : activeTab === 'mylist' ? (
        /* DEDICATED MY LIST PAGE GRID */
        <section className="watchlist-page-section">
          <h2 className="watchlist-page-heading">My List</h2>
          {myList.size > 0 ? (
            <div className="watchlist-grid">
              {Array.from(myList.values()).map(movie => {
                const isAdded = myList.has(String(movie.id));
                const isLiked = likedTitles.has(movie.id);
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    mediaType={movie.media_type}
                    onCardClick={handleOpenModal}
                    isAddedToList={isAdded}
                    onToggleMyList={handleToggleMyList}
                    isLiked={isLiked}
                    onToggleLike={handleToggleLike}
                  />
                );
              })}
            </div>
          ) : (
            <div className="watchlist-empty-message">
              <p>You haven't added any titles to your list yet.</p>
            </div>
          )}
        </section>
      ) : (
        /* STANDARD SUB-PAGES / BANNER & ROWS */
        <>
          {/* HERO BILLBOARD */}
          <HeroBanner onMoreInfoClick={handleOpenModal} />

          {/* CATALOG ROWS */}
          <main className="main-container">
            
            {/* Rows rendered for Home / Default Tab */}
            {activeTab === 'home' && (
              <>
                {/* Watchlist */}
                <MovieRow
                  title="My List"
                  fetchUrl="mylist"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
                
                {/* Continue Watching */}
                {continueWatching.size > 0 && (
                  <MovieRow
                    title="Continue Watching"
                    fetchUrl="mylist"
                    onCardClick={handleOpenModal}
                    myList={continueWatching}
                    onToggleMyList={handleToggleMyList}
                    likedTitles={likedTitles}
                    onToggleLike={handleToggleLike}
                  />
                )}

                {/* Top 10 Ranked */}
                <MovieRow
                  title="Top 10 Trending Today"
                  fetchUrl={`/trending/all/day?api_key=${API_KEY}`}
                  isRanked={true}
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
              </>
            )}

            {/* TV SHOW FILTERS (TV tab / Home tab) */}
            {(activeTab === 'home' || activeTab === 'tv') && (
              <>
                <MovieRow
                  title="Netflix Originals"
                  fetchUrl={`/discover/tv?with_networks=213&api_key=${API_KEY}`}
                  fallbackType="tv"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  title="Trending TV Shows"
                  fetchUrl={`/trending/tv/week?api_key=${API_KEY}`}
                  fallbackType="tv"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
              </>
            )}

            {/* SHARED TRENDING ROWS */}
            {activeTab === 'home' && (
              <MovieRow
                title="Trending Now"
                fetchUrl={`/trending/all/week?api_key=${API_KEY}`}
                onCardClick={handleOpenModal}
                myList={myList}
                onToggleMyList={handleToggleMyList}
                likedTitles={likedTitles}
                onToggleLike={handleToggleLike}
              />
            )}

            {/* MOVIES FILTERS (Movies tab / Home tab) */}
            {(activeTab === 'home' || activeTab === 'movies') && (
              <>
                <MovieRow
                  title="Popular Movies"
                  fetchUrl={`/movie/popular?api_key=${API_KEY}`}
                  fallbackType="movie"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  title="Action Thrillers"
                  fetchUrl={`/discover/movie?with_genres=28&api_key=${API_KEY}`}
                  fallbackType="movie"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  title="Comedy Hits"
                  fetchUrl={`/discover/movie?with_genres=35&api_key=${API_KEY}`}
                  fallbackType="movie"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  title="Horror Movies"
                  fetchUrl={`/discover/movie?with_genres=27&api_key=${API_KEY}`}
                  fallbackType="movie"
                  onCardClick={handleOpenModal}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedTitles={likedTitles}
                  onToggleLike={handleToggleLike}
                />
              </>
            )}

            {/* TV GENERAL CAROUSEL */}
            {(activeTab === 'home' || activeTab === 'tv') && (
              <MovieRow
                title="Popular TV Shows"
                fetchUrl={`/tv/popular?api_key=${API_KEY}`}
                fallbackType="tv"
                onCardClick={handleOpenModal}
                myList={myList}
                onToggleMyList={handleToggleMyList}
                likedTitles={likedTitles}
                onToggleLike={handleToggleLike}
              />
            )}
          </main>
        </>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="social-links">
          <a href="#"><Facebook /></a>
          <a href="#"><Instagram /></a>
          <a href="#"><Twitter /></a>
          <a href="#"><Youtube /></a>
        </div>
        <div className="footer-links">
          <ul className="footer-column">
            <li><a href="#">Audio Description</a></li>
            <li><a href="#">Investor Relations</a></li>
            <li><a href="#">Legal Notices</a></li>
          </ul>
          <ul className="footer-column">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Jobs</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
          <ul className="footer-column">
            <li><a href="#">Gift Cards</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Cookie Preferences</a></li>
          </ul>
          <ul className="footer-column">
            <li><a href="#">Media Center</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">Corporate Information</a></li>
          </ul>
        </div>
        <div className="service-code-btn">Service Code</div>
        <p className="copyright">&copy; 1997-2026 Netflix, Inc.</p>
      </footer>

      {/* DETAIL MODAL POPUP */}
      {activeModal && (
        <MovieModal
          id={activeModal.id}
          mediaType={activeModal.mediaType}
          onClose={handleCloseModal}
          onCardClick={handleOpenModal}
          myList={myList}
          onToggleMyList={handleToggleMyList}
          likedTitles={likedTitles}
          onToggleLike={handleToggleLike}
          onTrailerOpened={(title) => showToast(`Playing trailer for "${title}"`)}
        />
      )}

      {/* TOASTS PANEL */}
      <div className="toasts-container">
        {toasts.map(t => (
          <Toast key={t.id} id={t.id} message={t.message} onClose={handleRemoveToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
