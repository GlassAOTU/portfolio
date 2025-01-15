const colorMap = {
    black: ['#000000', '#161616'],
    blue: ['#1e349f', '#2c53e8'],
    brown: ['#1f0d00', '#5b3c2f'],
    gray: ['#6a6a6a', '#8c8c8c'],
    green: ['#003900', '#117806'],
    orange: ['#542c00', '#8e5a0c'],
    red: ['#690000', '#d4312b'],
    teal: ['#00574e', '#1a8986'],
    violet: ['#440052', '#8f2690'],
    yellow: ['#6d6a15', '#94931f']
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

document.querySelectorAll('input[name="gradient"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const color = e.target.value;
        targetGradient = colorMap[color];

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        startTime = null;
        animationFrame = requestAnimationFrame(animate);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the saved gradient from local storage
    const savedGradient = localStorage.getItem('selectedGradient');
    if (savedGradient) {
        targetGradient = colorMap[savedGradient];
        currentGradient = colorMap[savedGradient];
        document.body.style.background = `linear-gradient(180deg, ${currentGradient[0]}, ${currentGradient[1]})`;
        document.getElementById(savedGradient).checked = true;
    }

    // Listen for changes and save the selected gradient
    document.querySelectorAll('input[name="gradient"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const color = e.target.value;
            localStorage.setItem('selectedGradient', color);
        });
    });
});