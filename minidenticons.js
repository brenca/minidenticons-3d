// density of 4 for the lowest probability of collision
const SQUARE_DENSITY = 4
// 18 different colors only for easy distinction
const COLORS_NB = 18

// 32 bit FNV-1a hash parameters
const FNV_PRIME = 16777619
const OFFSET_BASIS = 2166136261

/**
 * @type {(str: string) => number}
 */
// FNV1a-like hash function http://www.isthe.com/chongo/tech/comp/fnv/index.html
function pseudoFNV1a(str) {
    return str.split('')
        // >>> 0 for 32 bit unsigned integer conversion https://2ality.com/2012/02/js-integers.html
        .reduce((hash, char) => ((hash ^ char.charCodeAt(0)) >>> 0) * FNV_PRIME, OFFSET_BASIS)
}

/**
 * @type {import('.').identicon}
 */
export function identicon(username, saturation=50, lightness=50) {
    const hash = pseudoFNV1a(username)
    // dividing hash by FNV_PRIME to get last XOR result for better color randomness (will be an integer except for empty string hash)
    const hue = hash / FNV_PRIME % COLORS_NB * 360 / COLORS_NB
    const rects = [...Array(username ? 25 : 0).keys()]
        // 2 + ((3 * 5 - 1) - modulo) to concentrate squares at the center
        .map(i => hash % (16 - i % 15) < SQUARE_DENSITY ?
            `<rect x="${i > 14 ? 7 - ~~(i/5) : ~~(i/5)}" y="${i % 5}" width="1" height="1"/>` : '')
        .join('')
    return `<svg viewBox="-1.5 -1.5 8 8" xmlns="http://www.w3.org/2000/svg" fill="hsl(${hue} ${saturation}% ${lightness}%)">${rects}</svg>`
}

export const identiconSvg =
    globalThis.customElements?.define('identicon-svg',
        class extends HTMLElement {
            constructor() { super() }
            connectedCallback() { this.identiconSvg() }
            attributeChangedCallback() { this.identiconSvg() }
            static get observedAttributes() { return ['username', 'saturation', 'lightness'] }
            identiconSvg() {
                this.innerHTML = identicon(
                    this.getAttribute('username'),
                    this.getAttribute('saturation'),
                    this.getAttribute('lightness')
                )
            }
        }
    )
