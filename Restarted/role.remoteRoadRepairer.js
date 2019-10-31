var repairOrNot = require('function.repairOrNot').repairOrNot;
require('prototype.creep');

var roleRemoteRoadRepairer = {
	run: function (creep) {
        if (!creep.memory.infoPushed) {
            if (creep.ticksToLive <= creep.body.length) {
                Game.rooms[creep.memory.homeRoom].memory.roadRepairerSpawned = false;
                creep.memory.infoPushed = true
            }
        }

		if (_.sum(creep.store) == creep.store.getCapacity()) {
			creep.memory.goHome = false;
		} else if (_.sum(creep.store) == 0) {
			creep.memory.goHome = true;
		}

		if (!creep.memory.roadToRepair && !creep.memory.roadToBuild) {
			for (var remoteName in Game.rooms[creep.memory.homeRoom].memory.remotes) {
				if (Game.rooms[creep.memory.homeRoom].memory.remotes[remoteName].roads) {
					let remote = Game.rooms[creep.memory.homeRoom].memory.remotes[remoteName].roads;
					for (let rId of remote) {
						let road = Game.getObjectById(rId);
						if (road && repairOrNot(road)) {
							creep.memory.roadToRepair = {id: rId, room: road.room.name};
							break
						}
					}
				}
			}
		}
		if (!creep.memory.roadToBuild && !creep.memory.roadToRepair) {
			for (var remoteName in Game.rooms[creep.memory.homeRoom].memory.remotes) {
				if (Game.rooms[creep.memory.homeRoom].memory.remotes[remoteName].roadConstructionSites) {
					let remote = Game.rooms[creep.memory.homeRoom].memory.remotes[remoteName].roadConstructionSites;
					if (remote.length) {
						let road = Game.getObjectById(remote[0]);
						if (road) {
							creep.memory.roadToBuild = {id: remote[0], room: road.pos.roomName, pos: road.pos};
							creep.memory.remoteName = remoteName;
							break
						}
					}
				}
			}
		}
		if (!creep.memory.goHome) {
			if (creep.memory.roadToRepair) {
				if (creep.room.name != creep.memory.roadToRepair.room) {
					if (!creep.memory.route || !creep.memory.route.length) {
					    let path = Game.map.findRoute(creep.room.name, creep.memory.roadToRepair.room);
					    creep.memory.route = path;
					}
					let route = creep.memory.route;
					if (creep.room.name == route[0].room) {
						creep.memory.route.shift();
						route = creep.memory.route;
					}
					try {
						creep.moveToRoom(route[0].room);
					} catch (e) {}
				} else {
					let road = Game.getObjectById(creep.memory.roadToRepair.id);
					if (road.hits < road.hitsMax) {
						if (creep.repair(road) == ERR_NOT_IN_RANGE)
							creep.moveTo(road);
					} else {
						delete creep.memory.roadToRepair;
						delete creep.memory.route;
					}
				}
			} else if (creep.memory.roadToBuild) {
				if (creep.room.name != creep.memory.roadToBuild.room) {
					if (!creep.memory.route || !creep.memory.route.length) {
					    let path = Game.map.findRoute(creep.room.name, creep.memory.roadToBuild.room);
					    creep.memory.route = path;
					}
					let route = creep.memory.route;
					if (creep.room.name == route[0].room) {
						creep.memory.route.shift();
						route = creep.memory.route;
					}
					try {
						creep.moveToRoom(route[0].room);
					} catch (e) {}
				} else {
					let road = Game.getObjectById(creep.memory.roadToBuild.id);
					if (road) {
						if (creep.build(road) == ERR_NOT_IN_RANGE)
							creep.moveTo(road);
						let cBody = creep.body;
						let workCounter = 0;
						for (let bPart of cBody) {
							if (bPart.type == WORK)
								workCounter++;
						}
						if (road.progress + workCounter * 5 >= road.progressTotal && creep.store[RESOURCE_ENERGY] >= workCounter * 5) {
							creep.memory.passRoad = true;
							creep.memory.timePassed = Game.time;
							Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roadConstructionSites.shift();
							delete creep.memory.route;
						}
					}
				}
				if (creep.memory.passRoad && Game.time > creep.memory.timePassed) {
					let p = creep.memory.roadToBuild.pos
					let rPos = new RoomPosition(p.x, p.y, p.roomName);
					let rFound = rPos.lookFor(LOOK_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_ROAD})[0];
					if (!Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads)
						Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads = [];
					Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads.push(rFound.id);
					creep.memory.passRoad = false;
					delete creep.memory.roadToBuild;
				}
			}
		} else {
			if (creep.memory.passRoad) {
				let p = creep.memory.roadToBuild.pos
				let rPos = new RoomPosition(p.x, p.y, p.roomName);
				let rFound = rPos.lookFor(LOOK_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_ROAD})[0];
				if (!Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads)
					Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads = [];
				Game.rooms[creep.memory.homeRoom].memory.remotes[creep.memory.remoteName].roads.push(rFound.id);
				creep.memory.passRoad = false;
				delete creep.memory.roadToBuild;
			}
			if (creep.room.name != creep.memory.homeRoom) {
				if (!creep.memory.route || !creep.memory.route.length) {
					let path = Game.map.findRoute(creep.room.name, creep.memory.homeRoom);
					creep.memory.route = path;
				}
				let route = creep.memory.route;
				if (creep.room.name == route[0].room) {
					creep.memory.route.shift();
					route = creep.memory.route;
				}
				try {
					creep.moveToRoom(route[0].room);
				} catch (e) {}
			} else {
				if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.storage);
				}
			}
		}

	}
}

module.exports = roleRemoteRoadRepairer;