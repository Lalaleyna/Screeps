var roleRemoteCreator = {
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
			let source = Game.getObjectById(creep.memory.sourceToHarv);
			if (!creep.memory.containerPlaced) {
				if (!creep.pos.isNearTo(source)) {
					creep.moveTo(source);
				} else {
					creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
					creep.memory.containerPlaced = true
				}
			} else if (!creep.memory.containerBuilt) {

				if (_.sum(creep.store) == creep.store.getCapacity()) {
					creep.memory.harvesting = false;
				} else if (_.sum(creep.store) == 0) {
					creep.memory.harvesting = true;
				}

				let constSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
				if (constSite) {
					if (creep.memory.harvesting) {
						creep.harvest(source);
					} else {
						creep.build(constSite);
					}
				} else {
					creep.memory.containerBuilt = true;
				}

			} else {
				if (!creep.memory.infoPushed) {
					Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: 'reserver', targetRoom: creep.memory.targetRoom});
					Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: 'remoteHarvester', targetRoom: creep.memory.targetRoom});
					Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: 'remoteDistributor', targetRoom: creep.memory.targetRoom});
					Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: 'remoteProtector', targetRoom: creep.memory.targetRoom});
					if (!Game.rooms[creep.memory.homeRoom].memory[creep.memory.targetRoom])
						Game.rooms[creep.memory.homeRoom].memory[creep.memory.targetRoom] = {};
				}
				creep.suicide();
			}
		}
	}
}

module.exports = roleRemoteCreator;