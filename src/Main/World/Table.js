import * as THREE from "three";

import Main from "../Main";

export default class Table {
  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;
    this.resources = this.main.resources;

    this.debug = this.main.debug;
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("table");
    }
    this.debugObject = {};

    this.setMaterial();
    this.setGeometries();
    this.setMeshes();
  }

  setMaterial() {
    this.debugObject.color = "#8B4513";
    this.material = new THREE.MeshStandardMaterial({
      color: this.debugObject.color,
      roughness: 0.8,
      metalness: 0.1
    });

    if (this.debug.active) {
      this.debugFolder.addColor(this.debugObject, "color").onChange(() => {
        this.material.color.set(this.debugObject.color);
      });
      this.debugFolder.add(this.material, "roughness").min(0).max(1).step(0.01);
      this.debugFolder.add(this.material, "metalness").min(0).max(1).step(0.01);
    }
  }

  setGeometries() {
    // Table top
    this.topGeometry = new THREE.BoxGeometry(5, 0.3, 5);
    
    // Table legs (thicker and shorter)
    this.legGeometry = new THREE.BoxGeometry(0.4, 2, 0.4);
  }

  setMeshes() {
    // Create table top
    this.tableTop = new THREE.Mesh(this.topGeometry, this.material);
    this.tableTop.position.y = 0;
    this.tableTop.receiveShadow = true;

    // Create table legs
    this.legs = [];
    const legPositions = [
      { x: 2, z: 2 },
      { x: -2, z: 2},
      { x: 2, z: -2 },
      { x: -2, z: -2 }
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(this.legGeometry, this.material);
      leg.position.set(pos.x, -1, pos.z);
      leg.receiveShadow = true;
      leg.castShadow = true;
      this.legs.push(leg);
    });

    // Add everything to the scene
    this.scene.add(this.tableTop);
    this.legs.forEach(leg => this.scene.add(leg));
  }
}
