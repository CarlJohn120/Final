uniform float uTime;
uniform float uFrequency;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;

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

  // Use white color for steam and multiply by opacity
  vec3 color = vec3(1.0);
  float alpha = smoke * uOpacity;

  gl_FragColor = vec4(color, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}