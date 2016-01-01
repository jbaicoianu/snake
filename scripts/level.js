elation.require([], function() {
  elation.component.add('engine.things.snake_level', function() {
    this.postinit = function() {
      this.defineProperties({
        width: { type: 'integer', default: 60 },
        height: { type: 'integer', default: 60 },
        blocksize: { type: 'float', default: 1 },
        startpos: { type: 'vector2', default: [0,0] },
        level: { type: 'integer', default: 1 }
      });
      this.loadLevel(this.properties.level);
    }
    this.createObject3D = function() {
      this.map = this.generate(this.properties.width, this.properties.height);

      var geometry = this.generateGeometry(this.map),
          blocksize = this.properties.blocksize,
          mat   = new THREE.MeshPhongMaterial({ color: 0x0000ff }),
          walls = new THREE.Mesh(geometry, mat),
          floor = new THREE.Mesh(new THREE.PlaneGeometry(this.properties.width, this.properties.height), new THREE.MeshPhongMaterial({color: 0x116666}));

      floor.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-blocksize/2, -blocksize/2, -blocksize/2));
      floor.add(walls);
      this.walls = walls;
      return floor;
    }
    this.generateGeometry = function(map) {
      var geometry = new THREE.Geometry(),
          blocksize = this.properties.blocksize,
          box      = new THREE.BoxGeometry(blocksize, blocksize, blocksize),
          mesh     = new THREE.Mesh(box);
      var offset = [(blocksize * map[0].length) / 2, (blocksize * map.length) / 2];
      for (var row = 0; row < map.length; row++) {
        for (var col = 0; col < map[row].length; col++) {
          if (map[row][col] == 'W') {
            mesh.position.fromArray([col * blocksize - offset[0], - (row * blocksize - offset[1]) - 1, 0]);
            mesh.updateMatrix();
            geometry.merge(mesh.geometry, mesh.matrix);
          } else if (map[row][col] == 'S') {
            this.properties.startpos.x = col;
            this.properties.startpos.y = this.properties.height - 1 - row;
          }
        }
      }
      return geometry;
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
    this.loadLevel = function(n) {
      var levelnum = (n < 10 ? '0' : '') + n;
      var levelpath = '/media/snake/levels/level' + levelnum + '.txt';
      elation.net.get(levelpath, {}, {callback: elation.bind(this, this.handleLevelLoad) });
    }
    this.parseLevel = function(level) {
      var blocks = [];
      var lines = level.split('\n');
      for (var y = 0; y < lines.length; y++) {
        var line = lines[y].split('');
        if (line.length > 0) {
          blocks.push(line);
        }
      }
      return blocks;
    }
    this.handleLevelLoad = function(data) {
      var blocks = this.parseLevel(data);
      this.walls.geometry = this.generateGeometry(blocks);
      this.map = blocks;
      this.refresh();
      elation.events.fire({type: 'level_load', element: this, data: blocks});
    }
    this.getBlock = function(x, y) {
      return this.map[y][x];
    }
  }, elation.engine.things.generic);
});
