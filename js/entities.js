var enemyType = ['dude','monster', 'sancho'];
var enemyProps = function(type) {
	var x = {
		'dude': {
			health: 10,
			speed: 12,
      score: 2
		},
		'monster': {
			health: 1000,
			speed: 8,
      score: 5
		},
		'sancho' : {
			health: 5000,
			speed: 6,
      score: 10
		}
	};
	return x[type];
};

var towerType = ['tower1', 'tower2', 'tower3'];
var towerProps = function(type) {
	var x = {
		'tower1': {
			speed: 0.035,
			distRange: 2*48,
			angRange: 80,
			power: 1
		},
		'tower2': {
			speed: 0.015,
			distRange: 3*48,
			angRange: 40,
			power: 3
		},
    'tower3': {
      speed: 0.025,
      distRange: 3*48,
      angRange: 60,
      power: 5
    }
	};
	return x[type];
};

function Enemy(x, y, type) {
	var enemy = game.add.sprite(x, y, type, 0);

	//  We need to enable physics on the player
	game.physics.arcade.enable(enemy);

	enemy.enableBody = true;
  enemy.dirty = false;
	enemy.props = enemyProps(type);

	//  Player physics properties.
	//this.enemy.anchor.x = 0.5;
	//this.enemy.anchor.y = 1;
	enemy.body.gravity.y = 0;
	//player.body.collideWorldBounds = true;

	// define basic walking animation
	enemy.animations.add("right", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 30, true);
	enemy.animations.add("down", [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59], 30, true);
	enemy.animations.add("left", [60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89], 30, true);
	enemy.animations.add("up", [90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119], 30, true);

	var state = game.state.getCurrentState();
	findPathTo((x/TILEWIDTH)|0,(y/TILEHEIGHT)|0,state.endTile.x,state.endTile.y, (function(path) {
			this.path = path;
	}).bind(enemy));

	enemy.update = function() {
		//Check the path
    if(this.dirty) this.updatePath();

    if(this.path) {

      var state = = game.state.getCurrentState();

      // Got places to go
      if(this.path.length > 0){

        //Next destination
        if(!this.next) {
          this.next = this.path.shift();
          this.next.x *= TILEWIDTH;
          this.next.y *= TILEHEIGHT;
        }

        var distx = this.next.x - this.body.position.x;
        var disty = this.next.y - this.body.position.y;

        if(Math.abs(distx) < 1 && Math.abs(disty) < 1) {
          this.next = this.path.shift();
          this.next.x *= TILEWIDTH;
          this.next.y *= TILEHEIGHT;
          distx = this.next.x - this.body.position.x;
          disty = this.next.y - this.body.position.y;
        }
        var dist = 0.1 * Math.sqrt((distx*distx) + (disty*disty));
        this.body.velocity.x = this.props.speed * (distx/dist);
        this.body.velocity.y = this.props.speed *(disty/dist);

				var direction = getDirection(this);
				//console.log(direction);
				this.animations.play(direction);

      } else {
        // Reached end?
        if(state.endTile.x == Math.round(this.body.position.x/TILEWIDTH) && state.endTile.y == Math.round(this.body.position.y/TILEHEIGHT)){
          // Stop
          this.body.velocity.x = 0;
          this.body.velocity.y = 0;
          this.destroy();
          lives--;
          state.enemiesLeft -= 1;
        }
      }

			if(this.props.health < 0) {
        state.enemiesLeft -= 1;
				this.destroy();
        score += this.props.score;
			}

    }
	};

	enemy.updatePath = function() {
		this.dirty = false;
		var state = game.state.getCurrentState();
		findPathTo(Math.round((this.body.position.x)/TILEWIDTH),Math.round((this.body.position.y)/TILEHEIGHT),state.endTile.x,state.endTile.y, (function(path) {
				this.path = path;
				this.next = undefined;
		}).bind(this));
	};

	enemy.reduceHealth = function(h) {
		this.props.health -= h;
	};

	return enemy;
}

function createEnemy(x, y, type) {
	var state = game.state.getCurrentState();
	state.enemies.add(Enemy(x, y, enemy_type[type]));
}

function updateGrid(x, y, value) {
	grid[x][y] = value;
}

