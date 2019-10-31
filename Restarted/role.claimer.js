var roleClaimer = {
	run: function (creep) {
		if (!creep.memory.route) {
		    let path = Game.map.findRoute(creep.memory.homeRoom, creep.memory.targetRoom, {
					    routeCallback(roomName, fromRoomName) {
					        if(roomName == 'E22N27') {    // avoid this room
					            return Infinity;
					        }
					        return 1;
					    }});
			if (creep.room.name == creep.memory.targetRoom) {
		    	path = Game.map.findRoute(creep.memory.targetRoom, creep.memory.homeRoom);
			}
		    creep.memory.route = path;
		}

		if (creep.room.name != creep.memory.targetRoom) {
			let route = creep.memory.route;
			if (creep.room.name == route[0].room) {
				creep.memory.route.shift();
				route = creep.memory.route;
			}
			creep.moveToRoom(route[0].room);
		} else if (creep.room.controller) {
			if (!creep.memory.controllerSigned) {
				if (creep.signController(creep.room.controller, 'The property of Lalaleyna.') == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				} else {
					creep.memory.controllerSigned = true;
				}
			} else {
				if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				}
			}
		} else {
			console.log('TARGET ROOM HAS NO CONTROLLER');
		}
	}
}

module.exports = roleClaimer;