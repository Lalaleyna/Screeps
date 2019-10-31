var roleRemoteHarvester = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.pathLength) {
                Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: creep.memory.role, targetRoom: creep.memory.targetRoom})
                creep.memory.infoPushed = true
            }
        }

        if (!creep.memory.pathLength) {
        	creep.memory.pathLength = 0
        }

		if (!creep.memory.route) {
		    let path = Game.map.findRoute(creep.memory.homeRoom, creep.memory.targetRoom);
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
			if (!creep.memory.sourceToHarv) {
				creep.memory.sourceToHarv = creep.room.find(FIND_SOURCES)[0].id;
			}
			if (!creep.memory.container) {
				creep.memory.container = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0].id;
			}

			if (_.sum(creep.store) == creep.store.getCapacity()) {
				creep.memory.harvesting = false;
			} else if (_.sum(creep.store) == 0) {
				creep.memory.harvesting = true;
			}

			if (creep.memory.harvesting) {
				let source = Game.getObjectById(creep.memory.sourceToHarv);
				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
				}
			} else {
				let container = Game.getObjectById(creep.memory.container);
				if (container.hits < container.hitsMax) {
					if (creep.repair(container) == ERR_NOT_IN_RANGE) {
						creep.moveTo(container);
					}
				} else if (container.store[RESOURCE_ENERGY] < container.store.getCapacity(RESOURCE_ENERGY)) {
					if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(container);
					}
				}
			}
		}
		
	}
}

module.exports = roleRemoteHarvester;