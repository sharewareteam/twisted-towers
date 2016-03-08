'use strict';

function boot() {
  return {
    preload: function () {
      game.load.spritesheet('dude', 'data/images/skull_360.png', TILEWIDTH, TILEHEIGHT);
      game.load.spritesheet('monster', 'data/images/monster.png', TILEWIDTH, TILEHEIGHT);
      game.load.spritesheet('sancho', 'data/images/sancho.png', TILEWIDTH, TILEHEIGHT);

      game.load.spritesheet('button1', 'data/images/button1.png', 175, 113);
      game.load.spritesheet('tower1', 'data/images/tower1.png', TILEWIDTH, TILEHEIGHT);
      game.load.spritesheet('button2', 'data/images/button2.png', 175, 113);
      game.load.spritesheet('tower2', 'data/images/tower2.png', TILEWIDTH, TILEHEIGHT);
      game.load.spritesheet('button3', 'data/images/button3.png', 175, 113);
      game.load.spritesheet('tower3', 'data/images/tower3.png', TILEWIDTH, TILEHEIGHT);
    },
    create: function() {
      pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
      game.stage.backgroundColor = '#CCCCCC';
      game.physics.startSystem(Phaser.Physics.ARCADE);
      setTimeout(function() {game.state.start('logo');}, 1000);
    },
  };
}

var x;

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
    console.log("the end!");
    this.update = function() {};
    game.state.start('level1');
  }
}

function logo() {
  return {
    preload: function () {
      game.load.image('logo', 'data/images/logo.png');
    },

    create: function() {
      game.add.sprite(0, 0, 'logo');
      setTimeout(function() {
        game.state.start('intro');
      }, 5000);
    },
  };
}

