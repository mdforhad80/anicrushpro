/* ============================================
   ANIME STREAM - CORE JAVASCRIPT
   Premium anime streaming platform
   ============================================ */

const APP = {
    API_BASE: 'https://api.jikan.moe/v4',
    STREAM_BASE: 'https://megaplay.buzz/stream/mal',
    DEFAULT_ANIME_IDS: [
        5114, 41467, 9253, 28977, 43608, 42938, 40591, 52034,
        38000, 40748, 16498, 1535, 30276, 31964, 38524, 21,
        11061, 35790, 37779, 39940, 48583, 50653, 50172, 40750
    ],
    HERO_ANIME: [5114, 41467, 9253, 43608, 38000],
    cache: new Map(),
    init() {
        this.setupLoading();
        this.setupHeader();
        this.setupSidebar();
        this.setupSearch();
        this.setupParticles();
        this.setupCursorGlow();
        this.setupMobileNav();
        this.setupKeyboardShortcuts();
    },

    /* ============================================
       LOADING SCREEN
       ============================================ */
    setupLoading() {
        const loader = document.querySelector('.loading-screen');
        if (!loader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 800);
        });
    },

    /* ============================================
       HEADER SCROLL EFFECT
       ============================================ */
    setupHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        }, { passive: true });
    },

    /* ============================================
       SIDEBAR
       ============================================ */
    setupSidebar() {
        const menuBtn = document.querySelector('.menu-btn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const closeBtn = document.querySelector('.sidebar-close');

        if (!menuBtn || !sidebar) return;

        const open = () => {
            sidebar.classList.add('active');
            overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            sidebar.classList.remove('active');
            overlay?.classList.remove('active');
            document.body.style.overflow = '';
        };

        menuBtn.addEventListener('click', open);
        closeBtn?.addEventListener('click', close);
        overlay?.addEventListener('click', close);

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    },

    /* ============================================
       SEARCH OVERLAY
       ============================================ */
    setupSearch() {
        const searchBtn = document.querySelector('.search-btn');
        const overlay = document.querySelector('.search-overlay');
        const closeBtn = document.querySelector('.search-close');
        const input = document.querySelector('.search-input');
        const resultsContainer = document.querySelector('.search-results');

        if (!searchBtn || !overlay) return;

        const open = () => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => input?.focus(), 100);
        };

        const close = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (input) input.value = '';
        };

        searchBtn.addEventListener('click', open);
        closeBtn?.addEventListener('click', close);

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                close();
            }
        });

        // Debounced search
        let searchTimeout;
        input?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 2) {
                this.renderSearchSuggestions(resultsContainer);
                return;
            }

            searchTimeout = setTimeout(() => {
                this.performSearch(query, resultsContainer);
            }, 400);
        });

        // Initial suggestions
        this.renderSearchSuggestions(resultsContainer);
    },

    async performSearch(query, container) {
        if (!container) return;
        container.innerHTML = '<div class="skeleton" style="height:200px;width:100%"></div>';

        try {
            const res = await fetch(`${this.API_BASE}/anime?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();

            if (!data.data?.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">No results found</p>';
                return;
            }

            container.innerHTML = '<div class="anime-grid" id="search-grid"></div>';
            const grid = container.querySelector('#search-grid');

            data.data.forEach(anime => {
                grid.appendChild(this.createAnimeCard(anime));
            });
        } catch (err) {
            container.innerHTML = '<p style="text-align:center;color:#ef4444;padding:40px">Search failed. Please try again.</p>';
        }
    },

    renderSearchSuggestions(container) {
        if (!container) return;
        const suggestions = ['Action', 'Romance', 'Isekai', 'Shounen', 'Mecha', 'Horror', 'Slice of Life', 'Fantasy'];
        container.innerHTML = `
            <div style="margin-bottom:16px;color:var(--muted);font-size:0.9rem">Popular searches</div>
            <div class="search-suggestions">
                ${suggestions.map(s => `<span class="search-suggestion" data-query="${s}">${s}</span>`).join('')}
            </div>
            <div style="margin-top:32px;color:var(--muted);font-size:0.9rem">Type to search anime...</div>
        `;

        container.querySelectorAll('.search-suggestion').forEach(el => {
            el.addEventListener('click', () => {
                const input = document.querySelector('.search-input');
                if (input) {
                    input.value = el.dataset.query;
                    input.dispatchEvent(new Event('input'));
                }
            });
        });
    },

    /* ============================================
       PARTICLES
       ============================================ */
    setupParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 15) + 's';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    },

    /* ============================================
       CURSOR GLOW
       ============================================ */
    setupCursorGlow() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const glow = document.querySelector('.cursor-glow');
        if (!glow) return;

        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';
            requestAnimationFrame(animate);
        };
        animate();
    },

    /* ============================================
       MOBILE NAV
       ============================================ */
    setupMobileNav() {
        // Highlight current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            if (item.getAttribute('href')?.includes(currentPage)) {
                item.classList.add('active');
            }
        });
    },

    /* ============================================
       KEYBOARD SHORTCUTS
       ============================================ */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // / or Ctrl+K for search
            if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                document.querySelector('.search-btn')?.click();
            }
            // M for menu
            if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
                const menuBtn = document.querySelector('.menu-btn');
                const sidebar = document.querySelector('.sidebar');
                if (sidebar?.classList.contains('active')) {
                    document.querySelector('.sidebar-close')?.click();
                } else {
                    menuBtn?.click();
                }
            }
        });
    },

    /* ============================================
       API HELPERS
       ============================================ */
    async fetchAnime(id) {
        if (this.cache.has(`anime_${id}`)) {
            return this.cache.get(`anime_${id}`);
        }
        try {
            const res = await fetch(`${this.API_BASE}/anime/${id}/full`);
            const data = await res.json();
            if (data.data) {
                this.cache.set(`anime_${id}`, data.data);
                return data.data;
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
        return null;
    },

    async fetchTopAnime(type = 'airing', limit = 10) {
        const cacheKey = `top_${type}_${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            const res = await fetch(`${this.API_BASE}/top/anime?filter=${type}&limit=${limit}`);
            const data = await res.json();
            if (data.data) {
                this.cache.set(cacheKey, data.data);
                return data.data;
            }
        } catch (err) {
            console.error('Top anime error:', err);
        }
        return [];
    },

    async fetchSeasonalAnime(year, season, limit = 10) {
        const cacheKey = `seasonal_${year}_${season}_${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            const res = await fetch(`${this.API_BASE}/seasons/${year}/${season}?limit=${limit}`);
            const data = await res.json();
            if (data.data) {
                this.cache.set(cacheKey, data.data);
                return data.data;
            }
        } catch (err) {
            console.error('Seasonal error:', err);
        }
        return [];
    },

    async fetchSchedule(day) {
        const cacheKey = `schedule_${day}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            const res = await fetch(`${this.API_BASE}/schedules?filter=${day}&limit=25`);
            const data = await res.json();
            if (data.data) {
                this.cache.set(cacheKey, data.data);
                return data.data;
            }
        } catch (err) {
            console.error('Schedule error:', err);
        }
        return [];
    },

    /* ============================================
       CARD CREATOR
       ============================================ */
    createAnimeCard(anime) {
        const card = document.createElement('a');
        card.className = 'anime-card';
        card.href = `anime.html?id=${anime.mal_id}`;

        const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x450/1a1a24/8b5cf6?text=No+Image';
        const title = anime.title_english || anime.title;
        const rating = anime.score ? `★ ${anime.score}` : '';
        const type = anime.type || 'TV';
        const episodes = anime.episodes ? `${anime.episodes} EP` : '?? EP';
        const status = anime.status || 'Unknown';

        card.innerHTML = `
            <div class="anime-card-img">
                <img src="${img}" alt="${title}" loading="lazy">
                <div class="anime-card-badge">${type}</div>
                <div class="anime-card-ep">${episodes}</div>
                <div class="anime-card-overlay">
                    <div class="anime-card-play">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="anime-card-info">
                <div class="anime-card-title">${title}</div>
                <div class="anime-card-meta">
                    <span class="rating">${rating}</span>
                    <span class="dot"></span>
                    <span>${status}</span>
                </div>
            </div>
        `;

        return card;
    },

    createSkeletonCard() {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
        `;
        return card;
    },

    /* ============================================
       CAROUSEL
       ============================================ */
    setupCarousel(trackSelector, prevSelector, nextSelector) {
        const track = document.querySelector(trackSelector);
        const prevBtn = document.querySelector(prevSelector);
        const nextBtn = document.querySelector(nextSelector);

        if (!track) return;

        let position = 0;
        const cardWidth = 220;
        const gap = 20;

        const update = () => {
            track.style.transform = `translateX(${position}px)`;
            const maxScroll = -(track.scrollWidth - track.parentElement.clientWidth);

            if (prevBtn) {
                prevBtn.classList.toggle('hidden', position >= 0);
            }
            if (nextBtn) {
                nextBtn.classList.toggle('hidden', position <= maxScroll);
            }
        };

        prevBtn?.addEventListener('click', () => {
            position = Math.min(position + (cardWidth + gap) * 3, 0);
            update();
        });

        nextBtn?.addEventListener('click', () => {
            const maxScroll = -(track.scrollWidth - track.parentElement.clientWidth);
            position = Math.max(position - (cardWidth + gap) * 3, maxScroll);
            update();
        });

        update();
    },

    /* ============================================
       HERO SLIDER
       ============================================ */
    setupHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        if (!slides.length) return;

        let current = 0;

        const show = (index) => {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
            current = index;
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => show(i));
        });

        // Auto slide
        setInterval(() => {
            show((current + 1) % slides.length);
        }, 6000);
    },

    /* ============================================
       LOCAL STORAGE HELPERS
       ============================================ */
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('watch_history') || '[]');
        } catch {
            return [];
        }
    },

    addToHistory(animeId, episode, type = 'sub', title = '', image = '') {
        let history = this.getHistory();
        history = history.filter(h => h.id !== animeId);
        history.unshift({
            id: animeId,
            episode,
            type,
            title,
            image,
            timestamp: Date.now()
        });
        history = history.slice(0, 50);
        localStorage.setItem('watch_history', JSON.stringify(history));
    },

    getContinueWatching() {
        return this.getHistory().slice(0, 10);
    },

    saveProgress(animeId, episode, progress) {
        const key = `progress_${animeId}`;
        const data = {
            episode,
            progress,
            updated: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
    },

    getProgress(animeId) {
        try {
            return JSON.parse(localStorage.getItem(`progress_${animeId}`) || '{}');
        } catch {
            return {};
        }
    },

    /* ============================================
       TOAST
       ============================================ */
    toast(message, type = 'info') {
        const container = document.querySelector('.toast-container') || (() => {
            const c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
            return c;
        })();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                ${type === 'success' 
                    ? '<path d="M20 6L9 17l-5-5"/>' 
                    : type === 'error' 
                        ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
                        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
                }
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    /* ============================================
       UTILS
       ============================================ */
    getParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    },

    formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => APP.init());


/* ============================================
   SERVICE WORKER REGISTRATION
   ============================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}
