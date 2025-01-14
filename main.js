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
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float uTime;

void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    // Wave animations
    vec3 newPosition = position;
    
    // Keep main x-axis wave
    newPosition.y += sin(newPosition.x * 0.1 - uTime * 0.25) * 2.0;
    
    // Diagonal wind effect waves
    float windSpeed = uTime * 0.4;
    float diagonalWave = newPosition.x * 0.2 + newPosition.z * 0.7;
    
    // Primary diagonal waves
    newPosition.y += sin(diagonalWave + windSpeed) * 0.3;
    newPosition.y += cos(diagonalWave * 0.8 - windSpeed * 1.2) * 0.7;
    
    // Secondary diagonal waves with different frequencies
    newPosition.y += sin(diagonalWave * 1.5 + windSpeed * 0.7) * 0.5;
    newPosition.y += cos(diagonalWave * 2.3 - windSpeed * 0.9) * 0.3;
    
    // Add some x displacement for more natural movement
    newPosition.x += sin(diagonalWave * 0.4 + windSpeed) * 0.1;
    
    // Random-looking smaller waves
    float noise1 = sin(newPosition.z * 2.5 + newPosition.x * 0.4 + windSpeed * 1.2) * 0.05;
    float noise2 = cos(newPosition.z * 3.7 - newPosition.x * 0.3 + windSpeed * 0.8) * 0.05;
    float noise3 = sin(newPosition.z * 5.0 + newPosition.x * 0.6 + windSpeed * 1.5) * 0.05;
    newPosition.y += noise1 + noise2 + noise3;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;
// ---------------------------------- FRAGMENT SHADER
const fragmentShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float uTime;

void main() {
    // Fresnel calculation
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    
    // Much sharper fresnel falloff
    fresnel = pow(fresnel, 4.0);
    
    // Additional tightening of the rim
    fresnel = smoothstep(0.2, 0.8, fresnel);
    
    vec3 baseColor = vec3(1.0);
    vec3 rimColor = vec3(0.7, 0.8, 1.0);
    vec3 finalColor = mix(baseColor, rimColor, fresnel);
    
    // Much lower base opacity and sharper transition
    float opacity = mix(0.01, 0.7, pow(fresnel, 2.0));
    
    gl_FragColor = vec4(finalColor, opacity);
}
`;
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
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
