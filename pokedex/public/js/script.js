// Guarda el número del Pokémon mostrado, para la navegación anterior/siguiente
let currentPokemonId = null;

// Guarda el Pokémon mostrado (nombre + stats), para la comparación
let currentPokemonData = null;

// Extrae las estadísticas base de una respuesta de PokéAPI
function extractBaseStats(pokemon) {
    return {
        hp: getPokemonStat(pokemon, 'hp'),
        ataque: getPokemonStat(pokemon, 'attack'),
        defensa: getPokemonStat(pokemon, 'defense'),
        ataqueEspecial: getPokemonStat(pokemon, 'special-attack'),
        defensaEspecial: getPokemonStat(pokemon, 'special-defense'),
        velocidad: getPokemonStat(pokemon, 'speed'),
    };
}

// Función para mostrar la información del Pokémon en el HTML
function displayPokemonInfo(pokemon, imageUrl, baseStats) {
    clearErrorMessage();

    const pokemonInfo = document.getElementById('pokemonInfo');

    // URLs para el toggle shiny y para el sonido (cry) del Pokémon
    const shinyImageUrl = pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny || null;
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy || null;

    // Muestra la imagen principal del Pokémon si está disponible
    const mainImage = imageUrl ? `<img src="${imageUrl}" alt="${pokemon.name}" class="main-image" id="mainSprite" />` : '';

    // Controles de la imagen: reproducir el sonido y ver la versión shiny
    const spriteControls = `
        <div class="sprite-controls">
            <button id="cryButton" type="button" class="sprite-btn"${cryUrl ? '' : ' disabled'}>🔊 Sonido</button>
            <label class="shiny-label"><input type="checkbox" id="shinyToggle"${shinyImageUrl ? '' : ' disabled'} /> ✨ Shiny</label>
        </div>
    `;

    // Aplica colores a cada tipo
    const typeColors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };

    // Acento del panel según el tipo primario del Pokémon (Charizard→naranja, Gengar→morado…)
    const primaryType = pokemon.types[0]?.type?.name?.toLowerCase();
    const accentColor = typeColors[primaryType] || '#007bff';
    const containerElement = document.querySelector('.container');
    if (containerElement) {
        containerElement.style.setProperty('--type-color', accentColor);
    }

    // Muestra los tipos del Pokémon con colores
    const typesList = pokemon.types.map(type => `<span style="background-color: ${typeColors[type.type.name.toLowerCase()] || '#777'}; color: white; padding: 5px; border-radius: 5px; margin: 0 5px;">${capitalizeFirstLetter(type.type.name)}</span>`).join('');

    // Muestra las habilidades del Pokémon (marca las ocultas)
    const abilitiesList = pokemon.abilities
        .map(a => {
            const name = capitalizeFirstLetter(a.ability.name.replace(/-/g, ' '));
            return a.is_hidden ? `${name} (oculta)` : name;
        })
        .join(', ');

    // La API entrega altura en decímetros y peso en hectogramos
    const heightM = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);

    // Número de Pokédex con formato #025
    const dexNumber = `#${String(pokemon.id).padStart(3, '0')}`;

    // Muestra las estadísticas base del Pokémon
    const statsList = Object.entries(baseStats).map(([statName, statValue]) => `<li>${formatStatName(statName)}: ${statValue}</li>`).join('');

    // Construye la estructura HTML
    const pokemonDetailsHTML = `
        <p id="pokemonName">Name: ${capitalizeFirstLetter(pokemon.name)} <span class="dex-number">${dexNumber}</span></p>
        <p id="pokemonTypes">Types: ${typesList}</p>
        ${mainImage}
        ${spriteControls}
        <div class="pokemon-meta">
            <span>Height: ${heightM} m</span>
            <span>Weight: ${weightKg} kg</span>
            <span>Abilities: ${abilitiesList}</span>
        </div>
        <p id="totalStats">Base Stats:</p>
        <ul>
            ${statsList}
            <li>Total: ${calculateTotal(baseStats)}</li>
        </ul>
        <div class="compare-box">
            <label for="compareInput">⚔️ Comparar stats con:</label>
            <div class="compare-controls">
                <div class="autocomplete-wrapper compare-ac">
                    <input type="text" id="compareInput" placeholder="Ej: arcanine" autocomplete="off" />
                    <div id="compareAcList" class="autocomplete-list"></div>
                </div>
                <button id="compareBtn" type="button">Comparar</button>
            </div>
            <div id="comparison"></div>
        </div>
        <div id="evolutionChain" class="evolution-chain">
            <p class="evolution-title">Evolución</p>
            <p class="evolution-none">Cargando…</p>
        </div>
        <div class="pokemon-nav">
            <button id="prevPokemon" ${pokemon.id <= 1 ? 'disabled' : ''}>◀ Anterior</button>
            <button id="nextPokemon">Siguiente ▶</button>
        </div>
    `;

    // Aplica la estructura HTML al contenedor
    pokemonInfo.innerHTML = pokemonDetailsHTML;

    // Re-dispara la animación de entrada en cada render
    pokemonInfo.classList.remove('fade-in');
    void pokemonInfo.offsetWidth; // fuerza un reflow para reiniciar la animación
    pokemonInfo.classList.add('fade-in');

    // Mantiene el buscador en sync con lo que se muestra (nombre canónico)
    const inputElement = document.getElementById('pokemonName');
    if (inputElement) {
        inputElement.value = pokemon.name;
    }

    // Botón de sonido: reproduce el "cry" del Pokémon
    const cryButton = document.getElementById('cryButton');
    if (cryButton && cryUrl) {
        cryButton.addEventListener('click', () => {
            const audio = new Audio(cryUrl);
            audio.volume = 0.5;
            audio.play().catch(error => console.error('No se pudo reproducir el sonido:', error));
        });
    }

    // Toggle shiny: intercambia entre la imagen normal y la variocolor
    const shinyToggle = document.getElementById('shinyToggle');
    const spriteImg = document.getElementById('mainSprite');
    if (shinyToggle && spriteImg) {
        shinyToggle.addEventListener('change', () => {
            spriteImg.src = shinyToggle.checked ? (shinyImageUrl || imageUrl) : imageUrl;
        });
    }

    // Conecta los botones de navegación anterior/siguiente por número
    const prevButton = document.getElementById('prevPokemon');
    const nextButton = document.getElementById('nextPokemon');
    if (prevButton) {
        prevButton.addEventListener('click', () => loadPokemon(pokemon.id - 1));
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => loadPokemon(pokemon.id + 1));
    }

    // Comparación de stats con otro Pokémon (mismo autocompletado que el buscador principal)
    const compareButton = document.getElementById('compareBtn');
    const compareInput = document.getElementById('compareInput');
    const compareAcList = document.getElementById('compareAcList');
    if (compareInput && compareAcList && typeof setupAutocomplete === 'function') {
        setupAutocomplete(compareInput, compareAcList, name => compareWith(name));
    }
    if (compareButton && compareInput) {
        compareButton.addEventListener('click', () => {
            const name = compareInput.value.trim();
            if (name) {
                compareWith(name);
            }
        });
    }
}

