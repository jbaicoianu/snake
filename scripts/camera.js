elation.require([], function() {
  elation.component.add('engine.things.snake_camera', function() {
    this.createObject3D = function() {
      this.camera = new THREE.PerspectiveCamera(75, 4/3, 0.1, 100);
      this.ears = new THREE.AudioListener();
      // place camera at head height
      this.camera.add(this.ears);
      return this.camera;
    }
  }, elation.engine.things.generic);
});
