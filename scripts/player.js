elation.require([], function() {
  elation.component.add('engine.things.snake_player', function() {
    this.postinit = function() {
      this.defineProperties({
        speed: { type: 'float', default: 2 },
        speedmultiplier: { type: 'float', default: 1 }
      });
      this.controls = this.engine.systems.controls.addContext('player', {
        'move_up': ['keyboard_w,keyboard_shift_w,keyboard_up', elation.bind(this, this.updateControls)],
        'move_down': ['keyboard_s,keyboard_shift_s,gamepad_0_axis_1,keyboard_down', elation.bind(this, this.updateControls)],
        'move_left': ['keyboard_a,keyboard_shift_a,keyboard_left', elation.bind(this, this.updateControls)],
        'move_right': ['keyboard_d,keyboard_shift_d,gamepad_0_axis_0,keyboard_right', elation.bind(this, this.updateControls)],
        //'reset': ['keyboard_r', elation.bind(this, this.reset)],
        'speedup': ['keyboard_z', elation.bind(this, this.speedup)],
      });
      this.engine.systems.controls.activateContext('player');
      this.movedir = [0, 0];
      this.segments = [];
    }
    this.createObject3D = function() {
      return new THREE.Object3D();
    }
    this.createChildren = function() {
      this.head = this.spawn('snake_segment', 'segment_head', {
        position: this.properties.position.toArray()
      }, true);
      this.tail = this.spawn('snake_segment', 'segment_tail', {
        position: this.properties.position.toArray(),
        collidable: false
      }, true);
    }
    this.createSegment = function(id) {
      if (!id) id = this.segments.length;
      var pos = (this.segments.length > 0 ? this.segments[this.segments.length - 1].position : this.properties.position).clone();
      pos.x = Math.round(pos.x);
      pos.y = Math.round(pos.y);
      pos.z = Math.round(pos.z);

      var segment = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshPhongMaterial({color: 0xffcc00}));
      this.objects['3d'].parent.add(segment);
      segment.position.copy(pos);
      
      return segment;
    }
    this.addSegment = function() {
      var segment = this.createSegment();
      this.segments.push(segment);
      return segment;
    }
    this.addSegments = function(num) {
      for (var i = 0; i < num; i++) {
        this.addSegment();
      }
    }
    this.updateControls = function(ev) {
      if (ev.value == 1) {
        this.move(ev.type);
      }
    }
    this.move = function(dir) {
      var moves = {
        'move_up': [0, 1],
        'move_down': [0, -1],
        'move_left': [-1, 0],
        'move_right': [1, 0]
      };
      var move = moves[dir];

      if (!((dir == 'move_up' && this.currentmove == 'move_down') ||
            (dir == 'move_down' && this.currentmove == 'move_up') ||
            (dir == 'move_left' && this.currentmove == 'move_right') ||
            (dir == 'move_right' && this.currentmove == 'move_left'))) {
          

        if (!(move[0] == 0 && move[1] == 0) && (this.segments.length == 1 || !(move[0] == this.movedir[0] * -1 && move[1] == this.movedir[1] * -1))) {
          this.movedir = move;
        }
        this.nextmove = dir;
      }
    }
    this.setLength = function(length) {
      this.addSegments(10);
    }
    this.update = function() {
      var speed = this.properties.speed * this.properties.speedmultiplier;
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

        if (this.segments.length > 1) {
          this.segments[0].position.copy(pos);
          this.tail.properties.position.copy(this.segments[this.segments.length - 1].position);
          this.tail.properties.velocity.subVectors(this.segments[this.segments.length - 2].position, this.segments[this.segments.length - 1].position).multiplyScalar(this.properties.speed);
          for (var i = this.segments.length-1; i > 0; i--) {
            this.segments[i].position.copy(this.segments[i-1].position);
          }
        } else {
          this.segments[0].position.copy(pos);
        }
      }

    }
    this.speedup = function(ev) {
      this.properties.speedmultiplier = (ev.value ? 2 : 1);
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
        this.objects['3d'].parent.remove(this.segments[i]);
      }
      this.segments = [];
      this.addSegments(5);
    }

    this.isTouching = function(x, y) {
      for (var i = 1; i < this.segments.length; i++) {
        var segpos = this.segments[i].position;
        if (segpos.x == x && segpos.y == y) {
          return true;
        }
      }
      return false;
    }
    this.isCollidingWithSelf = function() {
      if (this.properties.velocity.lengthSq() < 1e-6) {
        return false;
      }
      var pos = new THREE.Vector3(
        Math.round(this.properties.position.x),
        Math.round(this.properties.position.y),
        Math.round(this.properties.position.z)
      );
      
      for (var i = 1; i < this.segments.length; i++) {
        var segpos = this.segments[i].position;
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