function intro() {
  return {
    preload: function () {
      score = 0;
      lives = 20;
      game.load.bitmapFont('font', 'data/images/font4.png', 'data/images/font4.fnt');
    },

    create: function() {
      game.stage.backgroundColor = '#111111';

      var text = `
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
      x = new RevealText(game, 150, 25, 'font', text, 24, 5);
      x.tint = 0xC60000;
    },
    update: function() {
      x.update();
    }
  };
}

function level1() {
  return {
    map: {},
    enemies: undefined,
    towers: undefined,
    startTile: {x:2 , y:7},
    endTile: {x:24 , y:7},
    enemiesLeft: 0,
    waves: [
      {
        delay: 1000, monsters: [2,0,0,0,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,0]
      },
      {
        delay: 1000, monsters: [0,1,0,1,0]
      },
      {
        delay: 1000, monsters: [0,0,0,1,1,1]
      },
      {
        delay: 700, monsters: [0,0,0,0,1,1,1,1]
      }
    ],
    preload: function () {
      game.load.tilemap('map1', 'data/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('ground', 'data/images/level_1.png');
      game.load.image('grid', 'data/images/grid.png');
      game.load.image('cover', 'data/images/cover.png');
    },

    create: function () {

      //game.stage.backgroundColor = '#787878';
      //  The 'map' key here is the Loader key given in game.load.tilemap
      this.map = game.add.tilemap('map1');

      grid = pathfinder.setGrid(this.map.layers[0].data, [-1]);

      //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
      //  The second parameter maps this name to the Phaser.Cache key 'tiles'
      this.map.addTilesetImage('grid', 'grid');

      //  Creates a layer from the World1 layer in the map data.
      //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
      game.add.sprite(0, 0, 'ground');
      this.map.createLayer('grid');

      this.enemies = game.add.group();
      this.towers = game.add.group();

      //This resizes the game world to match the layer dimensions
      //layer.resizeWorld();

      game.add.sprite(0, 0, 'cover');

      hud = new HUDLayer();
    },

    render: function(){
      //game.debug.text(this.enemies.length, 30,30 );
      //game.debug.text("Mouse y: " + game.input.activePointer.position.y, 300, 112);
      //game.debug.text("Left Button: " + game.input.activePointer.leftButton.isDown, 300, 132);
      game.debug.text(lives, 884, 43);
      game.debug.text(score, 544, 43);
    },

    update: function () {
      if(lives<=0) setTimeout(function() {game.state.start('gameover');}, 1000);
      if(this.enemiesLeft === 0){
        if(this.waves.length){
          var wave = this.waves.shift();
          createWave(wave.delay, wave.monsters);
          this.enemiesLeft = wave.monsters.length;
        }else{
          game.state.start('level2');
        }
      }
    }
  };
}

function level2() {
  return {
    map: {},
    enemies: undefined,
    towers: undefined,
    startTile: {x:2 , y:7},
    endTile: {x:24 , y:7},
    enemiesLeft: 0,
    waves: [
      {
        delay: 1000, monsters: [0,0,0,0,0,0,0,0,0,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,0,1,1,1,1,2,2]
      },
      {
        delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]
      },
      {
        delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,1,1,0,0,0,0,0,0,0]
      }
    ],
    preload: function () {
      game.load.tilemap('map1', 'data/maps/map2.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('ground', 'data/images/level_2.png');
      game.load.image('grid', 'data/images/grid.png');
      game.load.image('cover', 'data/images/cover.png');
    },

    create: function () {

      //game.stage.backgroundColor = '#787878';
      //  The 'map' key here is the Loader key given in game.load.tilemap
      this.map = game.add.tilemap('map1');

      grid = pathfinder.setGrid(this.map.layers[0].data, [-1]);

      //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
      //  The second parameter maps this name to the Phaser.Cache key 'tiles'
      this.map.addTilesetImage('grid', 'grid');

      //  Creates a layer from the World1 layer in the map data.
      //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
      game.add.sprite(0, 0, 'ground');
      this.map.createLayer('grid');

      this.enemies = game.add.group();
      this.towers = game.add.group();

      //This resizes the game world to match the layer dimensions
      //layer.resizeWorld();

      game.add.sprite(0, 0, 'cover');

      hud = new HUDLayer();
    },

    render: function(){
      //game.debug.text(this.enemies.length, 30,30 );
      //game.debug.text("Mouse y: " + game.input.activePointer.position.y, 300, 112);
      //game.debug.text("Left Button: " + game.input.activePointer.leftButton.isDown, 300, 132);
      game.debug.text(lives, 884, 43);
      game.debug.text(score, 544, 43);
    },

    update: function () {
      if(lives<=0) setTimeout(function() {game.state.start('gameover');}, 1000);
      if(this.enemiesLeft === 0){
        if(this.waves.length){
          var wave = this.waves.shift();
          createWave(wave.delay, wave.monsters);
          this.enemiesLeft = wave.monsters.length;
        }else{
          game.state.start('level3');
        }
      }
    }
  };
}

function level3() {
  return {
    map: {},
    enemies: undefined,
    towers: undefined,
    startTile: {x:2 , y:7},
    endTile: {x:24 , y:7},
    enemiesLeft: 0,
    waves: [
      {
        delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]
      },
      {
        delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]
      },
      {
        delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]
      },
      {
        delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]
      }
    ],
    preload: function () {
      game.load.tilemap('map1', 'data/maps/map3.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('ground', 'data/images/level_3.png');
      game.load.image('grid', 'data/images/grid.png');
      game.load.image('cover', 'data/images/cover.png');
    },

    create: function () {

      //game.stage.backgroundColor = '#787878';
      //  The 'map' key here is the Loader key given in game.load.tilemap
      this.map = game.add.tilemap('map1');

      grid = pathfinder.setGrid(this.map.layers[0].data, [-1]);

      //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
      //  The second parameter maps this name to the Phaser.Cache key 'tiles'
      this.map.addTilesetImage('grid', 'grid');

      //  Creates a layer from the World1 layer in the map data.
      //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
      game.add.sprite(0, 0, 'ground');
      this.map.createLayer('grid');

      this.enemies = game.add.group();
      this.towers = game.add.group();

      //This resizes the game world to match the layer dimensions
      //layer.resizeWorld();

      game.add.sprite(0, 0, 'cover');

      hud = new HUDLayer();
    },

    render: function(){
      //game.debug.text(this.enemies.length, 30,30 );
      //game.debug.text("Mouse y: " + game.input.activePointer.position.y, 300, 112);
      //game.debug.text("Left Button: " + game.input.activePointer.leftButton.isDown, 300, 132);
      game.debug.text(lives, 884, 43);
      game.debug.text(score, 544, 43);
    },

    update: function () {
      if(lives<=0) setTimeout(function() {game.state.start('gameover');}, 1000);
      if(this.enemiesLeft === 0){
        if(this.waves.length){
          var wave = this.waves.shift();
          createWave(wave.delay, wave.monsters);
          this.enemiesLeft = wave.monsters.length;
        }else{
          game.state.start('level4');
        }
      }
    }
  };
}

function level4() {
  return {
    map: {},
    enemies: undefined,
    towers: undefined,
    startTile: {x:2 , y:7},
    endTile: {x:24 , y:7},
    enemiesLeft: 0,
    waves: [
      {
        delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]
      },
      {
        delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]
      },
      {
        delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]
      },
      {
        delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]
      }
    ],
    preload: function () {
      game.load.tilemap('map1', 'data/maps/map4.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('ground', 'data/images/level_4.png');
      game.load.image('grid', 'data/images/grid.png');
      game.load.image('cover', 'data/images/cover.png');
    },

    create: function () {

      //game.stage.backgroundColor = '#787878';
      //  The 'map' key here is the Loader key given in game.load.tilemap
      this.map = game.add.tilemap('map1');

      grid = pathfinder.setGrid(this.map.layers[0].data, [-1]);

      //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
      //  The second parameter maps this name to the Phaser.Cache key 'tiles'
      this.map.addTilesetImage('grid', 'grid');

      //  Creates a layer from the World1 layer in the map data.
      //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
      game.add.sprite(0, 0, 'ground');
      this.map.createLayer('grid');

      this.enemies = game.add.group();
      this.towers = game.add.group();

      //This resizes the game world to match the layer dimensions
      //layer.resizeWorld();

      game.add.sprite(0, 0, 'cover');

      hud = new HUDLayer();
    },

    render: function(){
      //game.debug.text(this.enemies.length, 30,30 );
      //game.debug.text("Mouse y: " + game.input.activePointer.position.y, 300, 112);
      //game.debug.text("Left Button: " + game.input.activePointer.leftButton.isDown, 300, 132);
      game.debug.text(lives, 884, 43);
      game.debug.text(score, 544, 43);
    },

    update: function () {
      if(lives<=0) setTimeout(function() {game.state.start('gameover');}, 1000);
      if(this.enemiesLeft === 0){
        if(this.waves.length){
          var wave = this.waves.shift();
          createWave(wave.delay, wave.monsters);
          this.enemiesLeft = wave.monsters.length;
        }else{
          game.state.start('level5');
        }
      }
    }
  };
}

function level5() {
  return {
    map: {},
    enemies: undefined,
    towers: undefined,
    startTile: {x:2 , y:7},
    endTile: {x:24 , y:7},
    enemiesLeft: 0,
    waves: [
      {
        delay: 1000, monsters: [0,0,0,0,0,1,1,1,1,1]
      },
      {
        delay: 700, monsters: [0,0,0,1,1,2,2,1,1,1,1,2,2]
      },
      {
        delay: 1000, monsters: [0,1,0,1,0,0,1,1,1,2,2,2,0,0,0,0]
      },
      {
        delay: 1000, monsters: [0,0,0,1,1,1,2,2,2,2,1,0,1,0,1,0]
      },
      {
        delay: 700, monsters: [0,0,0,0,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0]
      }
    ],
    preload: function () {
      game.load.tilemap('map1', 'data/maps/map5.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('ground', 'data/images/level_5.png');
      game.load.image('grid', 'data/images/grid.png');
      game.load.image('cover', 'data/images/cover.png');
    },

    create: function () {

      //game.stage.backgroundColor = '#787878';
      //  The 'map' key here is the Loader key given in game.load.tilemap
      this.map = game.add.tilemap('map1');

      grid = pathfinder.setGrid(this.map.layers[0].data, [-1]);

      //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
      //  The second parameter maps this name to the Phaser.Cache key 'tiles'
      this.map.addTilesetImage('grid', 'grid');

      //  Creates a layer from the World1 layer in the map data.
      //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
      game.add.sprite(0, 0, 'ground');
      this.map.createLayer('grid');

      this.enemies = game.add.group();
      this.towers = game.add.group();

      //This resizes the game world to match the layer dimensions
      //layer.resizeWorld();

      game.add.sprite(0, 0, 'cover');

      hud = new HUDLayer();
    },

    render: function(){
      //game.debug.text(this.enemies.length, 30,30 );
      //game.debug.text("Mouse y: " + game.input.activePointer.position.y, 300, 112);
      //game.debug.text("Left Button: " + game.input.activePointer.leftButton.isDown, 300, 132);
      game.debug.text(lives, 884, 43);
      game.debug.text(score, 544, 43);
    },

    update: function () {
      if(lives<=0) setTimeout(function() {game.state.start('gameover');}, 1000);
      if(this.enemiesLeft === 0){
        if(this.waves.length){
          var wave = this.waves.shift();
          createWave(wave.delay, wave.monsters);
          this.enemiesLeft = wave.monsters.length;
        }else{
          game.state.start('winner');
        }
      }
    }
  };
}

function gameover() {
  return {
    preload: function () {
      game.load.image('gameover', 'data/images/gameover.png');
    },

    create: function() {
      game.add.sprite(0, 0, 'gameover');
      setTimeout(function() {
        game.state.start('intro');
      }, 5000);
    },
  };
}

function winner() {
  return {
    preload: function () {
      game.load.image('winner', 'data/images/winner.png');
    },

    create: function() {
      game.add.sprite(0, 0, 'winner');
      setTimeout(function() {
        game.state.start('intro');
      }, 5000);
    },
  };
}

game.state.add('boot', boot());
game.state.add('logo', logo());
game.state.add('intro', intro());
game.state.add('level1', level1());
game.state.add('level2', level2());
game.state.add('level3', level3());
game.state.add('level4', level4());
game.state.add('level5', level5());
game.state.add('gameover', gameover());
game.state.add('winner', winner());
game.state.start('boot');
