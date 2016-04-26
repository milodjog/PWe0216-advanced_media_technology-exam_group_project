/*jslint
    browser:true,
    devel:true
*/
/*global
    Phaser
*/

var market;

var player = {
    ship: undefined
};

var asteroids;
var asteroid;
var createAsteroid = function createAsteroid(group, x, y, size) {
    var asteroid = group.create(x, y, "asteroid" + size);
    asteroid.body.collideWorldBounds = true;
    asteroid.body.velocity.x = (Math.random() * (150 - 10) + 10) - 75;
    asteroid.body.velocity.y = (Math.random() * (150 - 10) + 10) - 75;
    asteroid.size = size;
    asteroid.hp = 1 + Math.floor(0.25 * size); // TODO: Find better value.
};

var cursors;

var shoot;
var bulletGroup;
var bulletProperties = {
    speed: 400,
    interval: 250,
    lifeSpan: 2000,
    maxCount: 30
};
var shotsInterval = 0;

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
        
        game.load.image("bullet","/assets/sprites/bullet.png");
    },
    create: function create() {
        "use strict";
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.world.width = 10000;
        game.world.height = 10000;
        
        market = game.add.sprite(0, 0, "market");
        game.physics.arcade.enable(market);
        market.body.immovable = true;
        
        player.ship = game.add.sprite(400, 0, "ship" + 32 + "sps");
        game.physics.arcade.enable(player.ship);
        player.ship.anchor.set(0.5, 0.5);
        player.ship.body.drag.set(0);
        player.ship.body.maxVelocity.set(300);
        player.ship.body.velocity.x = 0;
        player.ship.body.velocity.y = 0;
        player.ship.body.angularVelocity = 0;
        player.ship.body.collideWorldBounds = true;
        player.ship.hp = 1;
        player.ship.weapon = {
            damagePerShot: 1
        };
        
        asteroids = game.add.group();
        asteroids.enableBody = true;
        
        createAsteroid(asteroids, (window.innerWidth - 50) / 2, (window.innerHeight - 50) / 2, 128);
        createAsteroid(asteroids, (window.innerWidth - 50) / 2, (window.innerHeight - 50) / 2, 128);
        createAsteroid(asteroids, (window.innerWidth - 50) / 2, (window.innerHeight - 50) / 2, 128);
        createAsteroid(asteroids, (window.innerWidth - 50) / 2, (window.innerHeight - 50) / 2, 128);
        createAsteroid(asteroids, (window.innerWidth - 50) / 2, (window.innerHeight - 50) / 2, 128);
        
        bulletGroup = game.add.group();
        bulletGroup.enableBody = true;
        bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
        bulletGroup.createMultiple(bulletProperties.maxCount,"bullet");
        bulletGroup.setAll('anchor.x',0.5);
        bulletGroup.setAll('anchor.y',0.5);
        bulletGroup.setAll('lifespan',bulletProperties.lifeSpan);
        
        cursors = game.input.keyboard.createCursorKeys();
        shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    update: function update() {
        "use strict";
        
        var playerShipAsteroidCollision = function playerShipAsteroidCollision(asteroid, ship) {
            player.ship.hp -= 1;
            if (player.ship.hp <= 0) {
                location.reload();
            }
        };
        game.physics.arcade.collide(asteroids, player.ship, playerShipAsteroidCollision, null, this);

        var asteroidAsteroidCollision = function asteroidAsteroidCollision(asteroid1, asteroid2) {
            // TODO: If sensible, refactor relevant parts of bulletGroupAsteroidCollision out into a function that can also be used here.
        };
        game.physics.arcade.collide(asteroids, asteroids, asteroidAsteroidCollision, null, this);
        
        game.physics.arcade.collide(market, asteroids);
        
        var bulletGroupAsteroidCollision = function bulletGroupAsteroidCollision(bullet, asteroid) {
            bullet.kill();
            asteroid.hp -= player.ship.weapon.damagePerShot;
            if (asteroid.hp <= 0) {
                if (asteroid.size > 16) {
                    createAsteroid(asteroids, asteroid.x, asteroid.y, asteroid.size / 2); // TODO: Sometimes create resouce instead.
                    createAsteroid(asteroids, asteroid.x, asteroid.y, asteroid.size / 2); // TODO: Sometimes create resouce instead.
                    // TODO: Sometimes create a resource of the smallest size too.
                }
                asteroid.kill();
            }
        };
        game.physics.arcade.overlap(bulletGroup, asteroids, bulletGroupAsteroidCollision, null, this);
        
        var bulletMarketCollision = function bulletMarketCollision(market, bullet) {
            bullet.kill();
        };
        game.physics.arcade.collide(market, bulletGroup, bulletMarketCollision, null, this);
        
        var playerShipMarketCollision = function playerShipMarketCollision(ship, market) {
            ship.body.velocity.x = 0;
            ship.body.velocity.y = 0;
            
            // TODO: Disable ship damage.
            this.openMarketPlace();
            // TODO: Enable ship damage.
        };
        game.physics.arcade.collide(player.ship, market, playerShipMarketCollision, null, this);
        
        if (cursors.left.isDown) {
            player.ship.body.angularVelocity = -100;
        } else if (cursors.right.isDown) {
            player.ship.body.angularVelocity = 100;
        } else if (cursors.up.isDown) {
            game.physics.arcade.accelerationFromRotation(player.ship.rotation, 150, player.ship.body.acceleration);
        } else {
            player.ship.body.angularVelocity = 0;
            player.ship.body.acceleration.set(0);
        }
        
        if (shoot.isDown){
            this.fire();
        }
    },
    openMarketPlace: function () {
        // TODO: Marketplace dialog.
    },
    fire: function () {
       if (game.time.now > shotsInterval){ 
           var bullet = bulletGroup.getFirstExists(false);
           
           if (bullet) {
               var length = player.ship.width * 0.5;
               var x = player.ship.x + (Math.cos(player.ship.rotation) * length);
               var y = player.ship.y + (Math.sin(player.ship.rotation) * length);
               
               bullet.reset(x, y);
               bullet.lifespan = bulletProperties.lifeSpan;
               bullet.rotation = player.ship.rotation;
               
               game.physics.arcade.velocityFromRotation(player.ship.rotation, bulletProperties.speed, bullet.body.velocity);
               
               this.shotsInterval = game.time.now + bulletProperties.interval;
           }
       }  
    }
});
