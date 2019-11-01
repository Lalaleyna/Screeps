function repairOrNot(structure) {
    switch(structure.structureType) {
        case STRUCTURE_ROAD:
        case STRUCTURE_CONTAINER:
            return structure.hits < structure.hitsMax * 0.6;
        case STRUCTURE_WALL:
        case STRUCTURE_RAMPART:
            if (structure.room.controller.level >= 5) {
                return structure.hits < 20000;
            } else {
                return structure.hits < structure.room.controller.level * 2000
            }
        default:
            return structure.hits < structure.hitsMax;
    }
}
module.exports = {
	repairOrNot
}
