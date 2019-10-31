var roleRemoteProtector = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.pathLength) {
                Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: creep.memory.role, targetRoom: creep.memory.targetRoom});
                creep.memory.infoPushed = true
            }
        }

        if (!creep.memory.pathLength) {
        	creep.memory.pathLength = 0
        }

		if (!creep.memory.route) {
		    let path = Game.map.findRoute(creep.memory.homeRoom, creep.memory.targetRoom, {
					    routeCallback(roomName, fromRoomName) {
					        if(roomName == 'E22N27') {    // avoid this room
					            return Infinity;
					        }
					        return 1;
					    }});
			if (creep.room.name == creep.memory.targetRoom) {
		    	path = Game.map.findRoute(creep.memory.targetRoom, creep.memory.homeRoom);
			}
		    creep.memory.route = path;
		}

		if (creep.room.name != creep.memory.targetRoom) {
			let route = creep.memory.route;
			if (creep.room.name == route[0].room) {
				creep.memory.route.shift();
				route = creep.memory.route;
			}
			creep.moveToRoom(route[0].room);
			if (!creep.memory.pathCounted)
				creep.memory.pathLength += 1;
		} else {
			if (!creep.memory.pathCounted)
				creep.memory.pathCounted = true;
			if (!creep.memory.hostileCreep) {
				let hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: (c) => !Memory.allies.includes(c.owner.username)}); 
				if (hostileCreeps) {
					creep.memory.hostileCreep = hostileCreeps.id;
				}
			}
			if (!creep.memory.hostileCreep) {
				if (creep.hits < creep.hitsMax) {
					creep.heal(creep);
				} else if (creep.memory.damagedCreeps) {
					if (!creep.memory.creepToHeal) {
						let damagedCreep = creep.pos.findClosestByPath(FIND_CREEPS, {filter: (c) => c.hits < c.hitsMax && 
																					Memory.allies.includes(c.owner.username)});
						if (damagedCreep) {
							creep.memory.creepToHeal = damagedCreep.id;
						} else {
							delete creep.memory.damagedCreeps;
						}
					} else {
						let creepToHeal = Game.getObjectById(creep.memory.creepToHeal);
						if (!creepToHeal) {
							delete creep.memory.creepToHeal;
						} else if (creepToHeal.hits == creepToHeal.hitsMax) {
							delete creep.memory.creepToHeal;
						} else if (creepToHeal) {
							creep.heal(creepToHeal)
							creep.moveTo(creepToHeal);
						}
					}
				} else {
					if (creep.room.controller) {
						if (creep.pos.getRangeTo(creep.room.controller) > 3) {
							creep.moveTo(creep.room.controller);
						}
					} else {
						let pos = creep.room.find(FIND_FLAGS)[0].pos;
						creep.moveTo(pos);
					}
				}
			} else {
				let hostCreep = Game.getObjectById(creep.memory.hostileCreep);
				if (hostCreep) {
					if (creep.attack(hostCreep) != OK) {
						creep.heal(creep);
					}
					creep.moveTo(hostCreep);
				} else {
					delete creep.memory.hostileCreep;
					creep.memory.damagedCreeps = true;
				}
			}
		}
	}
}

module.exports = roleRemoteProtector;