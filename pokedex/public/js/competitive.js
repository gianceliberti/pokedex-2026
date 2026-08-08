// competitive.js — sets competitivos de Smogon (singles y doubles) por Pokémon.
// Data: los JSON del equipo pkmn (data.pkmn.cc), sin librerías ni build (solo fetch).

const SMOGON_SETS_URL = 'https://data.pkmn.cc/sets/gen9.json';
let smogonPromise = null;

// Trae y cachea todos los sets de Gen 9 una sola vez, y arma un índice por nombre normalizado
function getSmogonData() {
    if (!smogonPromise) {
        smogonPromise = fetch(SMOGON_SETS_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('smogon-failed');
                }
                return response.json();
            })
            .then(sets => {
                const index = {};
                Object.keys(sets).forEach(key => {
                    index[normalizeName(key)] = key;
                });
                return { sets, index };
            });
    }
    return smogonPromise;
}

// Normaliza un nombre para matchear PokéAPI (great-tusk) con Smogon (Great Tusk)
function normalizeName(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ¿El formato es de dobles?
function isDoublesFormat(key) {
    return key.startsWith('vgc') || key.includes('doubles');
}

// Etiqueta legible para un formato
const FORMAT_LABELS = {
    ou: 'OU', uu: 'UU', ru: 'RU', nu: 'NU', pu: 'PU', zu: 'ZU', lc: 'LC',
    ubers: 'Ubers', anythinggoes: 'Anything Goes', cap: 'CAP', '1v1': '1v1',
    monotype: 'Monotype', nationaldex: 'National Dex',
    nationaldexubers: 'National Dex Ubers', nationaldexmonotype: 'National Dex Monotype',
    doublesou: 'Doubles OU', doublesuu: 'Doubles UU', nationaldexdoubles: 'National Dex Doubles',
};

function formatLabel(key) {
    if (FORMAT_LABELS[key]) {
        return FORMAT_LABELS[key];
    }
    if (key.startsWith('vgc')) {
        return 'VGC ' + key.slice(3);
    }
    return key.toUpperCase();
}

// Prioridad de formatos singles (el más "estándar" primero)
const SINGLES_PRIORITY = ['ou', 'ubers', 'uu', 'ru', 'nu', 'pu', 'zu', 'lc', 'nationaldex', 'monotype', '1v1', 'anythinggoes', 'nationaldexmonotype', 'nationaldexubers', 'cap'];

// Elige el formato más representativo (singles o doubles) entre los que tiene el Pokémon
function pickBestFormat(formatKeys, doubles) {
    const candidates = formatKeys.filter(key => isDoublesFormat(key) === doubles);
    if (candidates.length === 0) {
        return null;
    }

    if (doubles) {
        const vgc = candidates.filter(key => key.startsWith('vgc')).sort().reverse();
        if (vgc.length) {
            return vgc[0];
        }
        const preferred = ['doublesou', 'doublesuu', 'nationaldexdoubles'].find(key => candidates.includes(key));
        return preferred || candidates[0];
    }

    candidates.sort((a, b) => {
        const ia = SINGLES_PRIORITY.indexOf(a);
        const ib = SINGLES_PRIORITY.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return candidates[0];
}

// Un valor puede ser string o array de alternativas ("A / B")
function orAlternatives(value) {
    if (Array.isArray(value)) {
        return value.join(' / ');
    }
    return value || '—';
}

const EV_LABELS = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

function renderEvs(evs) {
    if (!evs) {
        return '—';
    }
    const parts = Object.entries(evs)
        .filter(([, value]) => value)
        .map(([key, value]) => `${value} ${EV_LABELS[key] || key}`);
    return parts.length ? parts.join(' / ') : '—';
}

function renderSet(setName, set) {
    const meta = [];
    if (set.ability) meta.push(`<span><strong>Habilidad:</strong> ${orAlternatives(set.ability)}</span>`);
    if (set.item) meta.push(`<span><strong>Ítem:</strong> ${orAlternatives(set.item)}</span>`);
    if (set.nature) meta.push(`<span><strong>Naturaleza:</strong> ${orAlternatives(set.nature)}</span>`);
    if (set.teratypes) meta.push(`<span><strong>Tera:</strong> ${orAlternatives(set.teratypes)}</span>`);
    meta.push(`<span><strong>EVs:</strong> ${renderEvs(set.evs)}</span>`);

    const moves = (set.moves || []).map(move => `<div class="comp-move">${orAlternatives(move)}</div>`).join('');

    return `
        <div class="comp-set">
            <div class="comp-set-name">${setName}</div>
            <div class="comp-set-meta">${meta.join('')}</div>
            <div class="comp-moves">${moves}</div>
        </div>`;
}

function renderBlock(title, formatKey, entry) {
    if (!formatKey) {
        return `<div class="comp-block"><div class="comp-format">${title}</div><div class="comp-none">Sin sets en Gen 9.</div></div>`;
    }
    const sets = entry[formatKey];
    const setsHtml = Object.entries(sets).map(([name, set]) => renderSet(name, set)).join('');
    return `
        <div class="comp-block">
            <div class="comp-format">${title} · ${formatLabel(formatKey)}</div>
            ${setsHtml}
        </div>`;
}

function competitiveMessage(text) {
    return `<div class="competitive-title">🏆 Competitivo (Gen 9)</div><div class="comp-none">${text}</div>`;
}

// Carga y muestra los sets competitivos del Pokémon en el contenedor #competitive
async function loadCompetitiveSets(pokemonName) {
    const container = document.getElementById('competitive');
    if (!container) {
        return;
    }

    container.innerHTML = competitiveMessage('Cargando sets de Smogon…');

    try {
        const { sets, index } = await getSmogonData();
        const key = index[normalizeName(pokemonName)];
        const entry = key ? sets[key] : null;

        if (!entry) {
            container.innerHTML = competitiveMessage('Este Pokémon no tiene sets competitivos en Gen 9.');
            return;
        }

        const formatKeys = Object.keys(entry);
        const singlesFormat = pickBestFormat(formatKeys, false);
        const doublesFormat = pickBestFormat(formatKeys, true);

        container.innerHTML = `
            <div class="competitive-title">🏆 Competitivo (Gen 9)</div>
            ${renderBlock('⚔️ Singles', singlesFormat, entry)}
            ${renderBlock('👥 Doubles', doublesFormat, entry)}
            <div class="comp-credit">Sets de Smogon · data.pkmn.cc</div>
        `;
    } catch (error) {
        console.error('No se pudieron cargar los sets competitivos:', error);
        container.innerHTML = competitiveMessage('No se pudieron cargar los sets. Probá de nuevo.');
    }
}
