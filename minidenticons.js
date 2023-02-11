// density of 4 for the lowest probability of collision
const SQUARE_DENSITY = 4
const GRID_SIZE = 5
// 18 different colors only for easy distinction
const COLORS_NB = 18
const DEFAULT_SATURATION = 50
const DEFAULT_LIGHTNESS = 50
const BG_LIGHTNESS_MIN = 80
const BG_LIGHTNESS_MAX = 90
const BG_LIGHTNESS_RANGE_SIZE = BG_LIGHTNESS_MAX - BG_LIGHTNESS_MIN
const BG_SATURATION_MIN = 25
const BG_SATURATION_MAX = 40
const BG_SATURATION_RANGE_SIZE = BG_SATURATION_MAX - BG_SATURATION_MIN

// 32 bit FNV-1a hash parameters
const FNV_PRIME = 16777619
const OFFSET_BASIS = 2166136261

/**
 * @type {(str: string) => number}
 */
// based on the FNV-1a hash algorithm, modified for *signed* 32 bit integers http://www.isthe.com/chongo/tech/comp/fnv/index.html
function simpleHash(str) {
    return str.split('')
        // >>> 0 for 32 bit unsigned integer conversion https://2ality.com/2012/02/js-integers.html
        .reduce((hash, char) => ((hash ^ char.charCodeAt(0)) >>> 0) * FNV_PRIME, OFFSET_BASIS)
}

/**
 * @type {import('.').identicon}
 */
export function identicon(username, saturation=DEFAULT_SATURATION, lightness=DEFAULT_LIGHTNESS) {
    const hash = simpleHash(username)
    // dividing hash by FNV_PRIME to get last XOR result for better color randomness (will be an integer except for empty string hash)
    const colorMap = colors(username, saturation, lightness)
    const rects = [...Array(username ? GRID_SIZE * GRID_SIZE : 0)].reduce((acc, e, i) => {
        const effectiveX = ~~(i / GRID_SIZE) >= GRID_SIZE / 2 ? ~~(3 * GRID_SIZE / 2) - ~~(i / GRID_SIZE) : ~~(i / GRID_SIZE)
        const halfGrid = (~~(GRID_SIZE / 2) + 1)

        if (hash % ((2 + (halfGrid * GRID_SIZE - 1)) - i % (halfGrid * GRID_SIZE)) < SQUARE_DENSITY) {
            return acc.concat({
                x: effectiveX * 0.866,
                y: i % GRID_SIZE - effectiveX * 0.5,
                xCoord: effectiveX,
                yCoord: i % GRID_SIZE,
                animationOffset: (hash - 7 * i + 13) % 5 - 3
            })
        } else {
            return acc
        }
    }, []).sort((a, b) => {
        return b.x - a.x + b.y - a.y
    }).map(rect => {
        return `<use class="cube" href="#identicon-svg-cube-${hash}" y="${rect.y}" x="${rect.x}" ` +
            `data-x="${rect.xCoord}" data-y="${rect.yCoord}" data-animation-offset="${rect.animationOffset}"/>`
    })

    return `<svg class="minidenticon-3d-svg" viewBox="-3 -3 ${GRID_SIZE + 6} ${GRID_SIZE + 6}" xmlns="http://www.w3.org/2000/svg">` +
        `<defs>` + 
            `<g stroke-width="0.05" id="identicon-svg-cube-${hash}">` + 
                `<path d="M 0 0 L -0.866 -0.5 L -0.866 0.5 L 0 1 L 0 0" class="side-face" fill="${colorMap.darkColor}" stroke="${colorMap.darkColor}"/>` +
                `<path d="M 0 0 L -0.866 -0.5 L 0 -1 L 0.866 -0.5 L 0 0" class="top-face" fill="${colorMap.lightColor}" stroke="${colorMap.lightColor}"/>` +
                `<path d="M 0 0 L 0.866 -0.5 L 0.866 0.5 L 0 1 L 0 0" class="front-face" fill="${colorMap.color}" stroke="${colorMap.color}"/>` +
            `</g>` +
        `</defs>` +
        `<g transform="translate(0.75 1.5)">` +
            rects + 
        `</g>` +
    `</svg>`
}

/**
 * @type {import('.').colors}
 */
export function colors(username, saturation=DEFAULT_SATURATION, lightness=DEFAULT_LIGHTNESS) {
    const hash = simpleHash(username)
    // dividing hash by FNV_PRIME to get last XOR result for better color randomness (will be an integer except for empty string hash)
    const hue = ((hash / FNV_PRIME) % COLORS_NB) * (360 / COLORS_NB)
    const color = `hsl(${hue} ${saturation}% ${lightness}%)`
    const lightColor = `hsl(${hue} ${saturation}% ${parseFloat(lightness) + 15}%)`
    const darkColor = `hsl(${hue} ${~~(parseFloat(saturation) / 2)}% ${parseFloat(lightness) - 15 }%)`

    const backgroundLightness = ((hash / FNV_PRIME) % BG_LIGHTNESS_RANGE_SIZE) + BG_LIGHTNESS_MIN
    const backgroundSaturation = ((hash / FNV_PRIME) % BG_SATURATION_RANGE_SIZE) + BG_SATURATION_MIN
    const backgroundColor = `hsl(${hue} ${backgroundSaturation}% ${backgroundLightness}%)`

    return {
        color, lightColor, darkColor, backgroundColor
    }
}

/**
 * @type {void}
 */
export const identiconSvg =
    /*@__PURE__*/globalThis.customElements?.define('identicon-svg',
        class extends HTMLElement {
            connectedCallback() { this.identiconSvg() }
            attributeChangedCallback() { this.identiconSvg() }
            static get observedAttributes() { return ['username', 'saturation', 'lightness'] }
            identiconSvg() {
                this.innerHTML = identicon(
                    this.getAttribute('username') || "",
                    this.getAttribute('saturation') || DEFAULT_SATURATION,
                    this.getAttribute('lightness') || DEFAULT_LIGHTNESS
                )
            }
        }
    )
