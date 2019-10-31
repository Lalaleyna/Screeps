var roleUpgrader = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
                creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
                creep.memory.infoPushed = true
            }
        }

        if (_.sum(creep.store) == creep.store.getCapacity()) {
            creep.memory.working = true 
        }
        if (_.sum(creep.store) == 0) {
            creep.memory.working = false
        }

        if (creep.memory.working) {
        	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        		creep.moveTo(creep.room.controller);
        	}
        } else if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        	creep.moveTo(creep.room.storage, RESOURCE_ENERGY);
        }
	}
}

module.exports = roleUpgrader;