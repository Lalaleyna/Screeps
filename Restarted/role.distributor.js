var roleDistributor = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
                creep.room.memory.creepsToSpawn.unshift({role: creep.memory.role})
                creep.memory.infoPushed = true
            }
        }
        if (creep.room.name == 'E21N27') {
            creep.memory.container = creep.room.storage.id;
        }
        if (!creep.memory.container) {
            if (!creep.room.memory.lvl6Ready) {
            	let containerList = creep.room.memory.roomStructures[STRUCTURE_CONTAINER];
    	        let sources = creep.room.memory.sources;
    	        for (let source of sources) {
    		        if ((creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.sourceToCheck == source.id)}).length) == 0) {
                        creep.memory.sourceToCheck = source.id
    		            break
    		        }
    	        }
    	        let sourceChosen = Game.getObjectById(creep.memory.sourceToCheck);
    	        let linkExists = sourceChosen.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType == STRUCTURE_LINK});
    	        if (linkExists.length) {
    	        	let storage = creep.room.storage;
    	        	creep.memory.container = storage.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType == STRUCTURE_LINK})[0].id;
    	        } else {
    		        for (let cont of containerList) {
    			        if ((creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.container == cont)}).length) == 0) {
    			            creep.memory.container = cont
    			            break
    			        }
    		        }
    	        }
            } else {
                let storage = creep.room.storage;
                creep.memory.container = storage.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType == STRUCTURE_LINK})[0].id;
            }
        }

        if (_.sum(creep.store) == creep.store.getCapacity()) {
            creep.memory.working = false 
        }
        if (_.sum(creep.store) == 0) {
            creep.memory.working = true
        }

        if (!creep.memory.spawningStruct && creep.room.memory.roomStructures) {
            let roomStructures = creep.room.memory.roomStructures[STRUCTURE_SPAWN].concat(creep.room.memory.roomStructures[STRUCTURE_EXTENSION], 
                                    creep.room.memory.roomStructures[STRUCTURE_TOWER]);
            if (roomStructures) {
               	let sType = null;
                let structure = null;
                let range = 1000;
                for (let id of roomStructures) {
                    str = Game.getObjectById(id);
                    let r2 = creep.pos.getRangeTo(str);
                    if (r2 < range && str.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        structure = id;
                        range = r2;
                        sType = str.structureType;
                        if (r2 <= 3) {
                             break;
                        }
                    }
                }
                if (structure) {
                    creep.memory.spawningStruct = structure;
                }
            }
        }
        let struct = Game.getObjectById(creep.memory.spawningStruct);
        if (struct && struct.energy == struct.energyCapacity) {
            delete creep.memory.spawningStruct;
            return
        }
        if (creep.memory.working) {
        	let container = Game.getObjectById(creep.memory.container);
        	if (struct && creep.room.storage.store[RESOURCE_ENERGY] > 0 && container.store[RESOURCE_ENERGY] == 0) {
        		container = creep.room.storage;
        	}
        	if (!creep.pos.isNearTo(container)) {
        		creep.moveTo(container);

        	} else if (!container.deathTime) {
        		creep.withdraw(container, RESOURCE_ENERGY);

        	} else {
        		for (let resourceType in container.store) {
        			creep.withdraw(container, resourceType);
        		}
        	}
        } else {
        	let storage = creep.room.storage;
        	if (struct && creep.store[RESOURCE_ENERGY] == _.sum(creep.store)) {
        		storage = struct;
        	}
        	if (!creep.pos.isNearTo(storage)) {
        		creep.moveTo(storage);
        	} else {
        		for (let resourceType in creep.carry) {
        			creep.transfer(storage, resourceType); 
        		}
        	}
        }
	}
}

module.exports = roleDistributor;