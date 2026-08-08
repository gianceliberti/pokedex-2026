// eventListeners.js

const searchInput = document.getElementById('pokemonName');
const autocompleteList = document.getElementById('autocompleteList');

// Lista completa de nombres para el autocompletado (se carga una sola vez)
let pokemonNames = [];

// Cuántas sugerencias mostrar como máximo (para no tapar toda la pantalla)
const MAX_SUGGESTIONS = 8;

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

// Autocompletado reutilizable: se engancha a un input + su desplegable.
// onSelect(name) se llama al elegir una sugerencia o confirmar con Enter.
function setupAutocomplete(input, listElement, onSelect) {
    let activeIndex = -1;

    function render(query) {
        const q = query.trim().toLowerCase();
        activeIndex = -1;

        if (!q) {
            close();
            return;
        }

        // Primero los que empiezan con la búsqueda; después los que la contienen
        const startsWith = pokemonNames.filter(name => name.startsWith(q));
        const contains = pokemonNames.filter(name => name.includes(q) && !name.startsWith(q));
        const matches = startsWith.concat(contains).slice(0, MAX_SUGGESTIONS);

        if (matches.length === 0) {
            close();
            return;
        }

        listElement.innerHTML = matches
            .map(name => `<div class="autocomplete-item" role="option" data-name="${name}">${name}</div>`)
            .join('');
        listElement.classList.add('open');
    }

    function close() {
        listElement.innerHTML = '';
        listElement.classList.remove('open');
        activeIndex = -1;
    }

    function choose(name) {
        input.value = name;
        close();
        onSelect(name);
    }

    function updateActiveItem(items) {
        items.forEach((item, index) => item.classList.toggle('active', index === activeIndex));
        if (items[activeIndex]) {
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    input.addEventListener('input', () => render(input.value));

    // Teclado: flechas para navegar, Enter para elegir/confirmar, Escape para cerrar
    input.addEventListener('keydown', (event) => {
        const items = Array.from(listElement.querySelectorAll('.autocomplete-item'));

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
                choose(items[activeIndex].dataset.name);
            } else {
                close();
                const value = input.value.trim();
                if (value) {
                    onSelect(value);
                }
            }
        } else if (event.key === 'Escape') {
            close();
        }
    });

    // Click en una sugerencia (mousedown para adelantarse al blur del input)
    listElement.addEventListener('mousedown', (event) => {
        const item = event.target.closest('.autocomplete-item');
        if (!item) {
            return;
        }
        event.preventDefault();
        choose(item.dataset.name);
    });

    return { close };
}

// Cierra cualquier desplegable abierto al hacer click fuera de su wrapper
document.addEventListener('click', (event) => {
    document.querySelectorAll('.autocomplete-list.open').forEach(listElement => {
        const wrapper = listElement.closest('.autocomplete-wrapper');
        if (wrapper && !wrapper.contains(event.target)) {
            listElement.innerHTML = '';
            listElement.classList.remove('open');
        }
    });
});

// Busca por nombre (la usan el botón y el autocompletado del buscador principal)
function searchPokemon(name) {
    const value = (name || '').trim();
    if (!value) {
        return;
    }
    if (typeof closeGallery === 'function') {
        closeGallery();
    }
    getPokemonByName(value);
}

// Autocompletado del buscador principal
setupAutocomplete(searchInput, autocompleteList, searchPokemon);

// Botón de búsqueda
document.getElementById('searchByName').addEventListener('click', () => {
    searchPokemon(searchInput.value);
});

loadPokemonNames();
