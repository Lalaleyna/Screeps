require('prototype.creep');

var roleSpawnBuilder = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.pathLength) {
                Game.rooms[creep.memory.homeRoom].memory.creepsToSpawn.push({role: creep.memory.role, targetRoom: creep.memory.targetRoom});
                creep.memory.infoPushed = true
            }
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

			if (!creep.memory.cSite) {
				try {
					creep.memory.cSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).id
				} catch (e) {}
			}
			if (!creep.memory.cSite) {
				if (!creep.room.memory.creepsToSpawn.length) {
					creep.room.memory.creepsToSpawn.push({role: 'harvester'}, {role: 'harvester'}, {role: 'repairer'});
				}
			}

			if (!creep.memory.sourceToHarv) {
				creep.memory.sourceToHarv = creep.pos.findClosestByPath(FIND_SOURCES).id;
			}

			if (_.sum(creep.store) == creep.store.getCapacity()) {
				creep.memory.building = true;
			}
			if (_.sum(creep.store) == 0) {
				creep.memory.building = false;
			}


			if (creep.memory.building == false) {
	            if (!creep.memory.ruinToGo && !creep.memory.fuckRuins) {
	                try {
	                creep.memory.ruinToGo = creep.pos.findClosestByPath(FIND_RUINS, {filter: (r) => r.store[RESOURCE_ENERGY] > 0}).id;
	                } catch (e) {}
	            }
	            let ruin = Game.getObjectById(creep.memory.ruinToGo);
	            if (!ruin) {
	                creep.memory.fuckRuins = true
	            }
	            if (ruin && ruin.store[RESOURCE_ENERGY] == 0) {
	                delete creep.memory.ruinToGo
	                return
	            }
	            if (ruin) {
	                if(creep.withdraw(ruin, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                    creep.moveTo(ruin);
	                }
	            } else if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 4000) {
	                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                    creep.moveTo(creep.room.storage, RESOURCE_ENERGY);
	                }
	            } else {
	                let source = Game.getObjectById(creep.memory.sourceToHarv)
	                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
	                    creep.moveTo(source);
	                }
	            }
	        } else {
	            if (!creep.memory.cSite) {
	            	let building = creep.pos.findClosestByPath(FIND_STURCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).id;
	            	if (_.sum(building.store) == building.store.getCapacity(RESOURCE_ENERGY)) {
	            		creep.suicide();
	            	} else {
			        	if (creep.transfer(building, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			        		creep.moveTo(building);
			        	}
		        	}
	            } else {
		        	let building = Game.getObjectById(creep.memory.cSite)
		            if (!building) {
		                delete creep.memory.cSite;
		                return
		            }
		        	if (creep.build(building) == ERR_NOT_IN_RANGE) {
		        		creep.moveTo(building);
		        	}
	        	}
	        }
		}
	}
}

module.exports = roleSpawnBuilder;