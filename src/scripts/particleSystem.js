import * as THREE from 'three';

const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 aColor;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColor = aColor;
}`;

const _FS = `
uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}`;

function getLinearSpline(lerp) {
  const points = [];
  const _lerp = lerp;

  function addPoint(t, d) {
    points.push([t, d]);
  }

  function getValueAt(t) {
    let p1 = 0;

    for (let i = 0; i < points.length; i++) {
      if (points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(points.length - 1, p1 + 1);

    if (p1 == p2) {
      return points[p1][1];
    }

    return _lerp(
      (t - points[p1][0]) / (
        points[p2][0] - points[p1][0]),
      points[p1][1], points[p2][1]);
  }
  return { addPoint, getValueAt };
}

function getParticleSystem(params) {
  const { camera, emitter, parent, rate, texture, velocity } = params;
  const uniforms = {
    diffuseTexture: {
      value: new THREE.TextureLoader().load('/src/assets/sparkle.png')
    },
    pointMultiplier: {
      value: window.innerHeight / (2.0 * Math.tan(30.0 * Math.PI / 180.0))
    }
  };

  const _material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: _VS,
    fragmentShader: _FS,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
  geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

  const _points = new THREE.Points(geometry, _material);
  parent.add(_points);

  const radius = 75;
  const maxLife = 25.0;
  const maxSize = 0.25;
  let timeElapsed = 0;
  let spawnAccumulator = 0; // Add this for consistent spawning
  let _particles = [];

  function _InitializeParticles() {
    const particleSize = (Math.random() * 0.3 + 0.2) * maxSize;
    const life = maxLife;

    // Add more variation to initial positions
    const randomRadius = Math.random() * radius;
    const randomAngle = Math.random() * Math.PI * 2;

    const particle = {
      position: new THREE.Vector3(
        Math.cos(randomAngle) * randomRadius,  // Circular distribution
        (Math.random() * 1.5 * Math.sign(velocity)), // Height variation
        Math.sin(randomAngle) * randomRadius * 0.3  // Circular distribution with scaled z
      ).add(emitter.position),
      size: particleSize,
      currentSize: particleSize,
      colour: new THREE.Color(0xFFFFFF),
      alpha: 1.0,
      initialAlpha: Math.random() * 0.5 + 0.5,
      twinkleSpeed: Math.random() * 2 + 1,
      twinklePhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * 2.0 * Math.PI,
      rotationRate: Math.random() * 0.01 - 0.005,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        velocity * (Math.random() * 0.5 + 0.5),
        (Math.random() - 0.5) * 0.1
      ),
      life: life,
      maxLife: life
    };

    _particles.push(particle);
  }

  function _UpdateGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    for (let p of _particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
    }

    geometry.setAttribute(
      'position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute(
      'size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute(
      'aColor', new THREE.Float32BufferAttribute(colours, 4));
    geometry.setAttribute(
      'angle', new THREE.Float32BufferAttribute(angles, 1));

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;
    geometry.attributes.angle.needsUpdate = true;
  }

  function _UpdateParticles(deltaTime) {
    timeElapsed += deltaTime;
    spawnAccumulator += deltaTime;

    // Consistent spawn rate
    const spawnRate = 0.1; // Spawn every 0.1 seconds
    while (spawnAccumulator >= spawnRate) {
      _InitializeParticles();
      spawnAccumulator -= spawnRate;
    }
    // Chance to spawn new particle
    if (Math.random() < 0.02) {
      _InitializeParticles();
    }

    // Remove dead particles
    _particles = _particles.filter(p => p.life > 0);

    for (let p of _particles) {
      // Update life and get fade ratio
      p.life -= deltaTime;
      const lifeRatio = p.life / p.maxLife;
      const fadeAlpha = lifeRatio < 0.2 ? lifeRatio / 0.2 : 1;

      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

      // Twinkle and fade
      p.alpha = p.initialAlpha * fadeAlpha * (0.5 + 0.5 * Math.sin(timeElapsed * p.twinkleSpeed + p.twinklePhase));

      // Update rotation
      p.rotation += p.rotationRate;

      // Add subtle movement
      p.velocity.x += (Math.random() - 0.5) * 0.001;
      p.velocity.z += (Math.random() - 0.5) * 0.001;

      // Bounds checking
      if (Math.abs(p.position.x - emitter.position.x) > radius) {
        p.velocity.x *= -0.5;
      }
      if (Math.abs(p.position.z - emitter.position.z) > radius * 0.3) {
        p.velocity.z *= -0.5;
      }

      // Keep y velocity consistent
      p.velocity.y = velocity * (Math.random() * 0.5 + 0.5);

      // Update size with fade
      p.currentSize = p.size * fadeAlpha;
    }

    _UpdateGeometry();
  }

  // Initialize with starting particles
  for (let i = 0; i < 200; i++) {  // Increased from 50 to 200
    _InitializeParticles();
  }

  function update(deltaTime) {
    _UpdateParticles(deltaTime);
  }

  return { update };
}

export { getParticleSystem };