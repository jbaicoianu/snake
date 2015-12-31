elation.require([], function() {
  elation.component.add('engine.things.snake_target', function() {
    this.createObject3D = function() {
      var geo = new THREE.SphereGeometry(.5);
      var mat = new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: 0});
      var mesh = new THREE.Mesh(geo, mat);
      this.light = new THREE.PointLight(0xffff00, .5, 10);
      mesh.add(this.light);
      this.light.position.z = 2;
      return mesh;
    }
    this.createChildren = function() {
    }
    this.setLabel = function(label) {
      if (this.label) this.remove(this.label);
      //this.label = new THREE.Mesh(new THREE.TextGeometry(label), new THREE.MeshPhongMaterial({color: 0xccccc}));
      this.label = this.spawn('label', 'label_' + label, {
        text: label, 
        size: 1.25,
        thickness: 0.85, 
        font: 'Graph 35+ pix',
        align: 'center',
        verticalalign: 'middle',
        zalign: 'back'
      });
    }
  }, elation.engine.things.generic);
});