function Tower(x, y, type) {
	var tower = game.add.sprite(x*TILEWIDTH+TILEWIDTH/2, y*TILEHEIGHT+TILEHEIGHT/2, type, 0);
	console.log(x*TILEWIDTH + ' ' + y*TILEHEIGHT);
	tower.enableBody = true;
	tower.anchor  = {x:0.5, y:0.5};

	//  We need to enable physics on the player
	game.physics.arcade.enable(tower);

	//  Player physics properties.
	//this.player.anchor.x = 0.5;
	//this.player.anchor.y = 1;
	tower.body.gravity.y = 0;
	//player.body.collideWorldBounds = true;
	tower.direction = (-0.5+Math.random())*(2*Math.PI);
	// define basic walking animation
  tower.animations.add("0_idle", [0], 300, false);
	tower.animations.add("0_fire", [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], 30, true);
	tower.animations.add("1_idle", [25], 300, false);
	tower.animations.add("1_fire", [26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], 30, true);
	tower.animations.add("2_idle", [50], 300, false);
	tower.animations.add("2_fire", [51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74], 30, true);
	tower.animations.add("3_idle", [75], 300, false);
	tower.animations.add("3_fire", [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99], 30, true);
	tower.animations.add("4_idle", [100], 300, false);
	tower.animations.add("4_fire", [101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124], 30, true);
	tower.animations.add("5_idle", [125], 300, false);
	tower.animations.add("5_fire", [126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149], 30, true);
	tower.animations.add("6_idle", [150], 300, false);
	tower.animations.add("6_fire", [151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174], 30, true);
	tower.animations.add("7_idle", [175], 300, false);
	tower.animations.add("7_fire", [176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199], 30, true);
	tower.animations.add("8_idle", [200], 300, false);
	tower.animations.add("8_fire", [201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224], 30, true);
	tower.animations.add("9_idle", [225], 300, false);
	tower.animations.add("9_fire", [226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249], 30, true);
	tower.animations.add("10_idle", [250], 300, false);
	tower.animations.add("10_fire", [251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274], 30, true);
	tower.animations.add("11_idle", [275], 300, false);
	tower.animations.add("11_fire", [276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299], 30, true);
	tower.animations.play("0_idle");

	tower.props = towerProps(type);

	tower.line = new Phaser.Line(0,0,0,0);

	tower.line.fromAngle(tower.position.x, tower.position.y, tower.rotation, 50);
	var state = game.state.getCurrentState();
	state.line = tower.line;

	tower.findEnemiesInRange = function(enemies) {
		//linear distance.

		var inrange = enemies.children.some(function(a) {

			this.line.start = this.position;
			this.line.end = a.position;

			var angle = 180 - Math.abs(Math.abs(((180*this.line.angle)/Math.PI) - ((180*this.direction)/Math.PI)) - 180);

			if(this.line.width < this.props.distRange) {
				if(angle < (this.props.angRange/2)) {

					a.reduceHealth(this.props.power);
					return true;
				}
			}
			return false;
		}, this);

		return inrange;
	};

	tower.update = function() {
		this.direction += this.props.speed;
		if(this.direction > Math.PI) this.direction -= 2*Math.PI;

		var angle = ((360 + (180*this.direction/Math.PI)) % 360) - 15;

		var frame = Math.round(angle/30);
		var mode = this.findEnemiesInRange(state.enemies) ? "fire" : "idle";
		this.animations.play(frame+"_"+mode);
	};

	return tower;

}

function createTower(x, y, type) {
	var state = game.state.getCurrentState();
	if(grid[y][x] == -1 && !(x==state.startTile.x && y==state.startTile.y) && !(x==state.endTile.x && y==state.endTile.y)){
		updateGrid(y, x, 15);
		findPathTo(state.startTile.x,state.startTile.y,state.endTile.x,state.endTile.y, function(path) {
			if(path) {
				state.towers.add(Tower(x, y, tower_type[type]));
				state.enemies.forEach(a => {a.dirty = true;});
			} else {
				updateGrid(y, x, -1);
				console.log("UNABLE TO COMPLY, BUILDING IN PROGESS");
			}
		});
	} else {
		console.log("UNABLE TO COMPLY, NOT ENOUGH RESOURCES");
	}
}

function getDirection(sprite) {
	var x = sprite.body.velocity.x;
	var y = sprite.body.velocity.y;
	if(x*x > y*y) {
		return (x>0) ? 'right' : 'left';
	} else {
		return (y>0) ? 'down' : 'up';
	}

}

function createWave(interval, arr) {
	var timer = game.time.create(false);
	timer.arr = arr;
	var state = game.state.getCurrentState();
	timer.loop(interval, function() {
		if(this.arr.length !== 0) createEnemy(state.startTile.x*TILEWIDTH,state.startTile.y*TILEHEIGHT, arr.shift());
		else this.stop();
	}, timer);
	timer.start();
}
