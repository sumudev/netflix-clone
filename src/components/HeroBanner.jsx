import React, { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

const API_KEY = "8453fd0f070ffe11d0144258f9765a99";
const BASE_URL = "https://api.themoviedb.org/3";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const HeroBanner = ({ onMoreInfoClick }) => {
  const [trendingList, setTrendingList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Trending Content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          // Filter items that have a backdrop image
          const filtered = data.results.filter(item => item.backdrop_path);
          setTrendingList(filtered);
          
          // Pick a random starting item
          const randomIdx = Math.floor(Math.random() * Math.min(filtered.length, 10));
          setCurrentIndex(randomIdx);
        }
      } catch (err) {
        console.error("Failed to fetch trending heroes", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Auto Rotation every 8 seconds
  useEffect(() => {
    if (trendingList.length === 0) return;
    
    const rotationInterval = setInterval(() => {
      setIsFading(true);
      // Change content halfway through fade animation
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingList.length);
        setIsFading(false);
      }, 500);
    }, 8000);

    return () => clearInterval(rotationInterval);
  }, [trendingList]);

  if (isLoading || trendingList.length === 0) {
    return (
      <section className="hero" style={{ height: '85vh', background: '#111' }}>
        <div className="hero-overlay"></div>
      </section>
    );
  }

  const currentItem = trendingList[currentIndex];
  const title = currentItem.title || currentItem.name || currentItem.original_title || currentItem.original_name;
  const imageURL = `${BACKDROP_BASE_URL}${currentItem.backdrop_path}`;
  const voteAverage = currentItem.vote_average || 0;
  const matchScore = voteAverage ? `${Math.round(voteAverage * 10)}% Match` : "95% Match";
  const dateStr = currentItem.release_date || currentItem.first_air_date || "";
  const year = dateStr ? dateStr.substring(0, 4) : "2023";
  const mediaType = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');

  return (
    <section className="hero" id="hero-section">
      <div 
        className={`hero-bg ${isFading ? '' : 'banner-fade'}`}
        style={{ 
          backgroundImage: `url("${imageURL}")`,
          opacity: isFading ? 0.3 : 1,
          transition: 'opacity 0.5s ease-in-out, background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="hero-overlay"></div>
      
      <div 
        className="hero-content"
        style={{ 
          opacity: isFading ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out'
        }}
      >
        <div className="hero-meta">
          <span className="hero-badge">Original</span>
          <span className="hero-match">{matchScore}</span>
          <span className="hero-year">{year}</span>
          <span className="hero-maturity">{mediaType === 'tv' ? 'TV-MA' : 'PG-13'}</span>
          <span className="hero-duration">Trending</span>
        </div>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-description">{currentItem.overview || "No description details available."}</p>
        
        <div className="hero-buttons">
          <button className="btn btn-play" onClick={() => alert(`Playing: ${title}`)}>
            <Play className="icon-fill" /> Play
          </button>
          <button className="btn btn-info" onClick={() => onMoreInfoClick(currentItem.id, mediaType)}>
            <Info /> More Info
          </button>
        </div>
      </div>

      <div className="hero-controls">
        <button className="btn-mute" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
        <span className="maturity-rating">{mediaType === 'tv' ? 'TV-MA' : 'PG-13'}</span>
      </div>
    </section>
  );
};

export default HeroBanner;
