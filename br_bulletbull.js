br_bulletbull = {

    /* Name of your awesome neuro-blockchain algorithm. 10 chars max. */
    name: "bulletbull",

    /**
     * Kind of a creature.
     * Possible variations are [rhino, bear, moose, bull].
     */
    kind: kinds.bull,

    /* 10 chars max, displayed with name of the algorithm on the leaderboard. */
    author: "childporn",

    /**
     * Loop function called by runner.
     *
     * @param self contains the sctucture with data of your creature:
     *
     * { id: 0,             // Unique ID of an object
     *   lives: 100,        // amount of lives. Get max using {creatureMaxLives[self.level]}
     *   bullets: 3,        // amount of bullets your creature has. Limit is {creatureMaxBullets}
     *   energy: 100,       // amount of energy. Get max using {creatureMaxEnergy[self.level]}
     *   level: 0,          // level of the creature. There're 3 levels in the game: 0, 1 and 2.
     *   position: { x: 10, y: 10 },  // position on the map. Use {ground} struct to get it's dimensions
     *   velocity: { x: 10, y: 10 },  // contains velocity vector of the creature's body
     *   angle: 1.5,        // direction the creature looking in, in radians.
     *   speed: 5,          // speed of the body
     *   angularVelocity: 1 // use it to determine is the creature rotating or not
     * };
     *
     * @param enemies contains an array with all other creatures. Can be empty.
     * It doesn't contain your creature, i.e. there is no self struct in it.
     * All elements has the same data like in self struct.
     *
     * @param bullets an array with all free bullets. Bullet's data has the following structure:
     *
     * { id: 0,                       // Unique ID of an object
     *   position: { x: 10, y: 10 },  // position on the map
     *   velocity: { x: 10, y: 10 },  // direction of bullet's movement
     *   speed: 5,                    // speed of the bullet
     *   dangerous: false             // true if the speed of the bullet is enough to hurt a creature
     * };
     *
     * @param objects contains all obstacles on the map with the following sctructure:
     *
     * { id: 0,                       // Unique ID of an object
     *   position: { x: 10, y: 10 },  // position on the map
     *   velocity: { x: 10, y: 10 },  // direction of object's movement
     *   speed: 5                     // speed of the object
     * };
     *
     * @returns a structure with desired action in the following format:
     *
     * { do: actions.move,  // desired action. See all variations in the globals consts section.
     *   params: {          // key value params, not necessary for some actions
     *      angle: 1.5      // desired direction of movement in radians
     *   }
     * };
     *
     */
    thinkAboutIt: function(self, enemies, bullets, objects, events) {




        if (typeof readyToFire == "undefined") {
            bullMesage = undefined;
            readyToFire = false;
            spam = 0;
            bullMesageSpam = 0;
        }

        if (bullMesage && bullMesageSpam === 0) {
            bullMesageSpam = 20;
        }else if (bullMesage && bullMesageSpam === 1){
            bullMesageSpam--;
            bullMesage = undefined;
        }else if (bullMesageSpam > 0){
            bullMesageSpam--;
        }

        const max = ground.width + ground.height;
        let safeBullet, dangerousBullet,
            safeBulletDist = max,
            dangerousBulletDist = max,
            center = {
                x: ground.width / 2,
                y: ground.height / 2
            };

        let doShooty = function(params){
            bullMesage = "Target acquired.";
            params.message = bullMesage;
            spam = 1;
            return {do: actions.shoot, params:params};
        }

        let doMove = function(params){
            spam = 0;
            params.message = bullMesage;
            return {do: actions.move, params: params};
        }

        let doEatan = function(params){
            params.message = bullMesage;
            return {do: actions.eat, params: params};
        }

        let doTurn = function(params){

            params.message = bullMesage;

            if (spam == 0) {
                spam = 1;
                bullMesage = "Turret mode: Activated.";
            }
            if(readyToFire){
                bullMesage = "Rage mode: Activated.";
            }
            params.message  = bullMesage;
            return {do: actions.rotate, params: params};
        }

        let doNothing = function(params){
            params.message = bullMesage;
            return {do: actions.none, params: params};
        }

        let doJumpy = function(params){
            params.message = bullMesage;
            return {do: actions.jump, params: params};
        }

        let goToCenter = function() {
            // Determine center area
            let wh = ground.width / 8,
                hh = ground.height / 8;
            if (self.position.x < center.x - wh || self.position.x > center.x + wh ||
                self.position.y < center.y - hh || self.position.y > center.y + hh) {
                return doMove({angle: angleBetweenPoints(self.position, center)});
            } else {
                return prepareYourAnuses();
            }
        }

        let prepareYourAnuses = function() {
            if (self.bullets > 0 && self.energy) {
                let backlash = Math.PI / 20;
                let distance = 200;
                if (readyToFire) {
                    backlash = Math.PI / 10;
                    distance = 400;
                }
                let shoot = false;
                if (self.energy >= shotEnergyCost * self.bullets) {
                    enemies.forEach(e => {
                        let directionAngle = angleBetween(self, e);
                        let diff = Math.abs(differenceBetweenAngles(self.angle, directionAngle));
                        if (diff < backlash && distanceBetween(self, e) <= distance && rayBetween(self, e)) {
                            shoot = true;
                        }
                    });

                    if (shoot) {
                        if (self.bullets == 1) {

                            readyToFire = false;
                        }
                        clockwise = randomInt(0, 1);
                        return doShooty({});
                    }
                }
            }

            if (typeof clockwise == "undefined") {
                clockwise = randomInt(0, 1);
            }
            return doTurn({clockwise : clockwise});
        }

        if (self.bullets == creatureMaxBullets) {
            readyToFire = true;
        }

        // Looking for bullets
        bullets.forEach(bullet => {
            let dist = distanceBetween(self, bullet);
            if (bullet.dangerous && dist < dangerousBulletDist) {
                dangerousBulletDist = dist;
                dangerousBullet = bullet;
            }
            dist = distanceBetweenPoints(center, bullet.position);

            if (!bullet.dangerous && dist < safeBulletDist) {
                let fuckedUpEnemies = 0;
                enemies.forEach(enemy => {
                    if (distanceBetween(bullet, enemy) > distanceBetween(bullet, self)) {
                        fuckedUpEnemies += 1;
                    }
                });
                if (fuckedUpEnemies >= enemies.length -2 + self.bullets){
                    safeBulletDist = dist;
                    safeBullet = bullet;
                }
            }
        });

        
        if (safeBullet && !readyToFire) {
            let angle = angleBetween(self, safeBullet);
            return doMove({angle: angle});
        }

        // Do nothing if there's no anyone else
        if (self.bullets < 1 || enemies.length < 1) {
            return doNothing({});
        } else {

            return goToCenter();

        }


        return goToCenter();

    }

};
