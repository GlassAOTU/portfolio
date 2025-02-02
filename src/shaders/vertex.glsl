uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vPosition = position;
    vec3 distortedNormal = normal;
    
    // Original X waves
    float xWave1 = sin(vPosition.x * -0.04 - uTime * 0.15) * 5.0;
    float xWave2 = sin(vPosition.x * -0.15 - uTime * 0.5) * 0.2;
    
    // Enhanced Y waves with more variation
    float yWave1 = sin(vPosition.y * 1.0 - uTime * 0.1) * 0.6;
    float yWave2 = sin(vPosition.y * 0.5 - uTime * 0.3) * 1.0;
    float yWave3 = cos(vPosition.y * 0.8 + uTime * 0.15) * 0.4; // Added cosine wave
    float yWave4 = sin(vPosition.y * 1.5 - vPosition.x * 0.1 - uTime * 0.25) * 0.3; // Wave that varies with both x and y
    
    // Total displacement
    float totalDisplacement = xWave1 + xWave2 + 
                             yWave1 + yWave2 + yWave3 + yWave4;
    vPosition.z += totalDisplacement;
    
    // Update normal calculations to include new waves
    vec3 tangent = vec3(1.0, 0.0, 
        cos(vPosition.x * 0.05 - uTime * 0.2) * 0.25 +
        cos(vPosition.x * -0.15 - uTime * 0.5) * 0.03);
    
    vec3 bitangent = vec3(0.0, 1.0,
        cos(vPosition.y * 1.0 - uTime * 0.1) * 0.6 +
        cos(vPosition.y * 0.5 - uTime * 0.3) * 0.5 +
        -sin(vPosition.y * 0.8 + uTime * 0.15) * 0.32 +  // Added for yWave3
        cos(vPosition.y * 1.5 - vPosition.x * 0.1 - uTime * 0.25) * 0.24); // Added for yWave4
        
    distortedNormal = normalize(cross(bitangent, tangent));
    vNormal = normalMatrix * distortedNormal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}