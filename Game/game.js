/*jslint
    browser:true,
    devel:true
*/
/*global
    Phaser
*/

var market;
var playerShip;
var asteroids;

var cursors;

var game = new Phaser.Game(window.innerWidth - 50, window.innerHeight - 50, Phaser.AUTO, "gameArea", {
    preload: function preload() {
        "use strict";
        game.load.crossOrigin = "anonymous";
        game.load.image("market", "/assets/sprites/market.png");
        game.load.spritesheet("ship32sps", "/assets/sprites/ship32.png", 32, 32);
        game.load.spritesheet("ship64sps", "/assets/sprites/ship64.png", 64, 64);
        game.load.spritesheet("ship128sps", "/assets/sprites/ship128.png", 128, 128);
        game.load.image("asteroid128", "/assets/sprites/asteroid128.png");
        game.load.image("asteroid64", "/assets/sprites/asteroid64.png");
        game.load.image("asteroid32", "/assets/sprites/asteroid32.png");
        game.load.image("asteroid16", "/assets/sprites/asteroid16.png");
        game.load.spritesheet("resource64sps", "/assets/sprites/resource64.png", 64, 64);
        game.load.spritesheet("resource32sps", "/assets/sprites/resource32.png", 32, 32);
        game.load.spritesheet("resource16sps", "/assets/sprites/resource16.png", 16, 16);
        game.load.spritesheet("resource8sps", "/assets/sprites/resource8.png", 8, 8);
    },
    create: function create() {
        "use strict";
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.width = 10000;
        game.world.height = 10000;
        
        market = game.add.sprite(0, 0, "market");
        game.physics.arcade.enable(market);
        market.body.immovable = true;
        
        playerShip = game.add.sprite(400, 0, "ship" + 32 + "sps");
        game.physics.arcade.enable(playerShip);
        playerShip.body.velocity.x = 0;
        playerShip.body.velocity.y = 0;
        playerShip.body.collideWorldBounds = true;
        
        asteroids = game.add.group();
        asteroids.enableBody = true;
        var asteroid, createAsteroid = function createAsteroid(group, x, y, type) {
            var asteroid = group.create(x, y, type);
            asteroid.body.collideWorldBounds = true;
            asteroid.body.velocity.x = (Math.random() * (150 - 10) + 10) - 75;
            asteroid.body.velocity.y = (Math.random() * (150 - 10) + 10) - 75;
        };
        
        createAsteroid(asteroids, 400, 400, 'asteroid128');
        createAsteroid(asteroids, 400, 400, 'asteroid128');
        createAsteroid(asteroids, 400, 400, 'asteroid128');
        createAsteroid(asteroids, 400, 400, 'asteroid128');
        createAsteroid(asteroids, 400, 400, 'asteroid128');
        
        cursors = game.input.keyboard.createCursorKeys();
    },
    update: function update() {
        "use strict";
        game.physics.arcade.collide(playerShip, asteroids);
        game.physics.arcade.collide(asteroids, asteroids);
        game.physics.arcade.collide(market, asteroids);
        
        var playerShipMarketCollision = function playerShipMarketCollision(playerShip, market) {
            playerShip.body.velocity.x = 0;
            playerShip.body.velocity.y = 0;
            
            // TODO: Open market place.
        };
        game.physics.arcade.overlap(playerShip, market, playerShipMarketCollision, null, this);
        
        if (cursors.left.isDown && playerShip.body.velocity.x > -300) {
            playerShip.body.velocity.x -= 10;
        } else if (cursors.right.isDown && playerShip.body.velocity.x < 300) {
            playerShip.body.velocity.x += 10;
        } else if (cursors.up.isDown && playerShip.body.velocity.y > -300) {
            playerShip.body.velocity.y -= 10;
        } else if (cursors.down.isDown && playerShip.body.velocity.y < 300) {
            playerShip.body.velocity.y += 10;
        }
    }
});
