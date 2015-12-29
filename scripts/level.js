elation.require([], function() {
  elation.component.add('engine.things.snake_level', function() {
    this.postinit = function() {
      this.defineProperties({
        width: { type: 'integer', default: 60 },
        height: { type: 'integer', default: 60 },
        blocksize: { type: 'float', default: 1 }
      });
    }
    this.createObject3D = function() {
      var geometry = new THREE.Geometry(),
          blocksize = this.properties.blocksize,
          box      = new THREE.BoxGeometry(blocksize, blocksize, blocksize),
          mat      = new THREE.MeshPhongMaterial({ color: new THREE.Color(0x0000ff) }),
          mesh     = new THREE.Mesh(box);
          

      this.map = this.generate(this.properties.width, this.properties.height);

      var offset = [(blocksize * this.map[0].length) / 2, (blocksize * this.map.length) / 2];
      for (var row = 0; row < this.map.length; row++) {
        for (var col = 0; col < this.map[row].length; col++) {
          if (this.map[row][col] == 1) {
            mesh.position.fromArray([col * blocksize - offset[0], row * blocksize - offset[1], 0]);
            mesh.updateMatrix();
            geometry.merge(mesh.geometry, mesh.matrix);
          }
        }
      }
      var walls = new THREE.Mesh(geometry, mat);
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(this.properties.width, this.properties.height), new THREE.MeshPhongMaterial({color: 0x116666}));
      floor.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-blocksize/2, -blocksize/2, -blocksize/2));
      floor.add(walls);
      return floor;
    }
    this.generate = function(width, height) {
      var map = [];
      for (var y = 0; y < height; y++) {
        map[y] = [];
        for (var x = 0; x < width; x++) {
          map[y][x] = (y == 0 || y == height - 1 || x == 0 || x == width - 1);
        } 
      } 
      return map;
    }
  }, elation.engine.things.generic);
});
