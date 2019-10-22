StructureSpawn.prototype.spawnHarvester =
    function () {
        var body = [];
        var energy = this.room.energyCapacityAvailable;
        var suit = energy / 250;
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 12) {
                break;
            }
        }
        return this.spawnCreep(body, 'Harvester' + Game.time, {memory: {role: 'harvester'}});
}