// Trae otro Pokémon y compara sus stats con el que se está mostrando
async function compareWith(name) {
    const comparisonElement = document.getElementById('comparison');
    if (!comparisonElement || !currentPokemonData) {
        return;
    }

    comparisonElement.innerHTML = '<p class="cmp-loading">Comparando…</p>';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('not-found');
        }
        const other = await response.json();
        const otherData = { name: other.name, baseStats: extractBaseStats(other) };
        renderComparison(currentPokemonData, otherData);
    } catch (error) {
        comparisonElement.innerHTML = `<p class="cmp-error">No se encontró "${name}". Revisá el nombre.</p>`;
    }
}

// Dibuja la comparación stat por stat (con barras y resaltando al ganador)
function renderComparison(a, b) {
    const comparisonElement = document.getElementById('comparison');
    const statKeys = ['hp', 'ataque', 'defensa', 'ataqueEspecial', 'defensaEspecial', 'velocidad'];
    const MAX_STAT = 200; // referencia para el largo de las barras

    let aWins = 0;
    let bWins = 0;

    const rows = statKeys
        .map(key => {
            const av = a.baseStats[key] || 0;
            const bv = b.baseStats[key] || 0;
            const aClass = av > bv ? ' win' : '';
            const bClass = bv > av ? ' win' : '';
            if (av > bv) aWins++;
            else if (bv > av) bWins++;

            const aPct = Math.min(100, (av / MAX_STAT) * 100);
            const bPct = Math.min(100, (bv / MAX_STAT) * 100);

            return `
                <div class="cmp-row">
                    <span class="cmp-val cmp-a${aClass}">${av}</span>
                    <div class="cmp-mid">
                        <div class="cmp-stat">${formatStatName(key)}</div>
                        <div class="cmp-bar-track cmp-track-a"><div class="cmp-bar cmp-bar-a${aClass}" style="width:${aPct}%"></div></div>
                        <div class="cmp-bar-track cmp-track-b"><div class="cmp-bar cmp-bar-b${bClass}" style="width:${bPct}%"></div></div>
                    </div>
                    <span class="cmp-val cmp-b${bClass}">${bv}</span>
                </div>`;
        })
        .join('');

    const aTotal = calculateTotal(a.baseStats);
    const bTotal = calculateTotal(b.baseStats);
    const nameA = capitalizeFirstLetter(a.name);
    const nameB = capitalizeFirstLetter(b.name);
    const totalWinner = aTotal === bTotal ? 'Empate' : (aTotal > bTotal ? nameA : nameB);

    comparisonElement.innerHTML = `
        <div class="cmp-header">
            <span class="cmp-name cmp-a">${nameA}</span>
            <span class="cmp-vs">vs</span>
            <span class="cmp-name cmp-b">${nameB}</span>
        </div>
        ${rows}
        <div class="cmp-row cmp-total">
            <span class="cmp-val cmp-a${aTotal > bTotal ? ' win' : ''}">${aTotal}</span>
            <div class="cmp-mid"><div class="cmp-stat">Total</div></div>
            <span class="cmp-val cmp-b${bTotal > aTotal ? ' win' : ''}">${bTotal}</span>
        </div>
        <p class="cmp-summary">${nameA} gana ${aWins} · ${nameB} gana ${bWins} · Total: <strong>${totalWinner}</strong></p>
    `;
}

