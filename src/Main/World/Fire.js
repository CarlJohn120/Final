import * as THREE from "three";

import Main from "../Main";
import Slider from "../Slider";

import fireVertexShader from "../../shaders/fire/vertex.glsl";
import fireFragmentShader from "../../shaders/fire/fragment.glsl";

export default class Fire {
  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;
    this.time = this.main.time;
    this.resources = this.main.resources;

    // slider
    this.slider = new Slider();
    this.slider.on("rangeChanged", () => {
      const rangeValue = this.slider.rangeElement.value;
      this.updateFireFrequency(rangeValue);
    });

    this.debug = this.main.debug;
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("fire");
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
    this.geometry.scale(1.2, 1, 1.2);
  }

  setTextures() {
    this.texture = this.resources.items.perlinTexture;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
  }

  setMaterial() {
    this.debugObject.color1 = "#ff131a";
    this.debugObject.color2 = "#e95e0a";

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: 0 },
        uPerlinTexture: { value: this.resources.items.perlinTexture },
        uColor1: { value: new THREE.Color("#ff4500") },
        uColor2: { value: new THREE.Color("#ffd700") },
        uOpacity: { value: 0 }
      },
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      transparent: true,
      depthWrite: false
    });

    if (this.debug.active) {
      this.debugFolder.addColor(this.debugObject, "color1").onChange(() => {
        this.material.uniforms.uColor1.value.set(this.debugObject.color1);
      });
      this.debugFolder.addColor(this.debugObject, "color2").onChange(() => {
        this.material.uniforms.uColor2.value.set(this.debugObject.color2);
      });
      this.debugFolder
        .add(this.material.uniforms.uFrequency, "value", 0, 1, 0.001)
        .name("fireFrequency");
    }
  }

  fadeOut() {
    // Gradually fade out the fire
    const fadeInterval = setInterval(() => {
      const currentOpacity = this.material.uniforms.uOpacity.value;
      if (currentOpacity > 0) {
        this.material.uniforms.uOpacity.value = Math.max(0, currentOpacity - 0.05);
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  updateFireFrequency(value) {
    this.material.uniforms.uFrequency.value = value;
  }

  setMesh() {
    this.mesh1 = new THREE.Mesh(this.geometry, this.material);
    this.mesh1.position.set(0, 0.46, 0.9);
    this.mesh1.rotation.set(0, Math.PI / 6, 0);

    this.mesh2 = new THREE.Mesh(this.geometry, this.material);
    this.mesh2.position.set(0, 0.46, -0.9);
    this.mesh2.rotation.set(0, Math.PI / 6, 0);

    this.mesh3 = new THREE.Mesh(this.geometry, this.material);
    this.mesh3.position.set(-0.9, 0.46, 0);
    this.mesh3.rotation.set(0, -1.1, 0);

    this.mesh4 = new THREE.Mesh(this.geometry, this.material);
    this.mesh4.position.set(0.9, 0.46, 0);
    this.mesh4.rotation.set(0, -1.1, 0);

    this.scene.add(this.mesh1, this.mesh2, this.mesh3, this.mesh4);
  }

  update() {
    this.material.uniforms.uTime.value = this.time.elapsed * 0.001;
  }
}
