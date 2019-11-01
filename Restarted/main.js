var globalRoomFunction = require('function.rooms').globalRoomFunction;
var telephone = require('memory.telephone');
var repairOrNot = require('function.repairOrNot').repairOrNot;

module.exports.loop = function () {

    for (let name in Game.rooms) {
    	let room = Game.rooms[name];
        if (room.controller && !room.controller.my || !room.controller) {
            continue
        }
        try {
		  globalRoomFunction(room);
        } catch (e) {console.log(e.stack)}
    }

    let time = Game.cpu.getUsed();
    for (var name in Game.creeps) {
        Game.creeps[name].runRole();
    }

    if (!Memory.cpu)
      Memory.cpu = {creeps: {used: 0, counter: 0, average: 0}}
    Memory.cpu.creeps.used = Number((Memory.cpu.creeps.used + Game.cpu.getUsed() - time).toFixed(4));
    Memory.cpu.creeps.counter += 1;
    if (Memory.cpu.creeps.counter >= 100) {
    	Memory.cpu.creeps.average = Number(((Memory.cpu.creeps.average + Memory.cpu.creeps.used / 100 / Object.keys(Memory.creeps).length) / 2).toFixed(4));
    	Memory.cpu.creeps.counter = 0;
    	Memory.cpu.creeps.used = 0;
    }
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
       }
    }
}
