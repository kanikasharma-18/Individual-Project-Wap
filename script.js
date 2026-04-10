const synopsis = document.getElementById("heroSynopsis");

synopsis.addEventListener("click", () => {
  synopsis.classList.toggle("expanded");
});
const slidesTrack = document.getElementById("slidesTrack");
const heroBg      = document.getElementById("heroBg");
const heroRank    = document.getElementById("heroRank");
const heroTitle   = document.getElementById("heroTitle");
const heroScore   = document.getElementById("heroScore");
const heroSynopsis= document.getElementById("heroSynopsis");
const heroInfo    = document.getElementById("heroInfo");
const heroDots    = document.getElementById("heroDots");
const prevBtn     = document.getElementById("prevBtn");
const nextBtn     = document.getElementById("nextBtn");

let currentSlide = 0;
let heroAnimes   = [];
let autoTimer    = null;

// ── Fetch top anime
fetch("https://api.jikan.moe/v4/top/anime")
  .then(res => res.json())
  .then(data => {
    const animes = data.data;

    // Top 7 go into the hero slider
    heroAnimes = animes.slice(0, 7);

    // Build hero slides
    heroAnimes.forEach(anime => {
      const slide = document.createElement("div");
      slide.classList.add("slide");

      const img = document.createElement("img");
      img.src = anime.images.jpg.large_image_url;
      img.alt = anime.title;

      slide.appendChild(img);
      slidesTrack.appendChild(slide);
    });

    // Build dots
    heroAnimes.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      heroDots.appendChild(dot);
    });
    updateInfo(0);
    startAuto()
  })
  .catch(err => {
    container.innerHTML = "Failed to load data";
    console.error(err);
  });

// ── Update hero info panel
function updateInfo(index) {
  const anime = heroAnimes[index];

  // Fade out
  heroInfo.classList.add("fade");

  setTimeout(() => {
    // Update background
    heroBg.style.backgroundImage = `url('${anime.images.jpg.large_image_url}')`;

    // Update text
    heroRank.textContent     = `TRENDING #${index + 1}`;
    heroTitle.textContent    = anime.title;
    heroScore.textContent    = `Rating-${anime.score}`;
    heroSynopsis.textContent = anime.synopsis || "";

    // Fade in
    heroInfo.classList.remove("fade");
  }, 350);

  // Update dots
  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// ── Go to a slide
function goToSlide(index) {
  currentSlide = index;
  slidesTrack.style.transform = `translateX(-${index * 100}%)`;
  updateInfo(index);
  resetAuto();
}

// ── Arrow buttons
prevBtn.addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + heroAnimes.length) % heroAnimes.length;
  goToSlide(currentSlide);
});

nextBtn.addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % heroAnimes.length;
  goToSlide(currentSlide);
});

// ── Auto-slide every 2s
function startAuto() {
  autoTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % heroAnimes.length;
    goToSlide(currentSlide);
  }, 2000);
}

function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}
  //  SEARCH & FILTER SECTION
