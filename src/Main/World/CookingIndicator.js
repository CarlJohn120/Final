import * as THREE from "three";
import Main from "../Main";
import EventEmitter from "../Utils/EventEmitter";

export default class CookingIndicator extends EventEmitter {
    constructor() {
        super();
        this.main = new Main();
        this.scene = this.main.scene;
        this.cookingProgress = 0;
        this.isCooking = false;
        this.cookingRate = 1;
        this.isCooked = false;
        this.isPaused = false;
        this.lastProgress = 0;

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
        this.createCookedText();
    }

    setGeometry() {
        // Create a thin bar geometry
        this.geometry = new THREE.BoxGeometry(2, 0.1, 0.1);
        this.backgroundGeometry = new THREE.BoxGeometry(2.1, 0.15, 0.12); // Slightly larger to contain the progress bar
    }

    setMaterial() {
        // Progress bar material (green)
        this.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide, // Make visible from both sides
            depthTest: false // Ensure visibility through other objects
        });
        
        // Background material (gray)
        this.backgroundMaterial = new THREE.MeshBasicMaterial({
            color: 0x808080,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide, // Make visible from both sides
            depthTest: false // Ensure visibility through other objects
        });
    }

    setMesh() {
        // Create background bar
        this.backgroundBar = new THREE.Mesh(this.backgroundGeometry, this.backgroundMaterial);
        this.backgroundBar.position.set(0, 2.5, 0); // Higher position, centered above model
        this.backgroundBar.rotation.x = -Math.PI / 8;
        this.backgroundBar.renderOrder = 999;
        this.scene.add(this.backgroundBar);

        // Create progress bar
        this.progressBar = new THREE.Mesh(this.geometry, this.material);
        this.progressBar.position.set(-1, 2.5, 0.01); // Match height with background bar
        this.progressBar.rotation.x = -Math.PI / 8;
        this.progressBar.scale.x = 0;
        this.progressBar.renderOrder = 1000;
        this.scene.add(this.progressBar);
    }

    createCookedText() {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Text settings
        context.fillStyle = '#00ff00';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('COOKED!', canvas.width/2, canvas.height/2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            side: THREE.DoubleSide
        });

        // Create plane for text
        const geometry = new THREE.PlaneGeometry(2, 0.5);
        this.cookedText = new THREE.Mesh(geometry, material);
        this.cookedText.position.set(0, 3, 0);
        this.cookedText.rotation.x = -Math.PI / 8;
        this.cookedText.visible = false;
        this.scene.add(this.cookedText);
    }

    updateCookingRate(fireIntensity) {
        // Update cooking rate based on fire intensity (0 to 1)
        this.cookingRate = 0.5 + (fireIntensity * 1.5); // Adjust these values as needed
    }

    update() {
        if (this.isCooking && this.cookingProgress < 1 && !this.isPaused) {
            this.cookingProgress += 0.0005 * this.cookingRate;
            
            this.progressBar.scale.x = this.cookingProgress;
            this.progressBar.position.x = -1 + (this.cookingProgress);

            if (this.cookingProgress >= 1) {
                this.material.color.setHex(0x00ff00);
                if (!this.isCooked) {
                    this.isCooked = true;
                    this.onCookingComplete();
                }
            } else if (this.cookingProgress > 0.7) {
                this.material.color.setHex(0xffff00);
            }
        }
    }

    startCooking() {
        this.isCooking = true;
        this.isPaused = false;
        this.cookingProgress = 0;
        this.progressBar.scale.x = 0;
        this.progressBar.position.x = -1;
        this.material.color.setHex(0x00ff00);
        this.cookedText.visible = false;
    }

    pauseCooking() {
        this.isPaused = true;
        // Store current progress
        this.lastProgress = this.cookingProgress;
    }

    resumeCooking() {
        this.isPaused = false;
        // Resume from stored progress
        this.cookingProgress = this.lastProgress;
    }

    resetCooking() {
        this.cookingProgress = 0;
        this.isCooked = false;
        this.progressBar.scale.x = 0;
        this.progressBar.position.x = -1;
        this.material.color.setHex(0x00ff00);
        this.cookedText.visible = false;
    }

    onCookingComplete() {
        // Show "COOKED!" text
        this.cookedText.visible = true;
        
        // Emit event for other components to react
        this.trigger('cookingComplete');
        
        // Stop cooking
        this.isCooking = false;
    }
} 