// Función para capitalizar la primera letra de cada palabra
function capitalizeFirstLetter(str) {
    return String(str).replace(/\b\w/g, match => match.toUpperCase());
}

function formatStatName(statName) {
    // Separa las palabras y las capitaliza
    const words = statName.split(/(?=[A-Z])/);
    const formattedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return formattedName;
}

// Función para calcular el total de los puntos base
function calculateTotal(baseStats) {
    // Sumar todos los puntos base
    return Object.values(baseStats).reduce((total, stat) => total + (stat || 0), 0);
}

// Función para limpiar el contenido HTML actual
function clearPokemonInfo() {
    const pokemonInfo = document.getElementById('pokemonInfo');
    pokemonInfo.innerHTML = '';
}

// Función para mostrar un estado de carga mientras se busca
function displayLoading(label) {
    clearErrorMessage();
    const pokemonInfo = document.getElementById('pokemonInfo');
    pokemonInfo.innerHTML = `<div class="loading">Buscando a ${capitalizeFirstLetter(label)}…</div>`;
}

// Función para mostrar mensajes de error en el HTML
function displayErrorMessage(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
}

// Función para limpiar mensajes de error en el HTML
function clearErrorMessage() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = '';
}

// Función auxiliar para extraer estadísticas del objeto de Pokémon
function getPokemonStat(pokemonData, statName) {
    const stat = pokemonData.stats.find(stat => stat.stat.name === statName);
    return stat ? stat.base_stat : null;
}

// Extrae el número (id) desde una URL de especie de la API
function idFromSpeciesUrl(url) {
    const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
}

// Recorre la cadena de evolución y la agrupa por niveles.
// Ej. lineal: [[bulbasaur], [ivysaur], [venusaur]]
// Ej. ramificada (eevee): [[eevee], [vaporeon, jolteon, flareon, ...]]
function getEvolutionLevels(chain) {
    const levels = [];
    let current = [chain];

    while (current.length > 0) {
        const level = current.map(node => ({
            name: node.species.name,
            id: idFromSpeciesUrl(node.species.url),
        }));
        levels.push(level);

        const next = [];
        current.forEach(node => (node.evolves_to || []).forEach(child => next.push(child)));
        current = next;
    }

    return levels;
}

