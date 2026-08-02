// eventListeners.js
// Event listener para el botón de búsqueda por nombre
document.getElementById('searchByName').addEventListener('click', async () => {
    const inputElement = document.getElementById('pokemonName');
    const pokemonName = inputElement.value.trim();

    if (pokemonName) {
        // Llamar a la función para obtener información por nombre
        await getPokemonByName(pokemonName);
    }
});

// Event listener para la tecla "Enter" en el campo de entrada
document.getElementById('pokemonName').addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        const inputElement = document.getElementById('pokemonName');
        const pokemonName = inputElement.value.trim();

        if (pokemonName) {
            // Llamar a la función para obtener información por nombre
            await getPokemonByName(pokemonName);
        }
    }
});

// Carga la lista completa de nombres (una sola vez) para el autocompletado del <datalist>
async function loadPokemonNames() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const datalist = document.getElementById('pokemonList');
        if (!datalist) {
            return;
        }

        const fragment = document.createDocumentFragment();
        data.results.forEach(pokemon => {
            const option = document.createElement('option');
            option.value = pokemon.name;
            fragment.appendChild(option);
        });
        datalist.appendChild(fragment);
    } catch (error) {
        console.error('No se pudo cargar la lista de nombres para autocompletar:', error);
    }
}

loadPokemonNames();
