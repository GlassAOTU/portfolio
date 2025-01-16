const colorMap = {
    black: ['#000000', '#161616'],
    blue: ['#1e349f', '#4A5CB2'],
    brown: ['#1f0d00', '#5b3c2f'],
    gray: ['#5F5F5F', '#979797'],
    green: ['#003900', '#28851E'],
    orange: ['#542C00', '#8e5a0c'],
    red: ['#500000', '#d4312b'],
    teal: ['#00574e', '#48C8B9'],
    violet: ['#440052', '#8f2690'],
    yellow: ['#69660B', '#94931f']
};

let startTime = null;
let currentGradient = colorMap.black;
let targetGradient = colorMap.black;
let animationFrame = null;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lerp(start, end, t) {
    const startRgb = hexToRgb(start);
    const endRgb = hexToRgb(end);

    const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t);
    const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t);
    const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t);

    return rgbToHex(r, g, b);
}

function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / 500, 1); // 500ms duration

    const color1 = lerp(currentGradient[0], targetGradient[0], progress);
    const color2 = lerp(currentGradient[1], targetGradient[1], progress);

    document.body.style.background = `linear-gradient(180deg, ${color1}, ${color2})`;

    if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
    } else {
        currentGradient = targetGradient;
        startTime = null;
        animationFrame = null;
    }
}

// store the dropdown element by its id
const themeDropdown = document.getElementById('themes');

// add change event listener to the dropdown that changes the target gradient
themeDropdown.addEventListener('change', (e) => {
    const color = e.target.value;
    targetGradient = colorMap[color];

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    startTime = null;
    animationFrame = requestAnimationFrame(animate);

    // save last saved gradient to localStorage
    localStorage.setItem('selectedGradient', color);
});

// add event listener for when the dom is loaded
document.addEventListener('DOMContentLoaded', () => {
    // retrieve the saved gradient from local storage
    const savedGradient = localStorage.getItem('selectedGradient');
    if (savedGradient) {
        targetGradient = colorMap[savedGradient];
        currentGradient = colorMap[savedGradient];
        document.body.style.background = `linear-gradient(180deg, ${currentGradient[0]}, ${currentGradient[1]})`;

        // set the dropdown to the saved value
        themeDropdown.value = savedGradient;
    }
});