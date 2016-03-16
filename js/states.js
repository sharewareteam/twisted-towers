/* globals Phaser */
/* jshint esversion: 6, browser: true*/
'use strict';

var TT = {
  globals: {
    TILEWIDTH: 48,
    TILEHEIGHT: 48,
    grid: {},
    hud: {},
    lives: 3,
    score: 0,
    pathfinder: {},
    findPathTo: function(startx, starty, endx, endy, callback) {
      this.pathfinder.setGridMatrix(this.grid);
      this.pathfinder.setCallbackFunction(callback);
      this.pathfinder.preparePathCalculation([startx, starty], [endx, endy]);
      this.pathfinder.calculatePath();
    },
  }
};

TT.Boot = function(game) { };

TT.Boot.prototype = {
  preload: function () {

    this.input.maxPointers = 1;
    this.load.image('logo', 'data/images/logo.png');

  },
  create: function() {
    TT.globals.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
    this.stage.backgroundColor = '#CCCCCC';
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.state.start('logo');
  },
};

TT.Logo = function(game) {};

TT.Logo.prototype = {
  preload: function () {
    this.load.spritesheet('dude', 'data/images/skull_360.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);
    this.load.spritesheet('monster', 'data/images/monster.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);
    this.load.spritesheet('sancho', 'data/images/sancho.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);

    this.load.spritesheet('button1', 'data/images/button1.png', 175, 113);
    this.load.spritesheet('tower1', 'data/images/tower1.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);
    this.load.spritesheet('button2', 'data/images/button2.png', 175, 113);
    this.load.spritesheet('tower2', 'data/images/tower2.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);
    this.load.spritesheet('button3', 'data/images/button3.png', 175, 113);
    this.load.spritesheet('tower3', 'data/images/tower3.png', TT.globals.TILEWIDTH, TT.globals.TILEHEIGHT);
  },
  create: function() {
    this.add.sprite(0, 0, 'logo');
    setTimeout(function() {
      this.game.state.start('level1');
    }, 1000);
  },
};

TT.Intro = function(game) {
  this.reveal_text = null;
  this.text = `
  THIS IS THE UNTOLD STORY OF “THE DUDES”

  THIS STORY WAS INSPIRED IN A TRUE EVENT..

  THE DUDES WERE FRICKING AWESOME BACK IN THE DAY... THEY HAD HOT
  CHICKS, UNPROTECTED HARCORE SEX, FAST CARS, MONEY AND POWER..

  UNTIL THEY SANK THEIR FORTUNE IN CASINO GAMES...AND EVENTUALLY
  THEY WERE KIDNAPED BY A LOCAL “BLUE DOG GANG” THE KNOWN PROTECTORS
  OF THIS SPECIFIC CASINO... IN ORDER TO ESCAPE THEIR DOOM, THEY HAD
  NO OTHER CHOICE BUT TO ASK THE LOCAL  PIMP KNOWN AS MISTER VICTORY...
  FOR SOME CASH...

  LITTLE DID THEY KNOW THAT THIS WAS NO ORDENARY PIMP...IT WAS A SICK
  PIMP, THAT CRAZY F***** BELIEVED THAT DEMONS WERE KINDNAPING HIS HOES...

  WHAAAT? YEAH... CRAZY...

  MEANWHILE HE MADE A DEAL WITH THE “DUDES”!
  IN ORDER TO PAY BACK FOR THE BORROWED CASH THEY HAD TO WORK FOR HIM,
  TO PROTECT AND SAVE HIS BELOVED UGLY “HOES” THAT WERE STILL BEING
  ARRASED BY SEX ADDITED DEMONS THAT REFUSED TO PAY.

  IN AN ATTEMPT TO STOP THEM..THEY GATHERED FORCES ONCE MORE..
  TO STOP THOSE PERVY DEAMONS FROM “SCREWING AROUND” FOR GOOD!

  "HOW TWIST IS THAT?"                                                   `;

  TT.globals.score = 0;
  TT.globals.lives = 20;
};

TT.Intro.prototype = {
  preload: function () {
    this.load.bitmapFont('font', 'data/images/font4.png', 'data/images/font4.fnt');
    this.stage.backgroundColor = '#111111';
  },

  create: function() {
    this.reveal_text = new RevealText(this.game, 150, 25, 'font', this.text, 24, 0);
    this.reveal_text.tint = 0xC60000;
  },
};

TT.Level1 = function(game) {
  this.map = null;
  this.enemies = undefined;
  this.towers = undefined;
  this.startTile = {x:2 , y:7};
  this.endTile = {x:24 , y:7};
  this.enemiesLeft = 0;
  this.grid = null;
  this.waves = [{delay: 1000, monsters: [0]},
                {delay:  700, monsters: [0,0,0,0,0]},
                {delay: 1000, monsters: [0,1,0,1,0]},
                {delay: 1000, monsters: [0,0,0,1,1,1]},
                {delay:  700, monsters: [0,0,0,0,1,1,1,1]}];
};

TT.Level1.prototype = {
  preload: function () {
    this.load.tilemap('map', 'data/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('ground', 'data/images/level_1.png');
    this.load.image('grid', 'data/images/grid.png');
    this.load.image('cover', 'data/images/cover.png');
  },

  create: function () {

    this.map = this.add.tilemap('map');

    TT.globals.grid = TT.globals.pathfinder.setGrid(this.map.layers[0].data, [-1]);

    this.map.addTilesetImage('grid', 'grid');
    this.map.createLayer('grid');

    this.add.sprite(0, 0, 'ground');
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.add.sprite(0, 0, 'cover');

    TT.globals.hud = new HUDLayer(this.game);
  },

  render: function() {
    this.game.debug.text(TT.globals.lives, 884, 43);
    this.game.debug.text(TT.globals.score, 544, 43);
  },

  update: function () {
    if(TT.globals.lives <= 0) {
      setTimeout(function() {
        this.game.state.start('gameover');
      }, 1000);
    }
    if(this.enemiesLeft === 0){
      if(this.waves.length){
        var wave = this.waves.shift();
        createWave(wave.delay, wave.monsters);
        this.enemiesLeft = wave.monsters.length;
      } else {
        this.game.state.start('level2');
      }
    }
  }
};

TT.Level2 = function(game) {
  this.map = null;
  this.enemies = undefined;
  this.towers = undefined;
  this.startTile = {x:2 , y:7};
  this.endTile = {x:24 , y:7};
  this.enemiesLeft = 0;
  this.grid = null;
  this.waves = [
    {delay: 1000, monsters: [0,0,0,0,0,0,0,0,0,0]},
    {delay: 700, monsters: [0,0,0,0,0,1,1,1,1,2,2]},
    {delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]},
    {delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]},
    {delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,1,1,0,0,0,0,0,0,0]}
  ];
};

TT.Level2.prototype = {
  preload: function () {
    this.load.tilemap('map', 'data/maps/map2.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('ground', 'data/images/level_2.png');
    this.load.image('grid', 'data/images/grid.png');
    this.load.image('cover', 'data/images/cover.png');
  },

  create: function () {

    this.map = this.add.tilemap('map');

    TT.globals.grid = TT.globals.pathfinder.setGrid(this.map.layers[0].data, [-1]);

    this.map.addTilesetImage('grid', 'grid');
    this.map.createLayer('grid');

    this.add.sprite(0, 0, 'ground');
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.add.sprite(0, 0, 'cover');

    TT.globals.hud = new HUDLayer();
  },

  render: function() {
    this.game.debug.text(TT.globals.lives, 884, 43);
    this.game.debug.text(TT.globals.score, 544, 43);
  },

  update: function () {
    if(TT.globals.lives <= 0) {
      setTimeout(function() {
        this.game.state.start('gameover');
      }, 1000);
    }
    if(this.enemiesLeft === 0){
      if(this.waves.length){
        var wave = this.waves.shift();
        createWave(wave.delay, wave.monsters);
        this.enemiesLeft = wave.monsters.length;
      } else {
        this.game.state.start('level3');
      }
    }
  }
};

TT.Level3 = function(game) {
  this.map = null;
  this.enemies = undefined;
  this.towers = undefined;
  this.startTile = {x:2 , y:7};
  this.endTile = {x:24 , y:7};
  this.enemiesLeft = 0;
  this.grid = null;
  this.waves = [
    {delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]},
    {delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]},
    {delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]},
    {delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]},
    {delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]}
  ];
};

