require('prototype.creep');

var roleRemoteDistributor = {
	run: function (creep) {
		delete creep.memory.rout;
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.pathLength) {
                Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: creep.memory.role, targetRoom: creep.memory.targetRoom,
                															thief: creep.memory.thief});
                creep.memory.infoPushed = true
            }
        }

        if (!creep.memory.pathLength) {
        	creep.memory.pathLength = 0
        }

		if (_.sum(creep.store) == creep.store.getCapacity()) {
			delete creep.memory.route;
			delete creep.memory.container;
			creep.memory.goHome = true;
		} else if (_.sum(creep.store) == 0) {
			delete creep.memory.container;
			if (creep.memory.pathLength) {
				delete creep.memory.pathLength
			}
			creep.memory.goHome = false
		}

		if (!creep.memory.route) {
		    let path = Game.map.findRoute(creep.memory.homeRoom, creep.memory.targetRoom);
			if (creep.room.name == creep.memory.targetRoom) {
		    	path = Game.map.findRoute(creep.memory.targetRoom, creep.memory.homeRoom);
			}
		    creep.memory.route = path;
		}

		if (!creep.memory.goHome) {
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
				if (!creep.memory.thief) {

					if (!creep.memory.container) {
						creep.memory.container = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0].id;
					}

					let container = Game.getObjectById(creep.memory.container);
					if (container.store[RESOURCE_ENERGY] > 0) {
						if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(container);
						}
					}

				} else {
					if (!creep.memory.container) {
						let cont = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_WALL &&
							s.structureType != STRUCTURE_CONTROLLER &&
							s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_EXTRACTOR &&
							s.structureType != STRUCTURE_ROAD && s.store[RESOURCE_ENERGY] > 0});
						let ruin = creep.room.find(FIND_RUINS, {filter: (s) => s.store[RESOURCE_ENERGY] > 0});
						if (cont.length) {
							creep.memory.container = cont[0].id;
						} else if (ruin.length) {
							creep.memory.container = ruin[0].id;
						} else {
							if (_.sum(creep.store) > 0) {
								creep.memory.goHome == true;
							} else {
								creep.suicide();
							}
						}
					}

					let container = Game.getObjectById(creep.memory.container);
					if (container.store[RESOURCE_ENERGY] > 0) {
						if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(container);
						}
					} else {
						delete creep.memory.container;
					}

				}

			}

		} else {
			if (!Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.targetRoom].roadsBuilt) {
				let road = creep.pos.lookFor(LOOK_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_ROAD});
				if (road.length) {
					Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.targetRoom].roadsBuilt = true;
				} else {
					creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
					if (!Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.targetRoom].roadConstructionSites)
						Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.targetRoom].roadConstructionSites = [];
					if (!creep.fatigue) {
						try {
							let cSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0].id;
							if (creep.room.name != creep.memory.homeRoom)
							    Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.targetRoom].roadConstructionSites.unshift(cSite);
						} catch (e) {}
					}
				}
			}
			if (creep.room.name != creep.memory.homeRoom) {
				let route = creep.memory.route;
				if (creep.room.name == route[0].room) {
					creep.memory.route.shift();
					route = creep.memory.route;
				}
				creep.moveToRoom(route[0].room);
			} else {
				if (!creep.memory.container) {
					creep.memory.container = creep.room.storage.id;
				}

				let container = Game.getObjectById(creep.memory.container);
				if (container.store[RESOURCE_ENERGY] < container.store.getCapacity(RESOURCE_ENERGY)) {
					if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(container);
					}
				}

			}

		}

	}
}

module.exports = roleRemoteDistributor;
