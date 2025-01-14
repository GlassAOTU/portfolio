import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import "./style.css";

// create a scene
const scene = new THREE.Scene();

// shader stuff
// -------------------------------------------------------------------sin wave format === sin(position * wavelength + time * speed) * amplitude
// ---------------------------------- VERTEX SHADER
const vertexShader = `
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vPosition = position;
    vNormal = normal;
    
    // big wave along x-axis --> sin(position * wavelength + time * speed) * amplitude
    vPosition.z += sin(vPosition.x * 0.1 - uTime * 0.1) * 2.0;
    vPosition.z += sin(vPosition.x * -0.15 - uTime * 0.05) * 1.0;

    // smaller waves along z-axis --> sin(position * wavelength + time * speed) * amplitude
    vPosition.z += sin(vPosition.y * 1.0 - uTime * 0.1) * 0.3;
    vPosition.z += sin(vPosition.y * 0.5 - uTime * 0.3) * 0.6;
    // vPosition.z += sin(vPosition.y * -2.0 - uTime * 0.2) * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;
// ---------------------------------- FRAGMENT SHADER
const fragmentShader = `
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.1);
}
`;
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 }
    },
    transparent: true, // Ensure transparency
    blending: THREE.AdditiveBlending, // Additive blending for soft overlaps
    side: THREE.DoubleSide, // Render both sides for smooth transitions
    depthWrite: false // Disable depth writing to avoid depth sorting issues
});

// create a plane
const geometry = new THREE.PlaneGeometry(90, 30, 200, 200);
const mesh = new THREE.Mesh(geometry, material);
mesh.rotateX(-Math.PI / 2);
scene.add(mesh);

// light
const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(0, 10, 10);
scene.add(light);

// axis helper
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

// sizing
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 30;
camera.position.y = 1;
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