TT.Level3.prototype = {
  preload: function () {
    this.load.tilemap('map', 'data/maps/map3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('ground', 'data/images/level_3.png');
    this.load.image('grid', 'data/images/grid.png');
    this.load.image('cover', 'data/images/cover.png');
  },

  create: function () {

    this.map = this.add.tilemap('map');

    TT.globals.grid = TT.globals.pathfinder.setGrid(this.map.layers[0].data, [-1]);

    this.map.addTilesetImage('grid', 'grid');
    this.map.createLayer('grid');

    this.add.sprite(0, 0, 'ground');
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.add.sprite(0, 0, 'cover');

    TT.globals.hud = new HUDLayer();
  },

  render: function() {
    this.game.debug.text(TT.globals.lives, 884, 43);
    this.game.debug.text(TT.globals.score, 544, 43);
  },

  update: function () {
    if(TT.globals.lives <= 0) {
      setTimeout(function() {
        this.game.state.start('gameover');
      }, 1000);
    }
    if(this.enemiesLeft === 0){
      if(this.waves.length){
        var wave = this.waves.shift();
        createWave(wave.delay, wave.monsters);
        this.enemiesLeft = wave.monsters.length;
      } else {
        this.game.state.start('level4');
      }
    }
  }
};

TT.Level4 = function(game) {
  this.map = null;
  this.enemies = undefined;
  this.towers = undefined;
  this.startTile = {x:2 , y:7};
  this.endTile = {x:24 , y:7};
  this.enemiesLeft = 0;
  this.grid = null;
  this.waves = [
    {delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]},
    {delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]},
    {delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]},
    {delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]},
    {delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]}
  ];
};

