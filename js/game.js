/* globals Phaser */
/* jshint esversion: 6, browser: true*/
'use strict';

var TT = TT || {};

var game = new Phaser.Game(1280, 720, Phaser.AUTO, '');

game.state.add('boot', TT.Boot);
game.state.add('logo', TT.Logo);
game.state.add('intro', TT.Intro);
game.state.add('level1', TT.Level1);
game.state.add('level2', TT.Level2);
game.state.add('level3', TT.Level3);
game.state.add('level4', TT.Level4);
game.state.add('level5', TT.Level5);
game.state.add('gameover', TT.Gameover);
game.state.add('winner', TT.Winner);
game.state.start('boot');
