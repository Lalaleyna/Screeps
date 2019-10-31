var roleReserver = {
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
		} else if (creep.room.controller) {
			if (!creep.memory.pathCounted)
				creep.memory.pathCounted = true;
			if (!creep.memory.controllerSigned) {
				if (creep.signController(creep.room.controller, 'The property of Lalaleyna.') == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				} else {
					creep.memory.controllerSigned = true;
				}
			} else {
				if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				}
			}
		} else {
			console.log('TARGET ROOM HAS NO CONTROLLER');
		}
	}
}

module.exports = roleReserver;