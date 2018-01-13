Brain_3 = {

    /* Name of your awesome neuro-blockchain algorithm. 10 chars max. */
    name: "Крысорог",

    /**
     * Kind of a creature.
     * Possible variations are [rhino, bear, moose, bull].
     */
    kind: kinds.rhino,

    /* 10 chars max, displayed with name of the algorithm on the leaderboard. */
    author: "Child Porn",

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
        const max = ground.width + ground.height;
        let safeBullet, dangerousBullet,
            safeBulletDist = max,
            dangerousBulletDist = max,
            center = {
                x: ground.width / 2,
                y: ground.height / 2
            };
        if (typeof run == "undefined") {
            ticksTillMoving = 50;
            run = false;
            ratMessage = undefined;
            spam = 0;
            messageSpam = 0;
        }
        events.forEach(event => {
            if (event.type == events.murder) {
                console.log(event);
                if (event.payload[0] == self) {
                    ratMessage = "Easykill, " + event.payload[1].name;
                }
            }
        })

        if (ratMessage && messageSpam === 0) {
            messageSpam = 20;
        }else if (ratMessage && messageSpam === 1){
            messageSpam--;
            ratMessage = undefined;
        }else if (messageSpam > 0){
            messageSpam--;
        }


                let doShooty = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.shoot, params:params};
                }

                let doMove = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.move, params: params};
                }

                let doEatan = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.eat, params: params};
                }

                let doTurn = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.turn, params: params};
                }

                let doNothing = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.none, params: params};
                }

                let doJumpy = function(params){
                    params.message = ratMessage ? ratMessage : params.message;
                    return {do: actions.jump, params: params};
                }


        let hitAndRun = function() {
            // Find nearest enemy
            let enemy = enemies[0],
                enemyDist = max;
            enemies.forEach(e => {
                let dist = distanceBetween(self, e);
                if (dist < enemyDist) {
                    enemyDist = dist;
                    enemy = e;
                }
            });
            let directionAngle = angleBetween(self, enemy);

            let backlash = Math.PI / 50.0;

            if (distanceBetween(self, enemy) < 200) {
                backlash = backlash * 3;
            }

            // Check enough energy for hunting
            if (self.energy > shotEnergyCost + 10) {
                let diff = Math.abs(differenceBetweenAngles(self.angle, directionAngle) - Math.PI);
                if (diff < backlash) {
                    if (distanceBetween(self, enemy) > 300) {
                        return doMove({angle: directionAngle});
                    }
                    run = true;
                    danger = enemy;
                    ticksToRun = 15;
                    return doShooty({});
                } else {
                    if (distanceBetween(self, enemy) < 300 && distanceBetween(self, enemy) > 100) {
                        return doTurn({clockwise: normalizeAngle(self.angle - directionAngle) > 2 * normalizeAngle(Math.PI - (self.angle - directionAngle))});
                    } else if (distanceBetween(self, enemy) <= 100) {
                        return doMove({angle: Math.PI + directionAngle});
                    }
                    return doMove({angle: directionAngle});
                }
            }
        }

        let runForYourLife = function() {
            if (ticksToRun == 1) {
                run = false;
            }
            ticksToRun -= 1;
            return runTheFuckAway(danger)

        }

        let runTheFuckAway = function(enemy) {
            let runAngle = angleBetween(self, enemy) + Math.PI;
            if (self.position.x + 70 > ground.width) {
                runAngle = Math.PI / 2.0;
            }
            if (self.position.y - 70 < 0) {
                runAngle = 0;
            }
            if (self.position.x - 70 < 0) {
                runAngle = 3.0 * Math.PI / 2.0;
            }
            if (self.position.y + 70 > ground.height) {
                runAngle = Math.PI;
                if (self.position.x + 70 > ground.width) {
                    runAngle = Math.PI / 2.0;
                }
            }
            return doMove({angle: runAngle, message: "Spare the little mouse."});
        }

        let goToCenter = function() {
            // Determine center area
            let wh = ground.width / 8,
                hh = ground.height / 8;
            if (self.position.x < center.x - wh || self.position.x > center.x + wh ||
                self.position.y < center.y - hh || self.position.y > center.y + hh) {
                return doMove({angle: angleBetweenPoints(self.position, center)});
            } else {
                return doNothing({});
            }
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
                if (fuckedUpEnemies >= enemies.length - 1) {
                    safeBulletDist = dist;
                    safeBullet = bullet;
                }
            }
        });

        if (dangerousBullet && dangerousBulletDist < 200 && self.lives < 0.3 * creatureMaxLives[self.level]) {
            let bulletAngle = Math.atan2(dangerousBullet.velocity.y, dangerousBullet.velocity.x);
            let collisionAngle = angleBetween(self, dangerousBullet);
            const backlash = Math.PI / 25.0;
            let diff = Math.abs(differenceBetweenAngles(bulletAngle, collisionAngle));
            if (diff < backlash) {
                return doJumpy({angle: bulletAngle + Math.PI / 2.0, message: "Jumpy-jumpy"});
            }
        }

        let e = 0;
        let distance = max;
        let lives = self.bullets * bulletDamage;
        enemies.forEach(enemy => {
            if (lives >= enemy.lives) {
                e = enemy;
                distance = distanceBetween(self, enemy);
                lives = enemy.lives;
            } else if (lives == enemy.lives) {
                if (distance > distanceBetween(self, enemy)) {
                    distance = distanceBetween(self, enemy);
                    lives = enemy.lives;
                }
            }
        })

        //Kill the bitch
        if (e != 0 && self.energy >= shotEnergyCost) {
            enemy = e;
            let backlash = Math.PI / 50.0;
            let directionAngle = angleBetween(self, e);
            if (distanceBetween(self, enemy) < 150){
                backlash = Math.PI / 20
            }
            if (self.energy > shotEnergyCost + 10 && enemy.lives <= (self.energy / shotEnergyCost) * bulletDamage && rayBetween(self, enemy)) {
                let diff = Math.abs(differenceBetweenAngles(self.angle, directionAngle) - Math.PI);
                if (diff < backlash) {
                    if (distanceBetween(self, enemy) > 300) {
                        return doMove({angle: directionAngle});
                    }
                    run = true;
                    danger = enemy;
                    ticksToRun = 15;
                    return doShooty({message : "Dead " + e.name});
                } else {
                    if (distanceBetween(self, enemy) < 300) {
                        return doTurn({clockwise: normalizeAngle(self.angle - directionAngle) > 2 * normalizeAngle(Math.PI - (self.angle - directionAngle))});
                    }
                    return doMove({angle: directionAngle, message : "How are you, " + e.name + "?"});
                }
            }
        }

        if (dangerousBullet && dangerousBulletDist < 200) {
            let bulletAngle = Math.atan2(dangerousBullet.velocity.y, dangerousBullet.velocity.x);
            let collisionAngle = angleBetween(self, dangerousBullet);
            const backlash = Math.PI / 25.0;
            let diff = Math.abs(differenceBetweenAngles(bulletAngle, collisionAngle));
            if (diff < backlash) {
                return doJumpy({angle: bulletAngle + Math.PI / 2.0, message: "Jumpy-jumpy"});
            }
        }


        if (self.lives < 0.4 * creatureMaxLives[self.level]) {
            if (self.bullets > 0 && self.energy >= eatBulletEnergyCost) {
                return doEatan({});
            }
        }

        // Consider save bullet
        if (safeBullet && self.bullets < creatureMaxBullets) {
            run = false;
            let angle = angleBetween(self, safeBullet);
            return doMove({angle: angle});
        }

        let dangerousEnemy = 0;
        enemies.forEach(enemy => {
            if (enemy.bullets > 0 && distanceBetween(self, enemy) < width / 4 && self.energy > creatureMaxEnergy[self.level] * 0.2) {
                dangerousEnemy = enemy;
            }
        })
        if (dangerousEnemy && self.lives < creatureMaxLives[self.level] * 0.9) {
            return runTheFuckAway(dangerousEnemy);
        }

        if (run) {
            return runForYourLife();
        }

        // Do nothing if there's no anyone else
        if (self.bullets < 1 || enemies.length < 1) {
            return doNothing({});
        } else {

            if (self.lives < creatureMaxLives[self.level] * 0.9 && self.energy == creatureMaxEnergy[self.level]) {
                return doEatan({});
            } else if (self.energy == creatureMaxEnergy[self.level] && self.bullets == creatureMaxBullets) {
                return hitAndRun();
            }
        }

        if (self.energy == creatureMaxEnergy[self.level]) {
            if (ticksTillMoving == 0) {
                ticksTillMoving = 100;
                return goToCenter();
            }

            ticksTillMoving--;
        }
        return doNothing({});
    }

};
