// SVG arrows stay monochrome and consistent across desktop and mobile fonts.
const arrowPaths = {
 'up-right': 'M5 19 19 5M5 5h14v14',
 up: 'M12 19V5m-6 6 6-6 6 6',
 down: 'M12 5v14m-6-6 6 6 6-6',
 left: 'M19 12H5m6-6-6 6 6 6',
 right: 'M5 12h14m-6-6 6 6-6 6',
};
export function arrowIcon(direction = 'up-right') {
 return `<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${arrowPaths[direction]}"/></svg>`;
}
