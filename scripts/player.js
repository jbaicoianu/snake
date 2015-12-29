elation.require([], function() {
  elation.component.add('engine.things.snake_player', function() {
    this.postinit = function() {
      this.defineProperties({
        speed: { type: 'float', default: 2 }
      });
      this.controls = this.engine.systems.controls.addContext('player', {
        'move_up': ['keyboard_w,keyboard_shift_w,keyboard_up', elation.bind(this, this.updateControls)],
        'move_down': ['keyboard_s,keyboard_shift_s,gamepad_0_axis_1,keyboard_down', elation.bind(this, this.updateControls)],
        'move_left': ['keyboard_a,keyboard_shift_a,keyboard_left', elation.bind(this, this.updateControls)],
        'move_right': ['keyboard_d,keyboard_shift_d,gamepad_0_axis_0,keyboard_right', elation.bind(this, this.updateControls)],
        'reset': ['keyboard_r', elation.bind(this, this.reset)],
      });
      this.engine.systems.controls.activateContext('player');
      this.movedir = [0, 0];
      this.segments = [];
    }
    this.createObject3D = function() {
      return new THREE.Object3D();
    }
    this.createChildren = function() {
      this.head = this.createSegment('head');
      this.tail = this.createSegment('tail');
    }
    this.createSegment = function(id) {
      if (!id) id = this.segments.length;
      var pos = (this.segments.length > 0 ? this.segments[this.segments.length - 1].properties.position : this.properties.position);
      var segment = this.spawn('snake_segment', 'segment' + id, {
        position: pos.toArray()
      }, true);
      return segment;
    }
    this.addSegment = function() {
      var segment = this.createSegment();
      this.segments.push(segment);
      return segment;
    }
    this.updateControls = function(ev) {
      var moves = {
        'move_up': [0, 1],
        'move_down': [0, -1],
        'move_left': [-1, 0],
        'move_right': [1, 0]
      };
      if (ev.value == 1) {
        var move = moves[ev.type];
        this.move(move);
      }
    }
    this.move = function(dir) {
      if (!(dir[0] == 0 && dir[1] == 0) && (this.segments.length == 1 || !(dir[0] == this.movedir[0] * -1 && dir[1] == this.movedir[1] * -1))) {
        this.movedir = dir;
      }
    }
    this.setLength = function(length) {
      this.addSegment();
    }
    this.update = function() {
      var speed = this.properties.speed;
      this.properties.velocity.set(this.movedir[0] * speed, this.movedir[1] * speed, 0);
      this.snapPosition();
    }
    this.snapPosition = function() {
      var pos = this.properties.position;
      pos.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));

      if (this.head && this.tail) {
        this.head.properties.position.copy(pos);
        this.head.properties.velocity.copy(this.properties.velocity);
        this.tail.properties.position.copy(this.properties.position);
        this.tail.properties.velocity.copy(this.properties.velocity);

console.log(this.segments.length);
        if (this.segments.length > 1) {
          this.segments[0].properties.position.copy(pos);
          this.tail.properties.position.copy(this.segments[this.segments.length - 1].properties.position);
          this.tail.properties.velocity.subVectors(this.segments[this.segments.length - 2].properties.position, this.segments[this.segments.length - 1].properties.position).multiplyScalar(this.properties.speed);
          this.segments[0].properties.velocity.set(0,0,0);
          for (var i = this.segments.length-1; i > 0; i--) {
            this.segments[i].properties.position.copy(this.segments[i-1].properties.position);
          }
        } else {
          this.segments[0].properties.position.copy(pos);
          this.segments[0].properties.velocity.copy(this.properties.velocity);
        }
      }

    }
    this.reset = function() {
      this.properties.position.set(0,0,0);
      this.properties.velocity.set(0,0,0);

      if (this.head && this.tail) {
        this.head.properties.position.set(0,0,0);
        this.head.properties.velocity.set(0,0,0);

        this.tail.properties.position.set(0,0,0);
        this.tail.properties.velocity.set(0,0,0);
      }

      this.movedir = [0,0];
      this.refresh();
      for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].die();
      }
      this.segments = [];
      this.addSegment();
    }

    this.isCollidingWithSelf = function() {
      var pos = new THREE.Vector3(
        Math.round(this.properties.position.x),
        Math.round(this.properties.position.y),
        Math.round(this.properties.position.z)
      );
      
      for (var i = 1; i < this.segments.length; i++) {
        var segpos = this.segments[i].properties.position;
console.log(pos.toArray(), segpos.toArray());
        if (pos.equals(segpos)) {
          return true;
        }
      }
      return false;
    }
  }, elation.engine.things.generic);
  elation.component.add('engine.things.snake_segment', function() {
    this.createObject3D = function() {
      var segment = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshPhongMaterial({color: 0xffff00}));
      return segment;
    }
  }, elation.engine.things.generic);
});
