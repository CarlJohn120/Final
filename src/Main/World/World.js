import Main from "../Main";
import Environment from "./Environment";
import Model from "./Model";
import Table from "./Table";
import Steam from "./Steam";
import Fire from "./Fire";
import Audio from "./Audio";
import CookingIndicator from "./CookingIndicator";

export default class World {
  constructor() {
    this.main = new Main();
    this.resources = this.main.resources;
    this.resetButton = document.querySelector('.reset_button');
    this.cookButton = document.querySelector('.cook_button');
    this.isCookingStarted = false;
    this.stopButton = document.querySelector('.stop_button');
    this.resumeButton = document.querySelector('.resume_button');
    this.isCookingPaused = false;

    this.environment = new Environment();
    this.table = new Table();

    this.debug = this.main.debug;
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("audio");
    }
    this.debugObject = {};

    // Wait for resources
    this.resources.on("ready", () => {
      this.model = new Model();
      this.fire = new Fire();
      this.steam = new Steam();
      this.audio = new Audio();
      this.cookingIndicator = new CookingIndicator();
      
      // Initialize everything to minimum
      this.initializeMinimumState();
      
      this.setupEventListeners();
    });
  }

  initializeMinimumState() {
    // Set fire to minimum
    this.fire.updateFireFrequency(0);
    this.fire.material.uniforms.uOpacity.value = 0;
    
    // Set steam to minimum and transparent
    this.steam.updateSteamFrequency(0);
    this.steam.updateOpacity(0);
    
    // Set slider to minimum
    this.fire.slider.rangeElement.value = 0;
    this.fire.slider.updateSlider();
    this.fire.slider.rangeElement.disabled = true;
    
    // Ensure no sound
    if (this.audio) {
      this.audio.updateAudioVolume(0);
    }
  }

  setupEventListeners() {
    // Cook button listener
    this.cookButton.addEventListener('click', () => {
      if (!this.isCookingStarted) {
        this.startCooking();
        this.cookButton.disabled = true;
        this.isCookingStarted = true;
      }
    });

    // Listen for fire intensity changes
    this.fire.slider.on("rangeChanged", () => {
      if (!this.cookingIndicator.isCooked) {
        const fireIntensity = this.fire.slider.rangeElement.value;
        this.cookingIndicator.updateCookingRate(fireIntensity);
      }
    });

    // Listen for cooking complete
    this.cookingIndicator.on("cookingComplete", () => {
      this.onCookingComplete();
    });

    // Reset button listener
    this.resetButton.addEventListener('click', () => {
      this.resetCooking();
    });

    // Stop button listener
    this.stopButton.addEventListener('click', () => {
      if (this.isCookingStarted && !this.isCookingPaused) {
        this.stopCooking();
      }
    });

    // Resume button listener
    this.resumeButton.addEventListener('click', () => {
      if (this.isCookingStarted && this.isCookingPaused) {
        this.resumeCooking();
      }
    });
  }

  startCooking() {
    // Enable slider but keep it at minimum
    this.fire.slider.rangeElement.disabled = false;
    
    // Make fire visible but keep frequency at minimum
    this.fire.material.uniforms.uOpacity.value = 1.0;
    this.fire.updateFireFrequency(0);
    
    // Make steam visible but keep frequency at minimum
    this.steam.updateOpacity(1.0);
    this.steam.updateSteamFrequency(0);
    
    // Start cooking process
    this.cookingIndicator.startCooking();
    
    // Update UI
    this.cookButton.style.display = 'none';
    this.stopButton.style.display = 'block';
    this.resetButton.style.display = 'none';
  }

  stopCooking() {
    // Make fire transparent
    this.fire.material.uniforms.uOpacity.value = 0;
    
    // Set steam to minimum
    this.steam.updateSteamFrequency(0);
    this.steam.updateOpacity(0);
    
    // Disable slider
    this.fire.slider.rangeElement.disabled = true;
    
    // Stop audio
    if (this.audio) {
      this.audio.updateAudioVolume(0);
    }
    
    // Update UI
    this.stopButton.style.display = 'none';
    this.resumeButton.style.display = 'block';
    this.resetButton.style.display = 'block';
    this.isCookingPaused = true;
    
    // Pause cooking progress
    this.cookingIndicator.pauseCooking();
  }

  resumeCooking() {
    // Make fire visible again
    this.fire.material.uniforms.uOpacity.value = 1.0;
    
    // Enable slider
    this.fire.slider.rangeElement.disabled = false;
    
    // Update UI
    this.resumeButton.style.display = 'none';
    this.stopButton.style.display = 'block';
    this.resetButton.style.display = 'none';
    this.isCookingPaused = false;
    
    // Resume cooking progress
    this.cookingIndicator.resumeCooking();
    
    // Resume effects based on current slider value
    const fireIntensity = this.fire.slider.rangeElement.value;
    this.steam.updateSteamFrequency(fireIntensity);
    this.steam.updateOpacity(1.0);
    if (this.audio) {
      this.audio.updateAudioVolume(fireIntensity);
    }
  }

  resetCooking() {
    // Reset to minimum state
    this.initializeMinimumState();
    
    // Reset cooking indicator
    this.cookingIndicator.resetCooking();
    
    // Reset UI
    this.stopButton.style.display = 'none';
    this.resumeButton.style.display = 'none';
    this.resetButton.style.display = 'none';
    this.cookButton.style.display = 'block';
    this.cookButton.disabled = false;
    this.isCookingStarted = false;
    this.isCookingPaused = false;
  }

  onCookingComplete() {
    // Show reset button
    this.resetButton.style.display = 'block';
    
    // Disable slider
    this.fire.slider.rangeElement.disabled = true;
    
    // Fade out effects
    this.fire.fadeOut();
    this.steam.updateSteamFrequency(0.1);
    if (this.audio) {
      this.audio.updateAudioVolume(0.1);
    }
  }

  update() {
    if (this.model) this.model.update();
    if (this.steam) this.steam.update();
    if (this.fire) this.fire.update();
    if (this.cookingIndicator) this.cookingIndicator.update();
  }
}
