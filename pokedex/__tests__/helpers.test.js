// Tests de las funciones puras de script.js (formateo, stats, evolución)
const {
    capitalizeFirstLetter,
    formatStatName,
    calculateTotal,
    getPokemonStat,
    idFromSpeciesUrl,
    getEvolutionLevels,
} = require('../public/js/script');

describe('capitalizeFirstLetter', () => {
    test('capitaliza la primera letra de cada palabra', () => {
        expect(capitalizeFirstLetter('pikachu')).toBe('Pikachu');
        expect(capitalizeFirstLetter('mr-mime')).toBe('Mr-Mime');
    });
});

describe('formatStatName', () => {
    test('separa camelCase y capitaliza', () => {
        expect(formatStatName('ataqueEspecial')).toBe('Ataque Especial');
        expect(formatStatName('hp')).toBe('Hp');
    });
});

describe('calculateTotal', () => {
    test('suma los valores de las stats', () => {
        expect(calculateTotal({ hp: 35, ataque: 55, defensa: 40 })).toBe(130);
    });

    test('ignora valores nulos', () => {
        expect(calculateTotal({ hp: 10, ataque: null })).toBe(10);
    });
});

describe('getPokemonStat', () => {
    const pokemon = {
        stats: [
            { stat: { name: 'hp' }, base_stat: 45 },
            { stat: { name: 'attack' }, base_stat: 49 },
        ],
    };

    test('devuelve el base_stat de la stat pedida', () => {
        expect(getPokemonStat(pokemon, 'hp')).toBe(45);
        expect(getPokemonStat(pokemon, 'attack')).toBe(49);
    });

    test('devuelve null si la stat no existe', () => {
        expect(getPokemonStat(pokemon, 'defense')).toBeNull();
    });
});

describe('idFromSpeciesUrl', () => {
    test('extrae el id de una url de especie', () => {
        expect(idFromSpeciesUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(25);
    });

    test('devuelve null si la url no matchea', () => {
        expect(idFromSpeciesUrl('https://example.com/otra-cosa')).toBeNull();
    });
});

describe('getEvolutionLevels', () => {
    test('agrupa una cadena lineal por niveles', () => {
        const chain = {
            species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
            evolves_to: [{
                species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
                evolves_to: [{
                    species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
                    evolves_to: [],
                }],
            }],
        };

        expect(getEvolutionLevels(chain)).toEqual([
            [{ name: 'bulbasaur', id: 1 }],
            [{ name: 'ivysaur', id: 2 }],
            [{ name: 'venusaur', id: 3 }],
        ]);
    });

    test('agrupa evoluciones ramificadas en un mismo nivel', () => {
        const chain = {
            species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
            evolves_to: [
                { species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' }, evolves_to: [] },
                { species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' }, evolves_to: [] },
            ],
        };

        expect(getEvolutionLevels(chain)).toEqual([
            [{ name: 'eevee', id: 133 }],
            [{ name: 'vaporeon', id: 134 }, { name: 'jolteon', id: 135 }],
        ]);
    });
});
