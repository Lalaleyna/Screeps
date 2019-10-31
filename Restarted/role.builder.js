var roleBuilder = {
	run: function(creep) {
		if (!creep.memory.infoPushed) {
			if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
				creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
				creep.memory.infoPushed = true
			}
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
                if ((creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.sourceToHarv == source.id)}).length) < 1 + pointsEmpty) {
                    creep.memory.sourceToHarv = source.id
                    break
                }
            }
        }
        
        if (_.sum(creep.store) == creep.store.getCapacity()) {
            creep.memory.building = true
        }
        if (_.sum(creep.store) == 0) {
            creep.memory.building = false
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
            if (!creep.memory.structToGo) {
                try {
                creep.memory.structToGo = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES).id;
                } catch (e) {}
                if (!creep.memory.structToGo) {
                    creep.room.memory.builderSpawned = false;
                    creep.suicide();
                }
            }
        	let building = Game.getObjectById(creep.memory.structToGo)
            if (!building) {
                delete creep.memory.structToGo;
                return
            }
        	if (creep.build(building) == ERR_NOT_IN_RANGE) {
        		creep.moveTo(building);
        	}
        }
	}
}

module.exports = roleBuilder; 