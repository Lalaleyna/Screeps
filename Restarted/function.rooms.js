require('prototype.creepRoles');
require('prototype.spawn');
var runTower = require('function.towers');
var repairOrNot = require('function.repairOrNot').repairOrNot;

function globalRoomFunction(room) {
	if (!room.memory.sources) {
		room.memory.sources = room.find(FIND_SOURCES);
	}

	if (!room.memory.creepsToSpawn) {
		room.memory.creepsToSpawn = []
	}

	if (!room.memory.energy && room.storage)
		room.memory.energy = {past: room.storage.store[RESOURCE_ENERGY], present: room.storage.store[RESOURCE_ENERGY], difference: 0, counter: 0}
	if (room.storage)
		room.memory.energy.counter++;
	if (room.storage && room.memory.energy && room.memory.energy.counter >= 500) {
		room.memory.energy.counter = 0;
		room.memory.energy.past = room.memory.energy.present;
		room.memory.energy.present = room.storage.store[RESOURCE_ENERGY];
		room.memory.energy.difference = room.memory.energy.present - room.memory.energy.past
		if (room.memory.energy.difference >= 0)
			console.log('Storage statistics (' + room.name + '): ' + room.memory.energy.difference + ' units. POSITIVE');
		else
			console.log('Storage statistics (' + room.name + '): ' + room.memory.energy.difference + ' units. NEGATIVE');
	}

	const tombstones = room.find(FIND_TOMBSTONES);
	const tombstonesIds = [];
	for (let tombstone of tombstones) {
		if (_.sum(tombstone.store)) {
			tombstonesIds.push(tombstone.id);
		}
	}
	room.memory.tombstones = tombstonesIds;

	if (Game.time % 7 == 0) {
		const structures = room.find(FIND_STRUCTURES);
		const roomStructures = {};
		const requireRepair = [];
		for (const element of structures) {
			let type = element.structureType;
			roomStructures[type] = roomStructures[type] || []
			roomStructures[type].push(element.id)
			if (repairOrNot(element)) {
			    requireRepair.push(element.id);
			}
		}
		room.memory.roomStructures = roomStructures;
		room.memory.requireRepair = requireRepair;
	}

	if (!room.memory.roadRepairerSpawned && Game.time % 13 == 0) {

		for (let remoteName in room.memory.remotes) {
			if (room.memory.remotes[remoteName].roads) {
				let remote = room.memory.remotes[remoteName].roads;
				for (let rId of remote) {
					let road = Game.getObjectById(rId);
					if (road && repairOrNot(road)) {
						room.memory.creepsToSpawn.push({role: 'remoteRoadRepairer',
							roadToRepair: {id: rId, room: road.room.name}, remoteName: remoteName});
						room.memory.roadRepairerSpawned = true;
						break
					}
				}
			}
		}

	}

	if (!room.memory.roadRepairerSpawned && Game.time % 13 == 0) {

		for (let remoteName in room.memory.remotes) {
			if (room.memory.remotes[remoteName].roadConstructionSites) {
				let remote = room.memory.remotes[remoteName].roadConstructionSites;
				if (remote.length) {
					let road = Game.getObjectById(remote[0]);
					if (road) {
						room.memory.creepsToSpawn.push({role: 'remoteRoadRepairer',
							roadToBuild: {id: remote[0], room: road.pos.roomName, pos: road.pos}, remoteName: remoteName});
						room.memory.roadRepairerSpawned = true;
						break
					}
				}
			}
		}

	}

	if (Game.time % 29 == 0 && !room.memory.builderSpawned) {
		const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
		if (constructionSites.length) {
			room.memory.builderSpawned = true
			room.memory.creepsToSpawn.push({role: 'builder'});
		}
	}

	if (!room.memory.mainLinkId && room.memory.lvl5Ready) {
		room.memory.mainLinkId = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK}).id;
	}

	if (room.memory.roomStructures && room.memory.roomStructures[STRUCTURE_LINK]) {
		for (let linkId of room.memory.roomStructures[STRUCTURE_LINK]) {
			let mainLink = Game.getObjectById(room.memory.mainLinkId);
			if (linkId == room.memory.mainLinkId) {
				continue;
			} else {
				let link = Game.getObjectById(linkId);
				if (link.store[RESOURCE_ENERGY] == link.store.getCapacity(RESOURCE_ENERGY) &&
					mainLink.store.getFreeCapacity(RESOURCE_ENERGY) == mainLink.store.getCapacity(RESOURCE_ENERGY)) {
					link.transferEnergy(mainLink);
				}
			}
		}
	}

	if (!room.memory.lvl4Ready && room.controller.level >= 4) {
		if (!room.memory.lvl4Creeps && room.memory.creepsToSpawn && room.storage &&
					room.memory.roomStructures[STRUCTURE_CONTAINER].length >= room.memory.sources.length) {
			room.memory.creepsToSpawn.push({role: 'distributor'}, {role: 'distributor'}, {role: 'upgrader'});
			room.memory.lvl4Creeps = true
		}
		let creeps = _.groupBy(room.find(FIND_MY_CREEPS), (c) => c.memory.role)
		if (room.storage && room.controller.level >= 4 && creeps['distributor'] && creeps['distributor'].length >= 2
					&& room.memory.roomStructures[STRUCTURE_CONTAINER].length >= room.memory.sources.length
					 && creeps['upgrader'] && creeps['upgrader'].length >= 1) {
			room.memory.lvl4Ready = true;
			for (cr of creeps['harvester']) {
				c = Game.getObjectById(cr.id)
				delete c.memory.sourceToHarv
			}
		}
	}

	if (!room.memory.lvl5Ready && room.controller.level >= 5) {
		let links = room.memory.roomStructures[STRUCTURE_LINK];
		if (links && links.length >= 2) {
			room.memory.lvl5Ready = true
		}
	}

	if (!room.memory.lvl6Ready && room.controller.level >= 6) {
		let links = room.memory.roomStructures[STRUCTURE_LINK]
		if (links && links.length >= 3 || (room.memory.lvl5Ready && room.memory.sources.length == 1)) {
			room.memory.lvl6Ready = true
		}
	}

	if (room.memory.lvl6Ready && !room.memory.lvl6Creeps) {
		room.memory.creepsToSpawn.push({role: 'storageWorker'});
		room.memory.lvl6Creeps = true;
	}

	let hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
	if (hostileCreeps.length && room.memory.roomStructures) {
		room.memory.hostileCreepsFound = true;
		for (let tw of room.memory.roomStructures[STRUCTURE_TOWER]) {
			tower = Game.getObjectById(tw);
			runTower.run(tower, hostileCreeps[0]);
		}
	} else if (room.memory.hostileCreepsFound) {
		let damagedCreeps = room.find(FIND_MY_CREEPS, {filter: (c) => c.hits < c.hitsMax});
		if (damagedCreeps.length) {
			for (let creep of damagedCreeps) {
				for (let tw of room.memory.roomStructures[STRUCTURE_TOWER]) {
					tower = Game.getObjectById(tw);
					tower.heal(creep);
				}
			}
		} else {
			room.memory.hostileCreepsFound = false;
		}
	}


	for (let s of room.memory.requireRepair) {
		let struct = Game.getObjectById(s);
		if (struct && struct.structureType == STRUCTURE_ROAD) {
			room.memory.requireRepair.shift();
			for (let tw of room.memory.roomStructures[STRUCTURE_TOWER]) {
				tower = Game.getObjectById(tw);
				tower.repair(struct);
			}
		}
	}

	if (!room.memory.creepsToSpawn) {
		room.memory.creepsToSpawn = []
	}
	if (room.memory.creepsToSpawn.length && room.memory.roomStructures && room.memory.roomStructures[STRUCTURE_SPAWN]) {
		for (let id of room.memory.roomStructures[STRUCTURE_SPAWN]) {
			let spawn = Game.getObjectById(id);
			if (!spawn.spawning) {
				for (let creepInfo of room.memory.creepsToSpawn) {
					let role = creepInfo.role;
					let targetRoom = creepInfo.targetRoom;
					let thief = creepInfo.thief;
					let roads = creepInfo.roads;
					let roadToBuild = creepInfo.roadToBuild;
					let roadToRepair = creepInfo.roadToRepair;
					let roomName = creepInfo.roomName;
					let wallId = creepInfo.wall;
					let energyLimit = room.energyCapacityAvailable;
					let superProtector = creepInfo.superProtector;
					if (room.controller.level > 6) {
						energyLimit /= 2;
					}
					if (room.energyAvailable < energyLimit) {
						continue
					}
					if (role == 'harvester') {
						spawn.spawnHarvester(energyLimit)
					} else if (role == 'builder') {
						spawn.spawnBuilder(energyLimit)
					} else if (role == 'repairer') {
						spawn.spawnRepairer(energyLimit)
					} else if (role == 'distributor') {
						spawn.spawnDistributor(energyLimit)
					} else if (role == 'storageWorker') {
						spawn.spawnStorageWorker(energyLimit)
					} else if (role == 'upgrader') {
						spawn.spawnUpgrader(energyLimit)
					} else if (role == 'remoteCreator') {
						spawn.spawnRemoteCreator(energyLimit, targetRoom);
					} else if (role == 'remoteHarvester') {
						spawn.spawnRemoteHarvester(energyLimit, targetRoom);
					} else if (role == 'remoteDistributor') {
						spawn.spawnRemoteDistributor(energyLimit, targetRoom, thief, roads);
					} else if (role == 'remoteRoadRepairer') {
						spawn.spawnRemoteRoadRepairer(energyLimit, roadToBuild, roadToRepair, roomName);
					} else if (role == 'remoteProtector') {
						spawn.spawnRemoteProtector(energyLimit, targetRoom, superProtector);
					} else if (role == 'reserver') {
						spawn.spawnReserver(energyLimit, targetRoom);
					} else if (role == 'claimer') {
						spawn.spawnClaimer(energyLimit, targetRoom);
					} else if (role == 'wallDestroyer') {
						spawn.spawnWallDestroyer(energyLimit, targetRoom, wallId);
					} else if (role == 'spawnBuilder') {
						spawn.spawnSpawnBuilder(energyLimit, targetRoom);
					}
					room.memory.creepsToSpawn.shift()
					break
				}
			}
		}
	}
}

module.exports = {
	globalRoomFunction
};
