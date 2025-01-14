import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import "./style.css";

// create a scene
const scene = new THREE.Scene();

// shader stuff
// -------------------------------------------------------------------sin wave format === sin(position * wavelength + time * speed) * amplitude
// ---------------------------------- VERTEX SHADER
const vertexShader = `
varying vec3 vPosition;
uniform float uTime;

void main() {
    vPosition = position; // Pass the vertex position to the fragment shader

    vec3 newPosition = position;

    // Long horizontal sine wave along the x-axis affecting height (y-axis)
    newPosition.y += sin(newPosition.x * 0.1 - uTime * 0.25) * 2.0;

    // Additional sine wave along x-axis for randomness
    // newPosition.y += sin(newPosition.x * 15.0 + uTime * 0.8) * 0.5; // Adjust frequency, speed, and amplitude

    // Smaller random sine waves along the z-axis affecting height (y-axis)
    newPosition.y += sin(newPosition.z * 1.0 + uTime * 0.5) * 0.9; // First wave
    newPosition.y += sin(newPosition.z * 1.0 - uTime * 0.1) * 0.4; // Second wave
    newPosition.y += sin(newPosition.z * 1.0 + uTime * 0.7) * 0.2; // Third wave

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

`;
const fragmentShader = `
varying vec3 vPosition;
uniform float uTime;

void main() {
    // Combine multiple vertical sine waves for "random-looking" effects
    float waveY1 = sin(vPosition.y * 10.0 + uTime * 0.5) * 0.05; // First vertical wave
    float waveY2 = sin(vPosition.y * 20.0 - uTime * 0.3) * 0.03; // Second vertical wave
    float waveY3 = sin(vPosition.y * 5.0 + uTime * 0.7) * 0.02;  // Third vertical wave

    // Combine the vertical waves
    float combinedVerticalWave = waveY1 + waveY2 + waveY3;

    // Set the base color to white
    vec3 baseColor = vec3(1.0, 1.0, 1.0); // Pure white color

    // Add silky transparency based on wave height
    float alpha = 0.01 + sin(vPosition.y * 5.0 + uTime * 0.3) * 0.4; // More transparency

    // Clamp alpha to ensure it stays within [0.0, 1.0]
    alpha = clamp(alpha, 0.03, 0.5); // Adjust these values for stronger or weaker transparency

    // Output the final color with transparency
    gl_FragColor = vec4(baseColor, alpha);
}
`;
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 },
    },
    transparent: true, // Enable transparency
    side: THREE.DoubleSide, // Render both sides
});


// create a plane
const geometry = new THREE.PlaneGeometry(200, 10, 500, 100);
const mesh = new THREE.Mesh(geometry, material);
geometry.rotateX(30);
scene.add(mesh);

// sizing
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// light
const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(0, 10, 10);
scene.add(light);

// camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 30;
scene.add(camera);

// renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// controls
const controls = new OrbitControls(camera, canvas);

// resize
window.addEventListener('resize', () => {
    // update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // update camera
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height);
});

const loop = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
};
loop();

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Update the time uniform
    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;

    // Render the scene
    renderer.render(scene, camera);
}

animate();
