uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // First light source position
    vec3 lightPosition1 = vec3(-40.0, 10.0, 0.0);  // First light source
    vec3 lightPosition2 = vec3(40.0, 10.0, 0.0);   // Second light source (opposite position)
    
    // Calculate direction vectors for both lights
    vec3 lightDir1 = normalize(lightPosition1 - vPosition);
    vec3 lightDir2 = normalize(lightPosition2 - vPosition);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 normal = normalize(vNormal);
    
    // Calculate reflection vectors for both lights
    vec3 reflection1 = reflect(-lightDir1, normal);
    vec3 reflection2 = reflect(-lightDir2, normal);
    
    // Calculate specular for both lights
    float specular1 = pow(max(dot(reflection1, viewDir), 0.5), 128.0) * 10.0;
    float specular2 = pow(max(dot(reflection2, viewDir), 0.5), 128.0) * 10.0;
    //                                                   ^base    ^power  ^intensity
    
    // Combine the specular highlights
    float combinedSpecular = min(specular1 + specular2, 50.0); // Increased max for combined lights
    
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 10.0);
    
    // Adjusted final color to account for both specular highlights
    vec3 finalColor = vec3(0.98) * 0.25 + min(combinedSpecular, 3.0) * 1.2 + fresnel * 0.3;
    
    // Adjusted alpha to account for both specular highlights
    float alpha = mix(0.000001, 0.15, fresnel + min(combinedSpecular * 0.1, 0.3));
    
    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), alpha);
}