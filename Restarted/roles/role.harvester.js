var roleHarvester = {

    run: function(creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
                creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
                creep.memory.infoPushed = true
            }
        }
        if (!creep.memory.sourceToHarv) {
            let sourceList =  _.sortBy(creep.room.memory.sources, (s) => -1 * creep.pos.getRangeTo(s)).reverse();
            for (let source of sourceList) {
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
        if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false 
        }
        else if (creep.carry.energy == 0) {
            creep.memory.harvesting = true
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
        }
        else {
            if (!creep.memory.structToGo) {
                try {
                    creep.memory.structToGo = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, 
                                                            {filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                                                                    s.structureType == STRUCTURE_EXTENSION) && 
                                                                    s.energy < s.energyCapacity}).id;
                } catch (e) {}
            }
            let struct = Game.getObjectById(creep.memory.structToGo);
            if (struct && struct.energy == struct.energyCapacity) {
                delete creep.memory.structToGo;
                return
            }
            if (struct) {
                if(creep.transfer(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(struct);
                }
            }
            else if (creep.room.controller) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {range: 2});
                }
            }
        }
	}
};

module.exports = roleHarvester;