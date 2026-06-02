# 🎬 Netflix Clone - Premium Streaming UI

[![Netlify Status](https://api.netlify.com/api_v1/badges/af27f3b3-cc18-457d-ba34-a1f73b096efb/deploy-status)](https://app.netlify.com/projects/netflx-clone-sumudev)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%26%20Vite-blue?style=flat-square&logo=react)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-Custom%20CSS-ff69b4?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-Educational%20Only-red?style=flat-square)](https://choosealicense.com/no-license/)

A premium, fully responsive Netflix Clone interface with high-fidelity UI animations, profile management, dynamic hero banner rotation, full search integration, lists persistence, and trailer video playback.

🔗 **Live Demo URL:** [https://netflx-clone-sumudev.netlify.app](https://netflx-clone-sumudev.netlify.app)

---

## 🚀 Features

- 👤 **Multiple User Profiles**: Interactive onboarding profile selector screen allowing you to create, manage, and partition profile lists.
- 🎬 **Dynamic Hero Billboard**: Auto-rotating hero banner showing top trending titles with play controls and mute overrides.
- 🎥 **Smooth Swipe Carousels**: Categorized horizontal rows supporting native mouse/touch swipe gestures with custom scrolling.
- 🔢 **Top 10 Rankings**: Giant ranking numbers that overlap poster cards.
- 🔍 **Real-time debounced Search**: Dropdown suggestions list and search results grid matching titles, descriptions, and metadata.
- 📺 **Trailer Video Player**: Embedded YouTube trailers that autoplay in a details modal window with custom mute/volume HUD overlays.
- 📂 **Profile Watchlist ("My List")**: Add or remove content from your list. Saved in LocalStorage separately for each user profile.
- 🌗 **Light & Dark Theme toggles**: Responsive overrides shifting visual styles seamlessly.
- 📱 **100% Fully Responsive**: Viewport-boundary-aware hover scales (`1.3x`) that prevent off-screen clipping, mobile "Browse" menus, and mobile grid alignments.

---

## 💻 Tech Stack

| Technology | Logo | Description |
|:---|:---:|:---|
| **React** | <img src="https://simpleicons.org/icons/react.svg" width="20" height="20" /> | Frontend UI framework for modular state representation |
| **Vite** | <img src="https://simpleicons.org/icons/vite.svg" width="20" height="20" /> | Ultra-fast local development bundler and builder |
| **JavaScript (ES6)** | <img src="https://simpleicons.org/icons/javascript.svg" width="20" height="20" /> | Asynchronous fetch calls, state management, and DOM bindings |
| **CSS3** | <img src="https://simpleicons.org/icons/css3.svg" width="20" height="20" /> | Flexbox/Grid layouts, fluid custom properties, keyframe animations |
| **TMDB API** | <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d53e7a859ad53a6147d3384dbfa29d62.svg" width="20" height="20" /> | Source for movie details, trailers, backdrops, and rankings |
| **Netlify** | <img src="https://simpleicons.org/icons/netlify.svg" width="20" height="20" /> | Production build hosting and Continuous Deployment |

---

## 📂 Project Structure

```
netflix-clone/
├── public/                 # Static assets (favicons, logos)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── HeroBanner.jsx  # Hero billboard with auto-rotation
│   │   ├── MovieCard.jsx   # Individual card with touch/hover boundaries
│   │   ├── MovieModal.jsx  # Pop-up details view and trailer iframe
│   │   ├── MovieRow.jsx    # Horizontal swipe carousels (and Top 10 rankings)
│   │   ├── Navbar.jsx      # Sticky top bar with mobile Browse menu & search input
│   │   ├── SkeletonLoader.jsx # Shimmer card placeholders
│   │   ├── Toast.jsx       # Floating notification alert cues
│   │   └── UserProfile.jsx # Who's watching profile selector interface
│   ├── App.jsx             # App state orchestrator and tab router
│   ├── index.css           # Global custom stylesheet (tokens & media queries)
│   └── main.jsx            # React root container mount
├── package.json            # Dependencies and scripts listing
├── vite.config.js          # Vite configuration settings
└── README.md               # Documentation guide
```

---

## 🛠️ How to Run Locally

Follow these steps to set up and run the project locally on your machine:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/sumudev/netflix-clone.git
   cd netflix-clone
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure the TMDB API Key:**
   The application communicates with TMDB to fetch catalog listings. The API key is configured inside `src/App.jsx`, `src/components/Navbar.jsx`, `src/components/HeroBanner.jsx`, `src/components/MovieRow.jsx`, and `src/components/MovieModal.jsx`.
   
   If you wish to use your own API key:
   * Register on [The Movie Database (TMDB)](https://www.themoviedb.org/).
   * Retrieve your API Key v3.
   * Replace the variable value `const API_KEY = "your_api_key";` in the source files.

4. **Launch Local Server:**
   ```bash
   npm run dev
   ```
   *The site will start hosting at **[http://localhost:5173/](http://localhost:5173/)** in your browser.*

---

## 🔌 TMDB API Endpoints Used

| Endpoint Group | API Endpoint | Description |
|:---|:---|:---|
| **Trending** | `/trending/all/week` | Fetches weekly trending movies/shows for banners and rows |
| **Top 10 Today** | `/trending/all/day` | Slices top 10 items to render ranks |
| **Originals** | `/discover/tv?with_networks=213` | Fetches Netflix TV network exclusives |
| **TV Shows** | `/trending/tv/week` & `/tv/popular` | Populates TV show sliders |
| **Movies** | `/movie/popular` & `/discover/movie` | Resolves Genre categories (Action, Comedy, Horror) |
| **Search** | `/search/multi?query=...` | Searches titles, cast, and genres in real-time |
| **Details & Media** | `/{media_type}/{id}` | Pulls credits, runtimes, taglines, and poster assets |
| **Trailers** | `/{media_type}/{id}/videos` | Resolves YouTube video keys for details modals |

---

## 💡 What I Learned

- **Responsive Viewport Scaling**: Gained deep knowledge on aligning grids and outlines on extra-small mobile screen sizes (e.g. iPhone SE) using standard media queries and fluid root properties (`clamp()` and `var()`).
- **Touch Input Guard Boundaries**: Learned to differentiate standard mouse hover events from screen taps on touch devices using `@media (hover: hover)` logic. This prevented double-hover bugs on mobile.
- **Debounced Fetch Optimization**: Implemented delayed search states in React to optimize network usage, limiting fetches until the user stops typing for `300ms`.
- **LocalStorage Data Partitioning**: Handled state synchronization per user profile, saving watch histories under unique namespaces (`netflix_react_mylist_${profile.id}`) to isolate watchlist states.

---

## 🔮 Future Improvements

- [ ] **Custom Video Player**: Build a custom HTML5 video interface instead of the YouTube iframe fallback.
- [ ] **Trailer Previews on Hover**: Autoplay short trailer clips directly inside cards during desktop hover.
- [ ] **Profile Lock PINs**: Add 4-digit security PIN entries to private user profiles.
- [ ] **Genre Filter Search Pages**: Implement category tabs with page sorting filters.

---

## ⚖️ License Disclaimer
This project is built for **educational purposes only**. All content assets, trademark logos, and catalog names belong to Netflix, Inc. and TMDB.

---

## 👤 Author

**Sumu Dev**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sumudev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sumudev)
