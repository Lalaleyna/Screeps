require('prototype.creepRoles');
var repairOrNot = require('function.repairOrNot');
var runTower = require('function.towers');

module.exports.loop = function () {

    for (var name in Game.creeps) {
            Game.creeps[name].runRole();
    }

    for (let name in Game.rooms) {
    	let room = Game.rooms[name];

		if (!room.memory.sources) {
			room.memory.sources = room.find(FIND_SOURCES);
		}

		if (Game.time % 19 == 0) {
			const structures = room.find(FIND_STRUCTURES); 
			const roomStructures = {};
			const requireRepair = [];
			for (const element of structures) {
			    let type = element.structureType;
			    roomStructures[type] = roomStructures[type] || []
			    roomStructures[type].push(element.id)
			    if (repairOrNot.run(element)) {
			    	requireRepair.push(element.id);
			    }
			}
			room.memory.roomStructures = roomStructures;
			room.memory.requireRepair = requireRepair;
		}

		let hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
		if (hostileCreeps.length) {
			for (let tw of room.memory.roomStructures[STRUCTURE_TOWER]) {
				tower = Game.getObjectById(tw);
				runTower.run(tower, hostileCreeps[0]);
			}
		}
			
		if (!room.memory.creepsToSpawn) {
			room.memory.creepsToSpawn = []
		}

		if (room.memory.creepsToSpawn.length) {
			for (let id of room.memory.roomStructures[STRUCTURE_SPAWN]) {
				let spawn = Game.getObjectById(id);
				if (!spawn.spawning) {
					for (let creepInfo of room.memory.creepsToSpawn) {
						let role = creepInfo.role;
						if (role == 'harvester' && room.energyAvailable >= 450) {
							spawn.spawnCreep([CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE], 'Harvester' + Game.time, {memory: {role: 'harvester'}})
							room.memory.creepsToSpawn.shift()
						} else if (role == 'builder' && room.energyAvailable >= 450) {
							spawn.spawnCreep([CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE], 'Builder' + Game.time, {memory: {role: 'builder'}})
							room.memory.creepsToSpawn.shift()
						} else if (role == 'repairer' && room.energyAvailable >= 550) {
							spawn.spawnCreep([CARRY, CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE, MOVE], 'Repairer' + Game.time, {memory: {role: 'repairer'}})
							room.memory.creepsToSpawn.shift()
						}
					}
				}
			}
		}
    }

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
       }
    }
}
