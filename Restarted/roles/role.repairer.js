var roleHarvester = require('role.harvester');

var roleRepairer = {
	run: function (creep) {
		/*if (creep.signController(creep.room.controller, 'The property of Lalaleyna.') == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}
		return*/
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
                creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
                creep.memory.infoPushed = true
            }
        }

        if (creep.carry.energy == creep.carryCapacity) {
        	if (!creep.memory.structToGo) {
	            try {
	                creep.memory.structToGo = creep.pos.findClosestByPath(FIND_STRUCTURES, 
	                        				{filter: (s) => ((s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) 
	                        																			&& s.hits < s.hitsMax * 0.8) ||
	                                						((s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) 
	                                																			  && s.hits < 10000) ||
	                                						(s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER &&
	                               		s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL && s.hits < s.hitsMax)}).id;
	            } catch (e) {}
        	}
            creep.memory.harvesting = false 
        }
        else if (creep.carry.energy == 0) {
            creep.memory.harvesting = true
        }
        if (!creep.memory.sourceToHarv) {
            for (let source of creep.room.memory.sources) {
                let pointsEmpty = 0
                let x = source.pos.x - 1
                let y = source.pos.y - 1
                for (let i = x; i <= x + 3; i++) {
                    for (let j = y; j <= y + 3; j++) { 
                        const terrain = new Room.Terrain(creep.room.name);
                        if (terrain.get(i, j) != TERRAIN_MASK_WALL) {
                            pointsEmpty += 1
                        }
                    }
                }
                if ((creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.sourceToHarv == source.id)}).length) < 2 * pointsEmpty) {
                    creep.memory.sourceToHarv = source.id
                    break
                }
            }
        }
        if (creep.memory.harvesting) {
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
            } else {
                let source = Game.getObjectById(creep.memory.sourceToHarv)
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        } else {
        	let struct = Game.getObjectById(creep.memory.structToGo);
        	if (struct) {
        		if (((struct.structureType == STRUCTURE_ROAD || struct.structureType == STRUCTURE_CONTAINER) && struct.hits >= struct.hitsMax * 0.8) 
        			|| ((struct.structureType == STRUCTURE_WALL || struct.structureType == STRUCTURE_RAMPART) && struct.hits >= 10000)) {
        				delete creep.memory.structToGo;
        				return
        			}
        	}
        	if (struct) {
	            if(creep.repair(struct) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(struct);
	            }
        	} else {
	            if (!creep.memory.spawningStruct) {
	                try {
	                    creep.memory.spawningStruct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, 
	                                                            {filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
	                                                                    s.structureType == STRUCTURE_EXTENSION) && 
	                                                                    s.energy < s.energyCapacity}).id;
	                } catch (e) {}
	            }
	            let structToGo = Game.getObjectById(creep.memory.spawningStruct);
	            if (structToGo && structToGo.energy == structToGo.energyCapacity) {
	                delete creep.memory.spawningStruct;
	                return
	            }
	            if (structToGo) {
	                if(creep.transfer(structToGo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                    creep.moveTo(structToGo);
	                }
	            }
	            else if (creep.room.controller) {
	                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
	                    creep.moveTo(creep.room.controller, {range: 2});
	                }
	            }
        	}
        }
	}
};

module.exports = roleRepairer;