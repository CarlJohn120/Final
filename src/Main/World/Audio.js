import * as THREE from "three";

import Main from "../Main";
import Slider from "../Slider";

export default class Audio {
  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;
    this.camera = this.main.camera;

    this.resources = this.main.resources;
    this.boilingAudio = this.resources.items.boilingAudio;

    // slider
    this.slider = new Slider();
    this.slider.on("rangeChanged", () => {
      const rangeValue = this.slider.rangeElement.value;
      this.updateAudioVolume(rangeValue);
    });

    this.debug = this.main.debug;
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("audio");
    }
    this.debugObject = {};

    this.setInstance();
  }

  setInstance() {
    // threejs sound
    const audioListener = new THREE.AudioListener();
    this.camera.instance.add(audioListener);

    this.boilingSound = new THREE.Audio(audioListener);

    this.boilingSound.autoplay = true;
    this.boilingSound.setLoop(true);
    this.boilingSound.setVolume(0.3);

    this.boilingSound.setBuffer(this.boilingAudio);
    this.boilingSound.play();

    this.scene.add(this.boilingSound);

  }

  updateAudioVolume(rangeValue = 0.3) {
    this.boilingSound.setVolume(Math.max(rangeValue, 0.2));
  }
}
