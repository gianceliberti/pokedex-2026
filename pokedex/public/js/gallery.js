// gallery.js — grilla para explorar la Pokédex sin buscar de a uno

const galleryToggle = document.getElementById('galleryToggle');
const galleryContainer = document.getElementById('gallery');

const GALLERY_PAGE_SIZE = 24;
let galleryOffset = 0;
let galleryTotal = Infinity;
let galleryOpen = false;

// Extrae el número (id) de una URL tipo .../pokemon/25/
function idFromPokemonUrl(url) {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
}

// Abre/cierra la galería
function toggleGallery() {
    if (galleryOpen) {
        closeGallery();
    } else {
        galleryOpen = true;
        galleryToggle.textContent = '✖ Cerrar galería';
        // Limpia el detalle anterior para que la galería sea el foco
        clearPokemonInfo();
        clearErrorMessage();
        loadGalleryPage(galleryOffset);
    }
}

// Cierra la galería (también la usa el buscador al hacer una búsqueda)
function closeGallery() {
    galleryOpen = false;
    galleryToggle.textContent = '🗺️ Explorar Pokédex';
    galleryContainer.innerHTML = '';
    galleryContainer.classList.remove('open');
}

// Carga y muestra una página de la lista
async function loadGalleryPage(offset) {
    galleryOffset = Math.max(0, offset);
    galleryContainer.classList.add('open');
    galleryContainer.innerHTML = '<div class="gallery-loading">Cargando Pokédex…</div>';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${GALLERY_PAGE_SIZE}&offset=${galleryOffset}`);
        if (!response.ok) {
            throw new Error('gallery-failed');
        }
        const data = await response.json();
        galleryTotal = data.count;
        renderGallery(data.results);
    } catch (error) {
        console.error('No se pudo cargar la galería:', error);
        galleryContainer.innerHTML = '<div class="gallery-loading">No se pudo cargar la galería. Probá de nuevo.</div>';
    }
}

// Salta a la página que contiene al Pokémon con ese número
function goToPokemonNumber(number) {
    const n = Math.min(Math.max(1, number), galleryTotal);
    const offset = Math.floor((n - 1) / GALLERY_PAGE_SIZE) * GALLERY_PAGE_SIZE;
    loadGalleryPage(offset);
}

// Arma la lista de páginas a mostrar, con "…" donde hay saltos
function buildPageList(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const wanted = [1, total, current, current - 1, current + 1, current - 2, current + 2];
    const unique = [...new Set(wanted)].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

    const result = [];
    let prev = 0;
    unique.forEach(p => {
        if (p - prev > 1) {
            result.push('…');
        }
        result.push(p);
        prev = p;
    });
    return result;
}

// Dibuja la grilla + la paginación numerada + el salto por número
function renderGallery(list) {
    const cards = list
        .map(pokemon => {
            const id = idFromPokemonUrl(pokemon.url);
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            const displayName = capitalizeFirstLetter(pokemon.name);
            return `
                <button class="gallery-card" data-name="${pokemon.name}" title="${displayName}">
                    <span class="gallery-num">#${String(id).padStart(3, '0')}</span>
                    <img src="${spriteUrl}" alt="${pokemon.name}" loading="lazy" />
                    <span class="gallery-name">${displayName}</span>
                </button>`;
        })
        .join('');

    const from = galleryOffset + 1;
    const to = Math.min(galleryOffset + GALLERY_PAGE_SIZE, galleryTotal);
    const totalPages = Math.ceil(galleryTotal / GALLERY_PAGE_SIZE);
    const currentPage = Math.floor(galleryOffset / GALLERY_PAGE_SIZE) + 1;

    const pageButtons = buildPageList(currentPage, totalPages)
        .map(p => {
            if (p === '…') {
                return '<span class="gallery-ellipsis">…</span>';
            }
            const activeClass = p === currentPage ? ' active' : '';
            return `<button class="gallery-page${activeClass}" data-page="${p}">${p}</button>`;
        })
        .join('');

    const prevDisabled = galleryOffset === 0 ? 'disabled' : '';
    const nextDisabled = to >= galleryTotal ? 'disabled' : '';

    galleryContainer.innerHTML = `
        <div class="gallery-grid">${cards}</div>
        <div class="gallery-pager">
            <button class="gallery-nav" id="galleryPrev" ${prevDisabled} title="Anterior">◀</button>
            <div class="gallery-pages">${pageButtons}</div>
            <button class="gallery-nav" id="galleryNext" ${nextDisabled} title="Siguiente">▶</button>
        </div>
        <div class="gallery-jump">
            <span class="gallery-range">${from}–${to} de ${galleryTotal}</span>
            <span class="gallery-jump-form">
                Ir al #<input type="number" id="galleryJumpInput" min="1" max="${galleryTotal}" placeholder="400" />
                <button id="galleryJumpBtn" type="button">Ir</button>
            </span>
        </div>
    `;

    // Sprites inexistentes (algunas formas): los ocultamos con gracia
    galleryContainer.querySelectorAll('.gallery-card img').forEach(img => {
        img.addEventListener('error', () => img.classList.add('missing'));
    });

    // Click en una card → abre el detalle y cierra la galería
    galleryContainer.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            closeGallery();
            loadPokemon(name);
            document.getElementById('pokemonInfo').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Paginación: anterior / siguiente
    const prevButton = document.getElementById('galleryPrev');
    const nextButton = document.getElementById('galleryNext');
    if (prevButton) {
        prevButton.addEventListener('click', () => loadGalleryPage(galleryOffset - GALLERY_PAGE_SIZE));
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => loadGalleryPage(galleryOffset + GALLERY_PAGE_SIZE));
    }

    // Paginación: números de página
    galleryContainer.querySelectorAll('.gallery-page').forEach(button => {
        button.addEventListener('click', () => {
            const page = parseInt(button.dataset.page, 10);
            loadGalleryPage((page - 1) * GALLERY_PAGE_SIZE);
        });
    });

    // Salto directo a un número de Pokémon
    const jumpInput = document.getElementById('galleryJumpInput');
    const jumpButton = document.getElementById('galleryJumpBtn');
    const doJump = () => {
        const value = parseInt(jumpInput.value, 10);
        if (!Number.isNaN(value)) {
            goToPokemonNumber(value);
        }
    };
    if (jumpButton) {
        jumpButton.addEventListener('click', doJump);
    }
    if (jumpInput) {
        jumpInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                doJump();
            }
        });
    }
}

if (galleryToggle) {
    galleryToggle.addEventListener('click', toggleGallery);
}

// Exponer funciones puras para tests con Jest (ignorado en el navegador).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        idFromPokemonUrl,
        buildPageList,
    };
}
