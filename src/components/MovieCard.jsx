import React, { useState, useRef } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({
  movie,
  mediaType,
  onCardClick,
  isAddedToList,
  onToggleMyList,
  isLiked,
  onToggleLike
}) => {
  const [isActiveHover, setIsActiveHover] = useState(false);
  const [hoverStyle, setHoverStyle] = useState({});
  const cardRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const title = movie.title || movie.name || movie.original_title || movie.original_name;
  const imagePath = movie.backdrop_path || movie.poster_path;
  const imageURL = imagePath ? `${IMAGE_BASE_URL}${imagePath}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500";

  const voteAverage = movie.vote_average || 0;
  const matchScore = voteAverage ? `${Math.round(voteAverage * 10)}% Match` : "95% Match";
  const dateStr = movie.release_date || movie.first_air_date || "";
  const year = dateStr ? dateStr.substring(0, 4) : "2023";

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: none)').matches) {
      return;
    }
    // 400ms delay to prevent scaling during rapid scrolling
    hoverTimeoutRef.current = setTimeout(() => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const cardWidth = rect.width;
      const scale = 1.3;
      const expandedWidth = cardWidth * scale;
      const overhang = (expandedWidth - cardWidth) / 2;
      const leftEdge = rect.left - overhang;
      const rightEdge = rect.right + overhang;

      let transformOrigin = "center center";
      let transform = "scale(1.3) translateY(-15%)";

      // Detect viewport boundary crossings and shift scaling pivots
      if (leftEdge < 12) {
        transformOrigin = "left center";
        transform = "scale(1.3) translateY(-15%) translateX(0)";
      } else if (rightEdge > viewportWidth - 12) {
        transformOrigin = "right center";
        transform = "scale(1.3) translateY(-15%) translateX(0)";
      }

      setHoverStyle({ transformOrigin, transform });
      setIsActiveHover(true);
    }, 450);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsActiveHover(false);
    setHoverStyle({});
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    alert(`Playing: ${title}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    // Prepare standardized movie details to keep list row populated
    const cardData = {
      id: movie.id,
      media_type: mediaType,
      title: title,
      backdrop_path: movie.backdrop_path,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date || movie.first_air_date
    };
    onToggleMyList(movie.id, cardData);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onToggleLike(movie.id);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    onCardClick(movie.id, mediaType);
  };

  return (
    <div
      ref={cardRef}
      className={`movie-card ${isActiveHover ? 'active-hover' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(movie.id, mediaType)}
    >
      <div className="card-img-wrapper">
        <img src={imageURL} alt={title} className="card-img" loading="lazy" />
      </div>

      <div 
        className="card-hover-details"
        style={hoverStyle}
      >
        <img src={imageURL} alt={title} className="hover-img" />
        <div className="hover-info">
          <div className="hover-actions">
            <div className="actions-left">
              <button 
                className="btn btn-play" 
                title="Play" 
                onClick={handlePlayClick}
              >
                <Play className="icon-fill" />
              </button>
              <button 
                className="btn-circle" 
                title={isAddedToList ? "Remove from List" : "Add to My List"} 
                onClick={handleAddClick}
              >
                {isAddedToList ? <Check /> : <Plus />}
              </button>
              <button 
                className={`btn-circle ${isLiked ? 'active' : ''}`} 
                title="Like" 
                onClick={handleLikeClick}
              >
                <ThumbsUp className={isLiked ? 'icon-fill' : ''} />
              </button>
            </div>
            <button 
              className="btn-circle" 
              title="More Info" 
              onClick={handleInfoClick}
            >
              <ChevronDown />
            </button>
          </div>
          <div className="hover-title">{title}</div>
          <div className="hover-meta">
            <span className="hover-match">{matchScore}</span>
            <span className="hover-maturity">{mediaType === 'tv' ? 'TV-MA' : 'PG-13'}</span>
            <span className="hover-year">{year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
