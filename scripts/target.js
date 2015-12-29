elation.require([], function() {
  elation.component.add('engine.things.snake_target', function() {
    this.createObject3D = function() {
return new THREE.Object3D();
      var geo = new THREE.SphereGeometry(0.75);
      var mat = new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: .4});
      return new THREE.Mesh(geo, mat);
    }
    this.setLabel = function(label) {
      if (this.label) this.remove(this.label);
      //this.label = new THREE.Mesh(new THREE.TextGeometry(label), new THREE.MeshPhongMaterial({color: 0xccccc}));
      this.label = this.spawn('label', 'label_' + label, { text: label, size: 0.75, position: [-.1, 0, 0] });
    }
  }, elation.engine.things.generic);
});
