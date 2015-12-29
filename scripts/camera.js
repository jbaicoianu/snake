elation.require([], function() {
  elation.component.add('engine.things.snake_camera', function() {
    this.createObject3D = function() {
      this.camera = new THREE.PerspectiveCamera(90, 4/3, 0.1, 100);
      return this.camera;
    }
  }, elation.engine.things.generic);
});
