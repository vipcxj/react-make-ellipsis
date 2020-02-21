export function getCssValue(target: Element, hyphenProp: string): string | undefined {
    let val = typeof window.getComputedStyle !== 'undefined' && window.getComputedStyle(target, null).getPropertyValue(hyphenProp);
    if (!val && (target as any).currentStyle) {
        val = (target as any).currentStyle[hyphenProp.replace(/([a-z])\-([a-z])/, (a, b: string, c: string) => b + c.toUpperCase())]
        || (target as any).currentStyle[hyphenProp];
    }
    return val || undefined;
}

function isNan(v: number) {
    return v !== v;
}

export function getCssPixels(target: Element, hyphenProp: string): number | undefined {
    const val = getCssValue(target, hyphenProp);
    if (isNan(Number.parseFloat(val.charAt(0)))) return undefined;
    if (val.slice(-2) === 'px') return parseFloat(val.slice(0, -2));
    const temp = document.createElement('div');
    temp.style.overflow = temp.style.visibility = 'hidden';
    target.parentNode.appendChild(temp);
    temp.style.width = val;
    const pixels = temp.offsetWidth;
    target.parentNode.removeChild(temp);
    return pixels;
}