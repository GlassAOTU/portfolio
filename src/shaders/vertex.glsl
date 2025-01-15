uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vPosition = position;
    vNormal = normal;
    
    // big wave along x-axis --> sin(position * wavelength + time * speed) * amplitude
    vPosition.z += sin(vPosition.x * 0.05 - uTime * 0.2) * 5.0;
    vPosition.z += sin(vPosition.x * -0.15 - uTime * 0.5) * 0.2;

    // smaller waves along z-axis --> sin(position * wavelength + time * speed) * amplitude
    vPosition.z += sin(vPosition.y * 1.0 - uTime * 0.1) * 0.6;
    vPosition.z += sin(vPosition.y * 0.5 - uTime * 0.3) * 1.0;
    // vPosition.z += sin(vPosition.y * -2.0 - uTime * 0.2) * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}