uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // Light positions
    vec3 lightPosition1 = vec3(-40.0, 10.0, 0.0);
    vec3 lightPosition2 = vec3(40.0, 10.0, 0.0);
    
    // Calculate light directions
    vec3 lightDir1 = normalize(lightPosition1 - vPosition);
    vec3 lightDir2 = normalize(lightPosition2 - vPosition);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 normal = normalize(vNormal);
    
    // Diffuse lighting
    float diffuse1 = max(dot(normal, lightDir1), 0.0);
    float diffuse2 = max(dot(normal, lightDir2), 0.0);
    float combinedDiffuse = (diffuse1 + diffuse2) * 0.5;
    
    // Specular highlights (softer)
    vec3 reflection1 = reflect(-lightDir1, normal);
    vec3 reflection2 = reflect(-lightDir2, normal);
    float specular1 = pow(max(dot(reflection1, viewDir), 0.0), 32.0) * 0.5;
    float specular2 = pow(max(dot(reflection2, viewDir), 0.0), 32.0) * 0.5;
    float combinedSpecular = (specular1 + specular2) * 0.5;
    
    // Fresnel effect for transparency
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
    
    // Combine lighting and texture
    vec3 baseColor = vec3(1.0, 1.0, 1.0); // Light fabric color
    vec3 finalColor = baseColor * (combinedDiffuse + combinedSpecular) + fresnel * 0.2;
    
    // Adjust alpha for smooth transparency
    float alpha = mix(0.1, 0.9, fresnel + combinedDiffuse * 0.5);
    
    // Reduce the alpha value to minimize multiplicative effect
    alpha = min(alpha, 0.3); // Adjust this value as needed
    
    // Output final color with reduced alpha
    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), alpha);
}