TT.Level4.prototype = {
  preload: function () {
    this.load.tilemap('map', 'data/maps/map4.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('ground', 'data/images/level_4.png');
    this.load.image('grid', 'data/images/grid.png');
    this.load.image('cover', 'data/images/cover.png');
  },

  create: function () {

    this.map = this.add.tilemap('map');

    TT.globals.grid = TT.globals.pathfinder.setGrid(this.map.layers[0].data, [-1]);

    this.map.addTilesetImage('grid', 'grid');
    this.map.createLayer('grid');

    this.add.sprite(0, 0, 'ground');
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.add.sprite(0, 0, 'cover');

    TT.globals.hud = new HUDLayer();
  },

  render: function() {
    this.game.debug.text(TT.globals.lives, 884, 43);
    this.game.debug.text(TT.globals.score, 544, 43);
  },

  update: function () {
    if(TT.globals.lives <= 0) {
      setTimeout(function() {
        this.game.state.start('gameover');
      }, 1000);
    }
    if(this.enemiesLeft === 0){
      if(this.waves.length){
        var wave = this.waves.shift();
        createWave(wave.delay, wave.monsters);
        this.enemiesLeft = wave.monsters.length;
      } else {
        this.game.state.start('level5');
      }
    }
  }
};

TT.Level5 = function(game) {
  this.map = null;
  this.enemies = undefined;
  this.towers = undefined;
  this.startTile = {x:2 , y:7};
  this.endTile = {x:24 , y:7};
  this.enemiesLeft = 0;
  this.grid = null;
  this.waves = [
    {delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]},
    {delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]},
    {delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]},
    {delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]},
    {delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]}
  ];
};

