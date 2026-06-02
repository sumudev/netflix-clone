import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';

const API_KEY = "8453fd0f070ffe11d0144258f9765a99";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const MovieModal = ({
  id,
  mediaType,
  onClose,
  onCardClick,
  myList,
  onToggleMyList,
  likedTitles,
  onToggleLike,
  onTrailerOpened
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);

  // Lock scrolling on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fetch details & trailer key dynamically
  useEffect(() => {
    const fetchDetailsAndVideos = async () => {
      setIsLoading(true);
      setTrailerKey(null);
      setIsPlayingTrailer(false);
      try {
        // Query details and credits/similar
        const resDetails = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=credits,similar`);
        const dataDetails = await resDetails.json();
        setDetails(dataDetails);

        // Fetch videos to resolve trailer
        const resVideos = await fetch(`${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`);
        const dataVideos = await resVideos.json();
        
        if (dataVideos && dataVideos.results && dataVideos.results.length > 0) {
          // Look for a YouTube Trailer
          const trailer = dataVideos.results.find(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          if (trailer) {
            setTrailerKey(trailer.key);
            // Delay auto-playing the trailer by 1.5 seconds for premium Netflix feel
            const playTimer = setTimeout(() => {
              setIsPlayingTrailer(true);
              if (onTrailerOpened) {
                onTrailerOpened(dataDetails.title || dataDetails.name);
              }
            }, 1500);
            return () => clearTimeout(playTimer);
          }
        }
      } catch (err) {
        console.error("Failed to load details and videos in modal", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailsAndVideos();
  }, [id, mediaType]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  if (isLoading || !details) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="modal-close" onClick={onClose}><X /></button>
          <p style={{ color: '#aaa' }}>Loading details...</p>
        </div>
      </div>
    );
  }

  const title = details.title || details.name || details.original_title || details.original_name;
  const bgPath = details.backdrop_path || details.poster_path;
  const imageURL = bgPath ? `${BACKDROP_BASE_URL}${bgPath}` : "";
  const voteAverage = details.vote_average || 0;
  const matchScore = voteAverage ? `${Math.round(voteAverage * 10)}% Match` : "95% Match";
  const dateStr = details.release_date || details.first_air_date || "";
  const year = dateStr ? dateStr.substring(0, 4) : "2023";
  const popularity = details.popularity ? Math.round(details.popularity) : 100;

  const isAdded = myList.has(String(details.id));
  const isLiked = likedTitles.has(details.id);

  const handleAddClick = () => {
    const cardData = {
      id: details.id,
      media_type: mediaType,
      title: title,
      backdrop_path: details.backdrop_path,
      poster_path: details.poster_path,
      vote_average: details.vote_average,
      release_date: details.release_date || details.first_air_date
    };
    onToggleMyList(details.id, cardData);
  };

  const handleManualPlayTrailer = () => {
    if (trailerKey) {
      setIsPlayingTrailer(true);
      if (onTrailerOpened) {
        onTrailerOpened(title);
      }
    } else {
      alert("No trailer video key resolved for this title from TMDB.");
    }
  };

  const similarList = details.similar && details.similar.results
    ? details.similar.results.filter(item => item.backdrop_path || item.poster_path).slice(0, 3)
    : [];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X /></button>

        {/* Dynamic Header: Video Trailer Player or Backdrop Image */}
        {isPlayingTrailer && trailerKey ? (
          <div className="modal-trailer-container">
            <iframe
              className="modal-trailer-iframe"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isTrailerMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            {/* Control HUD overlay for video */}
            <div className="modal-hero-overlay" style={{ pointerEvents: 'none' }}></div>
            <div className="modal-hero-content" style={{ pointerEvents: 'auto', bottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '90%' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '2rem', marginBottom: '15px' }}>{title}</h2>
                <div className="modal-buttons">
                  <button className="btn btn-play" onClick={() => setIsPlayingTrailer(false)}>
                    Close Trailer
                  </button>
                  <button 
                    className={`btn-circle ${isAdded ? 'active' : ''}`} 
                    onClick={handleAddClick}
                  >
                    {isAdded ? <Check /> : <Plus />}
                  </button>
                </div>
              </div>
              <button 
                className="btn-circle" 
                onClick={() => setIsTrailerMuted(!isTrailerMuted)}
                title={isTrailerMuted ? "Unmute" : "Mute"}
              >
                {isTrailerMuted ? <VolumeX /> : <Volume2 />}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-hero">
            <div 
              className="modal-hero-bg" 
              style={{ backgroundImage: `url("${imageURL}")` }}
            ></div>
            <div className="modal-hero-overlay"></div>
            <div className="modal-hero-content">
              <h2 className="modal-title">{title}</h2>
              <div className="modal-buttons">
                {trailerKey ? (
                  <button className="btn btn-play" onClick={handleManualPlayTrailer}>
                    <Play className="icon-fill" /> Play Trailer
                  </button>
                ) : (
                  <button className="btn btn-play" onClick={() => alert(`Playing: ${title}`)}>
                    <Play className="icon-fill" /> Play
                  </button>
                )}
                <button 
                  className={`btn-circle ${isAdded ? 'active' : ''}`} 
                  title={isAdded ? "Remove from List" : "Add to My List"}
                  onClick={handleAddClick}
                >
                  {isAdded ? <Check /> : <Plus />}
                </button>
                <button 
                  className={`btn-circle ${isLiked ? 'active' : ''}`} 
                  title="Like"
                  onClick={() => onToggleLike(details.id)}
                >
                  <ThumbsUp className={isLiked ? 'icon-fill' : ''} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Info Body */}
        <div className="modal-body">
          <div className="modal-body-left">
            <div className="modal-detail-wrapper">
              {details.poster_path && (
                <img 
                  src={`${IMAGE_BASE_URL}${details.poster_path}`} 
                  alt="Poster" 
                  className="modal-poster"
                />
              )}
              
              <div className="modal-text-details">
                <div className="modal-metadata">
                  <span className="match-rating">{matchScore}</span>
                  <span className="meta-item">{year}</span>
                  <span className="maturity-badge">{mediaType === 'tv' ? 'TV-MA' : 'PG-13'}</span>
                  <span className="meta-item">
                    {mediaType === 'movie' && details.runtime ? formatRuntime(details.runtime) : ''}
                    {mediaType === 'tv' && details.number_of_seasons ? `${details.number_of_seasons} ${details.number_of_seasons > 1 ? 'Seasons' : 'Season'}` : ''}
                  </span>
                  <span className="hd-badge">HD</span>
                </div>
                <p className="modal-desc">{details.overview || "No overview synopsis details available."}</p>
              </div>
            </div>
          </div>

          <div className="modal-body-right">
            <div className="modal-info-row">
              <span className="info-label">Cast:</span>
              <span className="info-value">
                {details.credits?.cast && details.credits.cast.length > 0
                  ? details.credits.cast.slice(0, 4).map(c => c.name).join(', ')
                  : 'N/A'}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="info-label">Genres:</span>
              <span className="info-value">
                {details.genres && details.genres.length > 0
                  ? details.genres.map(g => g.name).join(', ')
                  : 'N/A'}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="info-label">Popularity Score:</span>
              <span className="info-value">{popularity}</span>
            </div>
            <div className="modal-info-row">
              <span className="info-label">Tagline:</span>
              <span className="info-value" style={{ fontStyle: 'italic' }}>
                {details.tagline || 'Suspenseful, Exciting'}
              </span>
            </div>
          </div>
        </div>

        {/* More Like This (Suggestions) */}
        <div className="modal-suggestions">
          <h3>More Like This</h3>
          {similarList.length > 0 ? (
            <div className="suggestions-grid">
              {similarList.map(item => {
                const sTitle = item.title || item.name || item.original_title || item.original_name;
                const sImg = item.backdrop_path || item.poster_path;
                const sImgUrl = sImg ? `${IMAGE_BASE_URL}${sImg}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500";
                const sMatch = item.vote_average ? `${Math.round(item.vote_average * 10)}% Match` : "95% Match";
                const sDate = item.release_date || item.first_air_date || "";
                const sYear = sDate ? sDate.substring(0, 4) : "2023";

                return (
                  <div 
                    key={item.id} 
                    className="suggestion-card"
                    onClick={() => onCardClick(item.id, mediaType)}
                  >
                    <img src={sImgUrl} alt={sTitle} className="suggestion-card-img" />
                    <div className="suggestion-card-body">
                      <div className="suggestion-card-meta">
                        <span className="match">{sMatch}</span>
                        <div className="badge-row">
                          <span className="maturity">{mediaType === 'tv' ? 'TV-MA' : 'PG-13'}</span>
                          <span className="year">{sYear}</span>
                        </div>
                      </div>
                      <p className="suggestion-card-desc">{item.overview || "No description available."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>No similar recommendations found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
