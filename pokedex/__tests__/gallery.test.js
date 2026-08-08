// Tests de las funciones puras de gallery.js (parseo de id y paginador)
const { idFromPokemonUrl, buildPageList } = require('../public/js/gallery');

describe('idFromPokemonUrl', () => {
    test('extrae el id de una url de pokemon', () => {
        expect(idFromPokemonUrl('https://pokeapi.co/api/v2/pokemon/6/')).toBe(6);
    });

    test('devuelve null si la url no matchea', () => {
        expect(idFromPokemonUrl('https://example.com/x')).toBeNull();
    });
});

describe('buildPageList', () => {
    test('muestra todas las páginas si son 7 o menos', () => {
        expect(buildPageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    test('primera página: vecinas + última con elipsis', () => {
        expect(buildPageList(1, 57)).toEqual([1, 2, 3, '…', 57]);
    });

    test('página del medio: primera y última + vecinas, con elipsis a ambos lados', () => {
        expect(buildPageList(17, 57)).toEqual([1, '…', 15, 16, 17, 18, 19, '…', 57]);
    });

    test('última página', () => {
        expect(buildPageList(57, 57)).toEqual([1, '…', 55, 56, 57]);
    });
});