// Dibuja la cadena de evolución (con mini-sprites clicables) dentro del contenedor
function renderEvolutionChain(container, levels, currentId) {
    if (levels.length <= 1) {
        container.innerHTML = '<p class="evolution-title">Evolución</p><p class="evolution-none">Este Pokémon no evoluciona.</p>';
        return;
    }

    const levelsHTML = levels
        .map(level => {
            const items = level
                .map(p => {
                    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                    const currentClass = p.id === currentId ? ' current' : '';
                    return `
                        <button class="evo-item${currentClass}" data-id="${p.id}" title="Ver ${capitalizeFirstLetter(p.name)}">
                            <img src="${spriteUrl}" alt="${p.name}" />
                            <span>${capitalizeFirstLetter(p.name)}</span>
                        </button>`;
                })
                .join('');
            return `<div class="evo-level">${items}</div>`;
        })
        .join('<span class="evo-arrow">→</span>');

    container.innerHTML = `<p class="evolution-title">Evolución</p><div class="evo-row">${levelsHTML}</div>`;

    // Al hacer click en una evolución, se navega a ese Pokémon
    container.querySelectorAll('.evo-item').forEach(button => {
        button.addEventListener('click', () => loadPokemon(parseInt(button.dataset.id, 10)));
    });
}

// Obtiene y muestra la cadena de evolución (2 llamadas extra: species + evolution-chain).
// Se ejecuta aparte para no bloquear el render de la ficha principal.
async function loadEvolutionChain(pokemon) {
    const container = document.getElementById('evolutionChain');
    if (!container) {
        return;
    }

    try {
        const speciesResponse = await fetch(pokemon.species.url);
        if (!speciesResponse.ok) {
            throw new Error('species-failed');
        }
        const species = await speciesResponse.json();

        const evolutionResponse = await fetch(species.evolution_chain.url);
        if (!evolutionResponse.ok) {
            throw new Error('evolution-failed');
        }
        const evolutionData = await evolutionResponse.json();

        // Evita pisar la ficha si el usuario ya navegó a otro Pokémon
        if (currentPokemonId !== pokemon.id) {
            return;
        }

        const levels = getEvolutionLevels(evolutionData.chain);
        renderEvolutionChain(container, levels, pokemon.id);
    } catch (error) {
        console.error('No se pudo cargar la cadena de evolución:', error);
        if (currentPokemonId === pokemon.id) {
            container.innerHTML = '<p class="evolution-title">Evolución</p><p class="evolution-none">No se pudo cargar la evolución.</p>';
        }
    }
}

// Obtiene y muestra un Pokémon a partir de su nombre o su número
async function loadPokemon(identifier) {
    displayLoading(String(identifier));

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(identifier).toLowerCase()}`);

        if (response.status === 404) {
            throw new Error('not-found');
        }
        if (!response.ok) {
            throw new Error('request-failed');
        }

        const pokemon = await response.json();
        currentPokemonId = pokemon.id;

        // Preferimos el artwork oficial (más grande); si no, caemos al sprite clásico
        const imageUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;

        // Estadísticas base a partir de la misma respuesta (sin una segunda llamada a la API)
        const baseStats = extractBaseStats(pokemon);

        // Guarda el Pokémon actual para poder compararlo con otro
        currentPokemonData = { name: pokemon.name, baseStats };

        displayPokemonInfo(pokemon, imageUrl, baseStats);

        // La evolución se carga aparte y se completa cuando llega (no bloquea la ficha)
        loadEvolutionChain(pokemon);
    } catch (error) {
        clearPokemonInfo();
        if (error.message === 'not-found') {
            displayErrorMessage(`El Pokémon "${identifier}" no existe. Revisá que esté bien escrito.`);
        } else {
            displayErrorMessage('Ocurrió un error al buscar. Revisá tu conexión e intentá de nuevo.');
            console.error('Error al obtener información del Pokémon:', error);
        }
    }
}

// Se mantiene por compatibilidad con eventListeners.js (búsqueda por nombre)
async function getPokemonByName(name) {
    await loadPokemon(name);
}

// Exponer funciones puras para tests con Jest. En el navegador `module` no
// existe, así que este bloque se ignora sin afectar nada.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        capitalizeFirstLetter,
        formatStatName,
        calculateTotal,
        getPokemonStat,
        idFromSpeciesUrl,
        getEvolutionLevels,
    };
}
