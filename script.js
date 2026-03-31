const synopsis = document.getElementById("heroSynopsis");

synopsis.addEventListener("click", () => {
  synopsis.classList.toggle("expanded");
});

const container   = document.getElementById("container");
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
