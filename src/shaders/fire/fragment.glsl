uniform float uTime;
uniform float uFrequency;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

void main()
{
  // Scale and animate
  vec2 smokeUv = vUv;
  smokeUv.x *= 0.8;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * uFrequency;

  // Smoke
  float smoke = texture(uPerlinTexture, smokeUv).r;

  // Remap
  smoke = smoothstep(0.4, 1.0, smoke);

  // Edges
  smoke *= smoothstep(0.0, 0.1, vUv.x);
  smoke *= smoothstep(1.0, 0.9, vUv.x);
  smoke *= smoothstep(0.0, 0.1, vUv.y);
  smoke *= smoothstep(1.0, 0.4, vUv.y);

  vec3 finalColor = mix(uColor1, uColor2, smoke);

  // Final Color
  gl_FragColor = vec4(finalColor, smoke * uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
