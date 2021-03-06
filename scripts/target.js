elation.require(['engine.things.sound'], function() {
  elation.component.add('engine.things.snake_target', function() {
    this.createObject3D = function() {
      var geo = new THREE.SphereGeometry(.25);
      var mat = new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: 0});
      var mesh = new THREE.Mesh(geo, mat);
      this.light = new THREE.SpotLight(0xffff00, .5, 1000);
      mesh.add(this.light);
      this.light.position.z = 3;
      this.light.target = mesh;
      this.light.castShadow = true;
      return mesh;
    }
    this.createChildren = function() {
      this.sound = this.spawn('sound', 'target_sound', {src: '/media/snake/sounds/SFX_Powerup_47.ogg', loop: false});
    }
    this.setLabel = function(label) {
      if (this.label) this.remove(this.label);
      //this.label = new THREE.Mesh(new THREE.TextGeometry(label), new THREE.MeshPhongMaterial({color: 0xccccc}));
      this.label = this.spawn('label', 'label_' + label, {
        text: label, 
        size: 1,
        thickness: 1.15,
        font: 'Graph 35+ pix',
        align: 'center',
        verticalalign: 'middle',
        zalign: 'middle',
        'bevel.enabled': true,
        'bevel.thickness': .05,
        'bevel.size': .05,
      });
      if (this.sound && !this.sound.playing) {
        this.sound.play();
      }
    }
  }, elation.engine.things.generic);
});
