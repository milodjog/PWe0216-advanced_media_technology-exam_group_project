var market;

var player = {
    ship: undefined
};

var asteroids;
var createAsteroid = function (group, x, y, size) {
    "use strict";
    
    var asteroid = group.create(x, y, "asteroid" + size);
    asteroid.body.collideWorldBounds = true;
    asteroid.body.velocity.x = ((Math.random() * (150 - 10)) + 10) - 75;
    asteroid.body.velocity.y = ((Math.random() * (150 - 10)) + 10) - 75;
    asteroid.size = size;
    asteroid.hp = 1 + Math.floor(0.25 * size); // TODO: Find better value.
};

var resources;
var createResource = function (group, x, y, size, resourceType) {
    "use strict";
    
    if (typeof(resourceType === "undefined")) {
        resourceType = Math.floor((Math.random() * 7) + 1);
    }
    var resource = group.create(x, y, "resource" + size + "sps");
    resource.body.collideWorldBounds = true;
    resource.body.velocity.x = ((Math.random() * (150 - 10)) + 10) - 75;
    resource.body.velocity.y = ((Math.random() * (150 - 10)) + 10) - 75;
    resource.size = size;
    resource.type = resourceType;
    resource.hp = 1 + Math.floor(0.25 * size); // TODO: Find better value. Should it be related to the resource.type too?
    // TODO: Use resource.type to show the correct graphics.
};

var cursors;

var shoot;
var bulletGroup;
var bulletProperties = {
    speed: 400,
    interval: 250,
    lifeSpan: 3000,
    maxCount: 30
};
var shotsInterval = 0;

var shipDestroyed = function () {
    "use strict";
    
    location.reload();
}

var game = new Phaser.Game(window.innerWidth - 50, window.innerHeight - 50, Phaser.AUTO, "gameArea", {
    preload: function () {
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
    create: function () {
        "use strict";
        var initialShipSize = 32;
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.world.width = 10000;
        game.world.height = 10000;
        
        market = game.add.sprite(0, 0, "market");
        game.physics.arcade.enable(market);
        market.body.immovable = true;
        
        player.ship = game.add.sprite(400, 0, "ship" + initialShipSize + "sps");
        game.physics.arcade.enable(player.ship);
        player.ship.size = initialShipSize;
        player.ship.anchor.set(0.5, 0.5);
        player.ship.body.drag.set(0);
        player.ship.body.maxVelocity.set(300);
        player.ship.body.velocity.x = 0;
        player.ship.body.velocity.y = 0;
        player.ship.body.angularVelocity = 0;
        player.ship.body.collideWorldBounds = true;
        player.ship.hp = 1;
        player.ship.speed = 100;
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
        
        resources = game.add.group();
        resources.enableBody = true;
        
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
    update: function () {
        "use strict";
        
        var playerShipAsteroidCollision = function (ship, asteroid) {
            "use strict";
            
            player.ship.hp -= 1;
            if (player.ship.hp <= 0) {
                shipDestroyed();
            }
        };
        game.physics.arcade.collide(asteroids, player.ship, playerShipAsteroidCollision, null, this);
        
        var playerShipResourceCollision = function (ship, resource) {
            "use strict";
            if (resource.size < ship.size) {
                // TODO: Record how much of what type of resouce was picked up.
                resource.kill();
            } else {
                player.ship.hp -= 1;
                if (player.ship.hp <= 0) {
                    shipDestroyed();
                }
            }
        };
        game.physics.arcade.collide(resources, player.ship, playerShipResourceCollision, null, this);
        
        var asteroidAsteroidCollision = function (asteroid1, asteroid2) {
            "use strict";
            
            // TODO: If sensible, refactor relevant parts of bulletGroupAsteroidCollision out into a function that can also be used here.
        };
        game.physics.arcade.collide(asteroids, asteroids, asteroidAsteroidCollision, null, this);
        
        game.physics.arcade.collide(market, asteroids);
        
        var bulletGroupAsteroidCollision = function (bullet, asteroid) {
            "use strict";
            
            var resourcePropability = 0.025;
            var extraResourcePropability = 0.05;
            
            bullet.kill();
            asteroid.hp -= player.ship.weapon.damagePerShot;
            if (asteroid.hp <= 0) {
                if (asteroid.size > 16) {
                    // Child-asteroid one.
                    if (Math.random() >= resourcePropability) {
                        createAsteroid(asteroids, asteroid.x, asteroid.y, asteroid.size / 2);
                    } else {
                        createResource(resources, asteroid.x, asteroid.y, asteroid.size / 2, undefined);
                    }
                    
                    // Child-asteroid two.
                    if (Math.random() >= resourcePropability) {
                        createAsteroid(asteroids, asteroid.x, asteroid.y, asteroid.size / 2);
                    } else {
                        createResource(resources, asteroid.x, asteroid.y, asteroid.size / 2, undefined);
                    }

                    // Random resource.
                    if (Math.random() <= extraResourcePropability) {
                        createResource(resources, asteroid.x, asteroid.y, 8, undefined);
                    }
                } else {
                    createResource(resources, asteroid.x, asteroid.y, 8, undefined);
                    createResource(resources, asteroid.x, asteroid.y, 8, undefined);
                }
                asteroid.kill();
            }
        };
        game.physics.arcade.overlap(bulletGroup, asteroids, bulletGroupAsteroidCollision, null, this);
        
        var resourceResourceCollision = function (resource1, resource2) {
            "use strict";
            
            // TODO: If sensible, refactor relevant parts of bulletGroupAsteroidCollision or equivalent resource function out into a function that can also be used here.
            // TODO: When non-minimal size resource is hit it should break down and skip every other size to encourage players to get larger ships.
        };
        game.physics.arcade.collide(resources, resources, resourceResourceCollision, null, this);
        
        game.physics.arcade.collide(market, resources);
        
        var bulletGroupResourceCollision = function (bullet, resource) {
            "use strict";
            
            var extraResourcePropability = 0.05;
            
            bullet.kill();
            resource.hp -= player.ship.weapon.damagePerShot;
            if (resource.hp <= 0) {
                if (resource.size > 16) {
                    // Child-resource one.
                    createResource(resources, resource.x, resource.y, resource.size / 2, resource.type);
                    
                    // Child-resource two.
                    createResource(resources, resource.x, resource.y, resource.size / 2, resource.type);

                    // Random resource.
                    if (Math.random() <= extraResourcePropability) {
                        createResource(resources, resource.x, resource.y, 8, undefined);
                    }
                }
                resource.kill();
            }
        };
        game.physics.arcade.overlap(bulletGroup, resources, bulletGroupResourceCollision, null, this);

        var bulletMarketCollision = function (market, bullet) {
            "use strict";
            
            bullet.kill();
        };
        game.physics.arcade.collide(market, bulletGroup, bulletMarketCollision, null, this);
        
        var playerShipMarketCollision = function (ship, market) {
            "use strict";
            
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
            game.physics.arcade.accelerationFromRotation(player.ship.rotation, player.ship.speed, player.ship.body.acceleration);
        } else {
            player.ship.body.angularVelocity = 0;
            player.ship.body.acceleration.set(0);
        }
        
        if (shoot.isDown){
            this.fire();
        }
    },
    openMarketPlace: function () {
        "use strict";
        
        // TODO: Marketplace dialog.
    },
    fire: function () {
        "use strict";
        
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
