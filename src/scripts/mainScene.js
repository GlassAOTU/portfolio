// import threejs stuff
import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { getParticleSystem } from './particleSystem.js';

import fragmentShader from '../shaders/fragment.glsl?raw';
import vertexShader from '../shaders/vertex.glsl?raw';

// creates an empty scene
const scene = new THREE.Scene();

// easy to refer to the window size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// listens to window size to resize
window.addEventListener('resize', () => {
    // update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // update camera
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height);
});

// creates and places the camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 200);
camera.position.set(0, 3, -70);
camera.lookAt(0, 0, 0)
scene.add(camera);

// creates the renderer with the window size and transparency to see the css gradient
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, powerPreference: "high-performance" });
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// creates the post-processing composer and adds antialiasing
const composer = new EffectComposer(renderer, );
const renderScene = new RenderPass(scene, camera);
const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(smaaPass);

// creates a material with custom shaders
const waveMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0 }
    },
    transparent: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
});

// creates the mesh for the wave
const waveGeometry = new THREE.PlaneGeometry(200, 30, 200, 200);
const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
waveMesh.rotateX(1.39626);     // flatten the plane
scene.add(waveMesh);

// creates the two particle systems for each direction
const sparklesUp = getParticleSystem({
    camera,
    emitter: waveMesh,
    parent: scene,
    rate: 3,
    texture: "../images/sparkle.png",
    velocity: 0.3,
});
const sparklesDown = getParticleSystem({
    camera,
    emitter: waveMesh,
    parent: scene,
    rate: 3,
    texture: "../images/sparkle.png",
    velocity: -0.3,
});







const clock = new THREE.Clock(); // gets the time to update animations
// loop to keep rendering the scene and animating
function animate() {
    // update the time uniform

    const elapsedTime = clock.getElapsedTime();
    waveMaterial.uniforms.uTime.value = elapsedTime; // pass the time into the shader
    
    // update particles
    sparklesUp.update(0.016);
    sparklesDown.update(0.016);
    
    // render with post-processing
    composer.render();

    // calls animate to keep running
    requestAnimationFrame(animate);
}
animate(); // initial call