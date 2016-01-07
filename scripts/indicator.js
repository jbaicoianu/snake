elation.require(['engine.things.label'], function() {
  elation.require('snake.fonts.FontAwesome_Regular');
  elation.component.add('engine.things.snake_indicator', function() {
    this.icons = {
      'gamepad': '',
      'music': '',
      'sort-amount-asc': '',
      'user': '',
      'users': '',
    };
    this.postinit = function() {
      elation.engine.things.snake_indicator.extendclass.postinit.call(this);
      this.defineProperties({
        property: { type: 'function' },
        icon: { type: 'string' },
        label: { type: 'string' },
        description: { type: 'string' },
        values: { type: 'object' },
        value: { type: 'object' },
        activecolor: { type: 'color', default: 0x00dd00 },
        inactivecolor: { type: 'color', default: 0x999999 },
      });
      this.state = true;
      this.value = this.properties.value;
      if (this.properties.property) {
        this.state = this.properties.property();
      }
      this.hoverstate = false;
      elation.events.add(this, 'click', elation.bind(this, this.toggle));
      elation.events.add(this, 'mouseover', elation.bind(this, this.sethover, true));
      elation.events.add(this, 'mouseout', elation.bind(this, this.sethover, false));

      setInterval(elation.bind(this, this.updatestate), 1000);
    }
    this.updatestate = function() {
      if (this.properties.property) {
        var newstate = this.properties.property();
        if (newstate != this.state) {
          this.state = newstate;
          this.icon.material.color.setHex(this.getColor());
          this.refresh();
        }
      }
    }
    this.createObject3D = function() {
      return new THREE.Object3D();
    }
/*
      var geo = this.createTextGeometry(this.mappings[this.properties.icon]);
      var color = this.getColor();
      var mat = new THREE.MeshPhongMaterial({color: color});
      this.material = mat;
      return new THREE.Mesh(geo, mat);
*/
    this.createChildren = function() {
      this.icon = this.spawn('label', this.id + '_icon', { 
        text: this.icons[this.properties.icon],
        size: 2.5,
        thickness: 0.5,
        color: 0x33dd33,
        font: 'FontAwesome',
        align: 'left',
        verticalalign: 'top',
        collidable: false
      });
      this.label = this.spawn('label', this.id + '_label', { 
        text: this.properties.label,
        size: 1.2,
        thickness: 0.5,
        color: 0xdddddd,
        font: 'Graph 35+ pix',
        align: 'left',
        verticalalign: 'top',
        position: [5,0,0],
        collidable: false
      });

      var desc = this.getDescription();

      this.description = this.spawn('label', this.id + '_description', { 
        text: desc,
        size: .75,
        thickness: 0.5,
        color: 0xdddddd,
        font: 'Graph 35+ pix',
        align: 'left',
        verticalalign: 'top',
        position: [5,-2,0],
        collidable: false
      });
      var min = new THREE.Vector3(Infinity, Infinity, Infinity),
          max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      
      var parts = [this.icon, this.label, this.description];
      parts.forEach(function(part) {
        var obj = part.objects['3d'];
        var bbox = obj.geometry.boundingBox;
        ['x','y','z'].forEach(function(axis) {
          if (bbox.min[axis] + obj.position[axis] < min[axis]) min[axis] = bbox.min[axis] + obj.position[axis];
          if (bbox.max[axis] + obj.position[axis] > max[axis]) max[axis] = bbox.max[axis] + obj.position[axis];
        });
      });
      var diff = new THREE.Vector3().subVectors(max, min);
      var offset = new THREE.Vector3().addVectors(max, min);
      console.log(diff.toArray(), offset.toArray());
      var geometry = new THREE.BoxGeometry(diff.x, diff.y, diff.z);
      geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offset.x/2, offset.y/2, offset.z/2));
      this.updateColliderFromGeometry(geometry);
    }
    this.getDescription = function() {
      var values = Object.keys(this.properties.values);
      var value = this.value;
      if (value === undefined || this.properties.values[value] === undefined) {
        value = values[0];
        this.value = values[0];
      }
      return this.properties.values[value];
    }
    this.toggle = function() {
      //this.state = !this.state;

      var values = Object.keys(this.properties.values);
      var value = this.value;
      var idx = values.indexOf(value.toString()) + 1;
console.log(value, values, idx);
      if (idx >= values.length) {
        idx = 0;
      }
      this.value = values[idx];
      this.description.setText(this.properties.values[this.value]);

      this.icon.material.color.setHex(this.getColor());
      this.refresh();
      elation.events.fire({type: 'change', element: this, data: this.value});
    }
    this.sethover = function(state) {
      this.hoverstate = state;
      this.icon.material.color.setHex(this.getColor());
      this.refresh();
      var view = this.engine.systems.render.views.main;
      if (this.hoverstate) {
        view.addclass('state_cursor');
      } else {
        view.removeclass('state_cursor');
      }
    }
    this.getColor = function() {
      var color = Math.round((this.hoverstate ? 0x222222 : 0) + (this.state ? this.properties.activecolor : this.properties.inactivecolor));
      return color;
    }
  }, elation.engine.things.generic);
});