const searchEl    = document.getElementById("anime-search");
const genreEl     = document.getElementById("anime-genre");
const sortBtn     = document.getElementById("anime-sort");
const grid        = document.getElementById("anime-grid");
const emptyEl     = document.getElementById("anime-empty");
const countEl     = document.getElementById("anime-count");
const tagsEl      = document.getElementById("anime-tags");
let animeList     = [];
let searchText    = "";
let selectedGenre = "";
let sortByRating  = false;
let debounceTimer = null;
// ── Show skeleton placeholders while loading
function showSkeletons() {
  grid.innerHTML = Array.from({ length: 10 }, () => `
    <div class="anime-skeleton">
      <div class="skeleton-poster"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>`).join("");
  emptyEl.classList.remove("visible");
  countEl.textContent = "";
}
// ── Build a single card's HTML
function cardHTML(anime, index) {
  const title  = anime.title_english || anime.title || "Unknown";
  const img    = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "";
  const score  = anime.score ? anime.score.toFixed(1) : "N/A";
  const rank   = anime.rank ? `#${anime.rank}` : "";
  const genres = (anime.genres || []).slice(0, 3);
  const delay  = Math.min(index * 40, 600);
  const malUrl = `https://myanimelist.net/anime/${anime.mal_id}`;
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280'%3E%3Crect fill='%231F1F1F' width='200' height='280'/%3E%3Ctext fill='%23444' font-size='40' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E%F0%9F%8E%AC%3C/text%3E%3C/svg%3E";
  return `
    <div class="anime-card" style="animation-delay:${delay}ms" onclick="window.open('${malUrl}','_blank')">
      <div class="anime-card-poster">
        <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='${fallback}'"/>
        ${rank ? `<div class="anime-rank-badge">${rank}</div>` : ""}
        <div class="anime-rating-badge">★ ${score}</div>
      </div>
      <div class="anime-card-body">
        <div class="anime-card-title">${title}</div>
        <div class="anime-card-genres">
          ${genres.map(g => `<span class="genre-pill">${g.name}</span>`).join("")}
        </div>
      </div>
    </div>`;
}
// ── Apply search + genre filter + sort
function getFiltered() {
  let list = [...animeList];
  if (searchText) {
    list = list.filter(a =>
      a.title.toLowerCase().includes(searchText) ||
      (a.title_english || "").toLowerCase().includes(searchText)
    );
  }
  if (selectedGenre) {
    list = list.filter(a =>
      Array.isArray(a.genres) &&
      a.genres.some(g => g.name === selectedGenre)
    );
  }
  if (sortByRating) {
    list.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  return list;
}
// ── Render the grid
function render() {
  const results = getFiltered();
  countEl.innerHTML = `Showing <span>${results.length}</span> of ${animeList.length} anime`;
  renderTags();
 
  if (results.length === 0) {
    grid.innerHTML = "";
    emptyEl.classList.add("visible");
    return;
  }
  emptyEl.classList.remove("visible");
  grid.innerHTML = results.map((anime, i) => cardHTML(anime, i)).join("");
}
// ── Render active filter tags
function renderTags() {
  tagsEl.innerHTML = "";
  if (searchText) {
    tagsEl.appendChild(makeTag(`"${searchText}"`, () => {
      searchText = "";
      searchEl.value = "";
      render();
    }));
  }
  if (selectedGenre) {
    tagsEl.appendChild(makeTag(selectedGenre, () => {
      selectedGenre = "";
      genreEl.value = "";
      render();
    }));
  }
  if (sortByRating) {
    tagsEl.appendChild(makeTag("Top Rated", () => {
      sortByRating = false;
      sortBtn.classList.remove("active");
      render();
    }));
  }
}
// ── Create a removable filter tag button
function makeTag(label, onRemove) {
  const tag = document.createElement("button");
  tag.className = "anime-tag";
  tag.innerHTML = `${label} <span class="anime-tag-x">×</span>`;
  tag.addEventListener("click", onRemove);
  return tag;
}
// ── Search input (debounced 300ms)
searchEl.addEventListener("input", e => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchText = e.target.value.trim().toLowerCase();
    render();
  }, 300);
});
// ── Genre dropdown
genreEl.addEventListener("change", e => {
  selectedGenre = e.target.value;
  render();
});
// ── Sort toggle button
sortBtn.addEventListener("click", () => {
  sortByRating = !sortByRating;
  sortBtn.classList.toggle("active", sortByRating);
  render();
});
// ── Fetch anime for the browse grid 
showSkeletons();
fetch("https://api.jikan.moe/v4/top/anime?page=1&limit=25")
  .then(res => res.json())
  .then(data => {
    animeList = data.data || [];
    render();
  })
  .catch(err => {
    console.error(err);
  });
  // LIGHT / DARK MODE TOGGLE
const toggleBtn = document.getElementById("themeToggle");
// Load saved mode
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  toggleBtn.textContent = "Light Mode";
}
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "Light Mode";
  } else {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "Dark Mode";
  }
});