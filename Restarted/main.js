require('prototype.creepRoles');

module.exports.loop = function () {

	for (let name in Game.spawns) {
		let spawn = Game.spawns[name];
		var room = Game.rooms[spawn.room.name];
		if (!room.memory.sources) {
			room.memory.sources = room.find(FIND_SOURCES);
		}
		if (!room.memory.creepsToSpawn) {
			room.memory.creepsToSpawn = []
		}
		if (room.memory.creepsToSpawn.length && !spawn.spawning) {
			for (let creepInfo of room.memory.creepsToSpawn) {
				let role = creepInfo.role
				if (role == 'harvester' && room.energyAvailable >= 450) {
					spawn.spawnCreep([CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE], 'Harvester' + Game.time, {memory: {role: 'harvester'}})
					room.memory.creepsToSpawn.shift()
				} else if (role == 'builder' && room.energyAvailable >= 450) {
					spawn.spawnCreep([CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE], 'Builder' + Game.time, {memory: {role: 'builder'}})
					room.memory.creepsToSpawn.shift()
				} else if (role == 'repairer' && room.energyAvailable >= 350) {
					spawn.spawnCreep([CARRY, CARRY, WORK, MOVE, MOVE, MOVE], 'Repairer' + Game.time, {memory: {role: 'repairer'}})
					room.memory.creepsToSpawn.shift()
				}
			}
		}
	}

    for (var name in Game.creeps) {
            Game.creeps[name].runRole();
    }

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
       }
    }
}