elation.require([], function() {
  elation.component.add('engine.things.snake_level', function() {
    this.postinit = function() {
      this.defineProperties({
        width: { type: 'integer', default: 80 },
        height: { type: 'integer', default: 50 },
        blocksize: { type: 'float', default: 1 },
        startpos: { type: 'vector2', default: [40,25] },
        startdir: { type: 'string', default: 'move_right' },
        startpos2: { type: 'vector2', default: [40,35] },
        startdir2: { type: 'string', default: 'move_right' },
        level: { type: 'integer', default: 1 }
      });
      if (this.properties.level > 0) {
        this.loadLevel(this.properties.level);
      }
    }
    this.createObject3D = function() {
      this.map = this.generate(this.properties.width, this.properties.height);

      var geometry = this.generateGeometry(this.map),
          blocksize = this.properties.blocksize,
          mat   = new THREE.MeshPhongMaterial({ color: 0x0000ff }),
          walls = new THREE.Mesh(geometry, mat),
          floorgeometry = this.generateFloorGeometry(this.map),
          floor = new THREE.Mesh(floorgeometry, new THREE.MeshPhongMaterial({color: 0x116666}));

      //floor.geometry.applyMatrix(new THREE.Matrix4().makeTranslation((this.properties.width - blocksize) / 2, (this.properties.height - blocksize) / 2, 0));
      floor.add(walls);
      this.walls = walls;
      this.floor = floor;
      return floor;
    }
    this.generateFloorGeometry = function(map) {
      if (map.length > 0) {
        var width = map[0].length,
            height = map.length,
            blocksize = this.properties.blocksize;
        var floorgeometry = new THREE.PlaneGeometry(width, height);

        floorgeometry.applyMatrix(new THREE.Matrix4().makeTranslation((width - blocksize) / 2, (height - blocksize) / 2, 0));
      } else {
        var floorgeometry = new THREE.Geometry();
      }
      return floorgeometry;
    }
    this.generateGeometry = function(map) {
      var geometry = new THREE.Geometry(),
          blocksize = this.properties.blocksize,
          box      = new THREE.BoxGeometry(blocksize, blocksize, blocksize),
          mesh     = new THREE.Mesh(box);
      var directions = {
        '↑': 'move_up',
        '↓': 'move_down',
        '←': 'move_left',
        '→': 'move_right',
        '⇑': 'move_up',
        '⇓': 'move_down',
        '⇐': 'move_left',
        '⇒': 'move_right'
      };
      for (var row = 0; row < map.length; row++) {
        for (var col = 0; col < map[row].length; col++) {
          var block = map[row][col];
          switch (block) {
            case 'W':
              mesh.position.fromArray([col * blocksize, map.length - 1 - row * blocksize, 0]);
              mesh.updateMatrix();
              geometry.merge(mesh.geometry, mesh.matrix);
              break;
            case '↑':
            case '↓':
            case '←':
            case '→':
              this.properties.startpos.x = col;
              this.properties.startpos.y = this.properties.height - 1 - row;
              this.properties.startdir = directions[block];
              break;
            case '⇑':
            case '⇓':
            case '⇐':
            case '⇒':
              this.properties.startpos2.x = col;
              this.properties.startpos2.y = this.properties.height - 1 - row;
              this.properties.startdir2 = directions[block];
              break;
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
      this.floor.geometry = this.generateFloorGeometry(blocks);
      this.map = blocks;
      this.refresh();
      elation.events.fire({type: 'level_load', element: this, data: blocks});
    }
    this.getBlock = function(x, y) {
      if (y > 0 && y < this.map.length && this.map[y][x]) { 
        return this.map[y][x];
      }
      return 'W';
    }
  }, elation.engine.things.generic);
});
