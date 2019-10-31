var roleHarvester = {

    run: function(creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
                creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
                creep.memory.infoPushed = true
            }
        }
        if (!creep.memory.sourceToHarv) {
            let sourceList =  _.sortBy(creep.room.memory.sources, (s) => creep.pos.getRangeTo(s));
            for (let source of sourceList) {
                if (!creep.room.memory.lvl4Ready) {
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
                } else {
                    if ((creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'harvester' && (c.memory.sourceToHarv == source.id)}).length) == 0) {
                        creep.memory.sourceToHarv = source.id
                        break
                    }
                }
            }
        }
        if (!creep.memory.nearToSource && creep.room.memory.lvl4Ready) {
            let source = Game.getObjectById(creep.memory.sourceToHarv)
            if (!creep.pos.isNearTo(source)) {
                creep.moveTo(source)
                return
            } else {
                creep.memory.nearToSource = true
            }
        }
        
        if (_.sum(creep.store) == creep.store.getCapacity()) {
            creep.memory.harvesting = false 
        }
        if (_.sum(creep.store) == 0) {
            creep.memory.harvesting = true
        }

	    if (creep.memory.harvesting) {
            if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            } else if (!creep.room.memory.lvl4Ready) {
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
                let source = Game.getObjectById(creep.memory.sourceToHarv)
                if (!creep.pos.isNearTo(source)) {
                    creep.moveTo(source)
                } else {
                    creep.harvest(source)
                }
            }
        } else if (!creep.room.memory.lvl4Ready) {
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
        } else {
            if (!creep.memory.containerId) {
                let sourceChosen = Game.getObjectById(creep.memory.sourceToHarv);
                let linkExists = sourceChosen.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType == STRUCTURE_LINK});
                if (linkExists.length) {
                    creep.memory.containerId = linkExists[0].id;
                } else {
                    let cont = sourceChosen.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                    creep.memory.containerId = cont[0].id;
                }
            }
            let container = Game.getObjectById(creep.memory.containerId);
            if (!creep.pos.isNearTo(container)) {
                creep.moveTo(container)
            } else {
                creep.transfer(container, RESOURCE_ENERGY)
            }
        }
	}
};

module.exports = roleHarvester;