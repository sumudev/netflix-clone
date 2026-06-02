import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

const API_KEY = "8453fd0f070ffe11d0144258f9765a99";
const BASE_URL = "https://api.themoviedb.org/3";

const MovieRow = ({
  title,
  fetchUrl,
  fallbackType,
  isRanked = false,
  onCardClick,
  myList,
  onToggleMyList,
  likedTitles,
  onToggleLike
}) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const postersContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Local Watchlist
      if (fetchUrl === 'mylist') {
        setMovies(Array.from(myList.values()));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${BASE_URL}${fetchUrl}`);
        const data = await res.json();
        if (data && data.results) {
          // Filter results with backdrops or posters
          const filtered = data.results.filter(movie => movie.backdrop_path || movie.poster_path);
          // If it's the Top 10 row, slice the array to get exactly 10 items!
          setMovies(isRanked ? filtered.slice(0, 10) : filtered);
        }
      } catch (err) {
        console.error(`Failed to fetch row: ${title}`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl, myList, isRanked]);

  const handleScroll = (direction) => {
    if (postersContainerRef.current) {
      const container = postersContainerRef.current;
      const scrollAmount = container.offsetWidth * 0.75;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };

  if (fetchUrl === 'mylist' && movies.length === 0) return null;

  return (
    <section className="movie-row">
      <h2 className="row-title">{title}</h2>
      
      <div className="row-wrapper">
        <button className="row-arrow arrow-left" onClick={() => handleScroll('left')}>
          <ChevronLeft />
        </button>

        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div ref={postersContainerRef} className="row-posters-container">
            {movies.map((movie, index) => {
              const mType = movie.media_type || fallbackType || (movie.title ? 'movie' : 'tv');
              const isAdded = myList.has(String(movie.id));
              const isLiked = likedTitles.has(movie.id);

              const card = (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  mediaType={mType}
                  onCardClick={onCardClick}
                  isAddedToList={isAdded}
                  onToggleMyList={onToggleMyList}
                  isLiked={isLiked}
                  onToggleLike={onToggleLike}
                />
              );

              if (isRanked) {
                return (
                  <div key={movie.id} className="ranked-card-container">
                    <span className="rank-number">{index + 1}</span>
                    {card}
                  </div>
                );
              }

              return card;
            })}
          </div>
        )}

        <button className="row-arrow arrow-right" onClick={() => handleScroll('right')}>
          <ChevronRight />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
