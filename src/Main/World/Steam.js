import * as THREE from "three";

import Main from "../Main";
import Slider from "../Slider";

import steamVertexShader from "../../shaders/steam/vertex.glsl";
import steamFragmentShader from "../../shaders/steam/fragment.glsl";

export default class Steam {
  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;
    this.time = this.main.time;
    this.resources = this.main.resources;

    // slider
    this.slider = new Slider();
    this.slider.on("rangeChanged", () => {
      const rangeValue = this.slider.rangeElement.value;
      this.updateSteamFrequency(rangeValue);
    });

    this.debug = this.main.debug;
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("steam");
    }
    this.debugObject = {};

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 16, 64);
    this.geometry.translate(0, 1 / 2, 0);
    this.geometry.scale(2, 2, 2);
  }

  setTextures() {
    this.texture = this.resources.items.perlinTexture;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
  }

  setMaterial() {
    this.debugObject.color = "#ffffff";

    this.material = new THREE.ShaderMaterial({
      vertexShader: steamVertexShader,
      fragmentShader: steamFragmentShader,

      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: 0 },
        uOpacity: { value: 0 },
        uPerlinTexture: { value: this.resources.items.perlinTexture }
      },

      side: THREE.DoubleSide,
      // wireframe: true,
      transparent: true,
      depthWrite: false,
    });

    if (this.debug.active) {
      this.debugFolder.addColor(this.debugObject, "color").onChange(() => {
        this.material.uniforms.uColor.value.set(this.debugObject.color);
      });
      this.debugFolder
        .add(this.material.uniforms.uFrequency, "value", 0, 1, 0.001)
        .name("steamFrequency");
    }
  }

  updateSteamFrequency(value) {
    this.material.uniforms.uFrequency.value = value;
  }

  updateOpacity(value) {
    this.material.uniforms.uOpacity.value = value;
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = 1.4;
    this.scene.add(this.mesh);

    if (this.debug.active) {
      this.debugFolder.add(this.mesh.position, "x").min(-10).max(10).step(0.001);
      this.debugFolder.add(this.mesh.position, "y").min(-10).max(10).step(0.001);
      this.debugFolder.add(this.mesh.position, "z").min(-10).max(10).step(0.001);
    }
  }

  update() {
    this.material.uniforms.uTime.value = this.time.elapsed * 0.001;
  }
}