TT.Level5.prototype = {
  preload: function () {
    this.load.tilemap('map', 'data/maps/map5.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('ground', 'data/images/level_5.png');
    this.load.image('grid', 'data/images/grid.png');
    this.load.image('cover', 'data/images/cover.png');
  },

  create: function () {

    this.map = this.add.tilemap('map');

    TT.globals.grid = TT.globals.pathfinder.setGrid(this.map.layers[0].data, [-1]);

    this.map.addTilesetImage('grid', 'grid');
    this.map.createLayer('grid');

    this.add.sprite(0, 0, 'ground');
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.add.sprite(0, 0, 'cover');

    TT.globals.hud = new HUDLayer();
  },

  render: function() {
    this.game.debug.text(TT.globals.lives, 884, 43);
    this.game.debug.text(TT.globals.score, 544, 43);
  },

  update: function () {
    if(TT.globals.lives <= 0) {
      setTimeout(function() {
        this.game.state.start('gameover');
      }, 1000);
    }
    if(this.enemiesLeft === 0){
      if(this.waves.length){
        var wave = this.waves.shift();
        createWave(wave.delay, wave.monsters);
        this.enemiesLeft = wave.monsters.length;
      } else {
        this.game.state.start('level3');
      }
    }
  }
};

TT.Gameover = function(game) { };

TT.Gameover.prototype = {
  preload: function () {
    this.load.image('gameover', 'data/images/gameover.png');
  },

  create: function() {
    this.add.sprite(0, 0, 'gameover');
    setTimeout(function() {
      this.game.state.start('intro');
    }, 5000);
  },
};

TT.Winner = function(game) { };

TT.Winner.prototype = {
  preload: function () {
    this.load.image('winner', 'data/images/winner.png');
  },

  create: function() {
    this.add.sprite(0, 0, 'winner');
    setTimeout(function() {
      this.game.state.start('intro');
    }, 5000);
  },
};

class RevealText extends Phaser.BitmapText {
  constructor(game, x, y, font, text, size, delay, align) {
    super(game, x, y, font, '', size, align);
    this.allText = text;
    this.delay = delay;
    this.currentDelay = 0;
    this.currentChar = 0;
    game.add.existing(this);
  }

  update() {
    if(this.currentDelay == this.delay) {
      this.currentDelay = 0;
      this.currentChar += 1;

      this.text = this.allText.slice(0, this.currentChar);
      if(this.currentChar == this.allText.length) {
        this.onfinish();
      }
    } else {
      this.currentDelay += 1;
    }
  }

  onfinish() {
    this.update = function() {};
    this.game.state.start('level1');
  }
}

function HUDLayer(game) {
  var hud = game.add.group();
  hud.activeBtn = null;

  hud.create(game.width/2 - 175 - 30 - 83, game.height - 110, 'button1');
  hud.create(game.width/2 - 83, game.height - 110, 'button2');
  hud.create(game.width/2 + 30 + 83, game.height - 110, 'button3');
  hud.forEach(function(btn){ btn.inputEnabled = true; });

  hud.update = function(){
  	let hudClicked = false;
    hud.forEach(function(btn){
      if(btn.input.pointerDown()){
      	hudClicked = true;
        hud.activeBtn = hud.getIndex(btn);
      }
    });
    if(!hudClicked){
    	if(hud.activeBtn !== null && game.input.activePointer.leftButton.isDown){
	    	var posx = Math.round((game.input.activePointer.position.x-TT.globals.TILEWIDTH/2)/TT.globals.TILEWIDTH);
        var posy = Math.round((game.input.activePointer.position.y-TT.globals.TILEHEIGHT/2)/TT.globals.TILEHEIGHT);
	    	createTower(posx, posy, hud.activeBtn);
	    }
    }
  };
  return hud;
}
