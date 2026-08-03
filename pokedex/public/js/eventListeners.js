// eventListeners.js

const searchInput = document.getElementById('pokemonName');
const autocompleteList = document.getElementById('autocompleteList');

// Lista completa de nombres (para el autocompletado propio) e índice resaltado
let pokemonNames = [];
let activeIndex = -1;

// Lanza la búsqueda con lo que haya en el input
function runSearch() {
    const pokemonName = searchInput.value.trim();
    if (pokemonName) {
        if (typeof closeGallery === 'function') {
            closeGallery();
        }
        getPokemonByName(pokemonName);
    }
}

// Botón de búsqueda por nombre
document.getElementById('searchByName').addEventListener('click', () => {
    closeSuggestions();
    runSearch();
});

// ---- Autocompletado propio (reemplaza al <datalist> nativo) ----

// Carga la lista completa de nombres una sola vez
async function loadPokemonNames() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        pokemonNames = data.results.map(pokemon => pokemon.name);
    } catch (error) {
        console.error('No se pudo cargar la lista de nombres para autocompletar:', error);
    }
}

// Cuántas sugerencias mostrar como máximo (para no tapar toda la pantalla)
const MAX_SUGGESTIONS = 8;

// Filtra y dibuja las sugerencias según lo tipeado
function renderSuggestions(query) {
    const q = query.trim().toLowerCase();
    activeIndex = -1;

    if (!q) {
        closeSuggestions();
        return;
    }

    // Primero los que empiezan con la búsqueda; después los que la contienen
    const startsWith = pokemonNames.filter(name => name.startsWith(q));
    const contains = pokemonNames.filter(name => name.includes(q) && !name.startsWith(q));
    const matches = startsWith.concat(contains).slice(0, MAX_SUGGESTIONS);

    if (matches.length === 0) {
        closeSuggestions();
        return;
    }

    autocompleteList.innerHTML = matches
        .map(name => `<div class="autocomplete-item" role="option" data-name="${name}">${name}</div>`)
        .join('');
    autocompleteList.classList.add('open');
}

// Cierra el desplegable
function closeSuggestions() {
    autocompleteList.innerHTML = '';
    autocompleteList.classList.remove('open');
    activeIndex = -1;
}

// Selecciona una sugerencia: completa el input y busca
function selectSuggestion(name) {
    searchInput.value = name;
    closeSuggestions();
    getPokemonByName(name);
}

// Resalta visualmente la sugerencia activa (navegación con teclado)
function updateActiveItem(items) {
    items.forEach((item, index) => item.classList.toggle('active', index === activeIndex));
    if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Mientras se escribe, refrescamos las sugerencias
searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));

// Teclado: flechas para navegar, Enter para elegir/buscar, Escape para cerrar
searchInput.addEventListener('keydown', (event) => {
    const items = Array.from(autocompleteList.querySelectorAll('.autocomplete-item'));

    if (event.key === 'ArrowDown' && items.length) {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateActiveItem(items);
    } else if (event.key === 'ArrowUp' && items.length) {
        event.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
            selectSuggestion(items[activeIndex].dataset.name);
        } else {
            closeSuggestions();
            runSearch();
        }
    } else if (event.key === 'Escape') {
        closeSuggestions();
    }
});

// Click en una sugerencia (mousedown para adelantarse al blur del input)
autocompleteList.addEventListener('mousedown', (event) => {
    const item = event.target.closest('.autocomplete-item');
    if (!item) {
        return;
    }
    event.preventDefault();
    selectSuggestion(item.dataset.name);
});

// Cierra el desplegable al hacer click fuera del buscador
document.addEventListener('click', (event) => {
    if (!event.target.closest('.autocomplete-wrapper')) {
        closeSuggestions();
    }
});

loadPokemonNames();
