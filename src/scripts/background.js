// import threejs stuff
import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

// importing custom particle system
import { getParticleSystem } from './particleSystem.js';

// importing shaders from other files
import fragmentShader from '../shaders/fragment.glsl?raw';
import vertexShader from '../shaders/vertex.glsl?raw';

// creating a scene
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

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

// camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 200);
camera.position.z = 60;
camera.position.y = 5;
scene.add(camera);

// renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// post processing
const composer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(smaaPass);

// creating a material
const waveMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});

// creating a plane
const waveGeometry = new THREE.PlaneGeometry(200, 30, 200, 200);
const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
waveMesh.rotateX(-Math.PI / 2);
scene.add(waveMesh);

// particle system
const sparklesUp = getParticleSystem({
    camera,
    emitter: waveMesh,
    parent: scene,
    rate: 1,
    texture: "../assets/sparkle.png",
    velocity: 0.3,
});
const sparklesDown = getParticleSystem({
    camera,
    emitter: waveMesh,
    parent: scene,
    rate: 1,
    texture: "../assets/sparkle.png",
    velocity: -0.3,
});

const clock = new THREE.Clock();
function animate() {
    // update the time uniform
    const elapsedTime = clock.getElapsedTime();
    waveMaterial.uniforms.uTime.value = elapsedTime;
    
    // update particles
    sparklesUp.update(0.016);
    sparklesDown.update(0.016);
    
    // render with post-processing
    composer.render();
    
    requestAnimationFrame(animate);
}
animate();