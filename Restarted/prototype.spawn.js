StructureSpawn.prototype.spawnHarvester =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        if (!this.room.memory.lvl4Ready) {
            var suit = Math.floor((energy) / 250);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(MOVE);
                body.push(CARRY);
                if(body.length >= 15) {
                    break;
                }
            }
        } else {
            var suit = Math.floor((energy - 150) / 150);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(CARRY);
                if(body.length >= 12) {
                    break;
                }
            }
            body.push(MOVE);
            body.push(MOVE);
            body.push(MOVE);
        }
        return this.spawnCreep(body, 'Harvester' + Game.time, {memory: {role: 'harvester'}});
}

StructureSpawn.prototype.spawnRepairer =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        if (!this.room.memory.lvl4Ready) {
            var suit = Math.floor((energy) / 250);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
                body.push(MOVE);
                if(body.length >= 21) {
                    break;
                }
            }
        } else {
            var suit = Math.floor((energy) / 200);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
                if(body.length >= 21) {
                    break;
                }
            }
        }
        return this.spawnCreep(body, 'Repairer' + Game.time, {memory: {role: 'repairer'}});
}

StructureSpawn.prototype.spawnBuilder =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        if (!this.memory.lvl4Ready) {
            var suit = Math.floor((energy) / 250);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(MOVE);
                body.push(CARRY);
                if(body.length >= 24) {
                    break;
                }
            }
        } else {
            var suit = Math.floor((energy) / 200);
            for (let i = 0; i < suit; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
                if(body.length >= 24) {
                    break;
                }
            }
        }
        return this.spawnCreep(body, 'Builder' + Game.time, {memory: {role: 'builder'}});
}

StructureSpawn.prototype.spawnDistributor =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 150);
        for (let i = 0; i < suit; i++) {
            body.push(CARRY);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 24) {
                break;
            }
        }
        return this.spawnCreep(body, 'Distributor' + Game.time, {memory: {role: 'distributor'}});
}

StructureSpawn.prototype.spawnUpgrader =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 200);
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 42) {
                break;
            }
        }
        return this.spawnCreep(body, 'Upgrader' + Game.time, {memory: {role: 'upgrader'}});
}

StructureSpawn.prototype.spawnReserver =
    function (energyLimit, targetRoom) {
        var body = [];
        body.push(CLAIM);
        body.push(CLAIM);
        body.push(MOVE);
        body.push(MOVE);
        return this.spawnCreep(body, 'Reserver' + Game.time, {memory: {role: 'reserver', targetRoom: targetRoom, homeRoom: this.room.name}});
}

StructureSpawn.prototype.spawnRemoteCreator =
    function (energyLimit, targetRoom) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 200);
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 18) {
                break;
            }
        }
        return this.spawnCreep(body, 'RemoteCreator' + Game.time, {memory: {role: 'remoteCreator', targetRoom: targetRoom, homeRoom: this.room.name}});
}

StructureSpawn.prototype.spawnRemoteHarvester =
    function (energyLimit, targetRoom) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 200);
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 21) {
                break;
            }
        }
        return this.spawnCreep(body, 'RemoteHarvester' + Game.time, {memory: {role: 'remoteHarvester', targetRoom: targetRoom, homeRoom: this.room.name}});
}

StructureSpawn.prototype.spawnRemoteDistributor =
    function (energyLimit, targetRoom, thief, roads) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 150);
        for (let i = 0; i < suit; i++) {
            body.push(CARRY);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 36) {
                break;
            }
        }
        return this.spawnCreep(body, 'RemoteDistributor' + Game.time, {memory: {role: 'remoteDistributor', targetRoom: targetRoom, homeRoom: this.room.name,
                                                                                thief: thief, roadsBuilt: roads}});
}

StructureSpawn.prototype.spawnRemoteProtector =
    function (energyLimit, targetRoom, superProtector) {
        var body = [];
        var energy = energyLimit;
        if (energy < 2300 && superProtector) {
            var suit = Math.floor(energy / 1550);
            for (let i = 0; i < suit; i++) {
                for (let j = 0; j < 10; j++) {
                    body.push(TOUGH);
                }
                for (let j = 0; j < 16; j++) {
                    body.push(MOVE);
                }
                for (let j = 0; j < 5; j++) {
                    body.push(ATTACK);
                }
                for (let j = 0; j < 1; j++) {
                    body.push(HEAL);
                }
                if(body.length >= 32) {
                    break;
                }
            }
        } else {
            var suit = Math.floor(energy / 2300);
            for (let i = 0; i < suit; i++) {
                for (let j = 0; j < 10; j++) {
                    body.push(TOUGH);
                }
                for (let j = 0; j < 21; j++) {
                    body.push(MOVE);
                }
                for (let j = 0; j < 10; j++) {
                    body.push(ATTACK);
                }
                for (let j = 0; j < 1; j++) {
                    body.push(HEAL);
                }
                if(body.length >= 42) {
                    break;
                }
            }
        }
        return this.spawnCreep(body, 'RemoteProtector' + Game.time, {memory: {role: 'remoteProtector', targetRoom: targetRoom,
                                                                          homeRoom: this.room.name, superProtector: superProtector}});
}

StructureSpawn.prototype.spawnRemoteRoadRepairer =
    function (energyLimit, roadToBuild, roadToRepair, remoteName) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor(energy / 550);
        for (let i = 0; i < suit; i++) {
            body.push(CARRY);
            body.push(CARRY);
            body.push(CARRY);
            body.push(CARRY);
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
            body.push(MOVE);
            body.push(MOVE);
            if (body.length >= 27)
                break;
        }
        return this.spawnCreep(body, 'RemoteRoadRepairer' + Game.time, {memory: {role: 'remoteRoadRepairer',
                            roadToBuild: roadToBuild, roadToRepair: roadToRepair, homeRoom: this.room.name, remoteName: remoteName}});
}

StructureSpawn.prototype.spawnClaimer =
    function (energyLimit, targetRoom) {
        var body = [];
        body.push(CLAIM);
        body.push(MOVE);
        return this.spawnCreep(body, 'Claimer' + Game.time, {memory: {role: 'claimer', targetRoom: targetRoom, homeRoom: this.room.name}});
}

StructureSpawn.prototype.spawnSpawnBuilder =
    function (energyLimit, targetRoom) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 200);
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 18) {
                break;
            }
        }
        return this.spawnCreep(body, 'SpawnBuilder' + Game.time, {memory: {role: 'spawnBuilder', targetRoom: targetRoom, homeRoom: this.room.name}});
}

StructureSpawn.prototype.spawnWallDestroyer =
    function (energyLimit, targetRoom, wallId) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 150);
        for (let i = 0; i < suit; i++) {
            body.push(WORK);
            body.push(MOVE);
            if(body.length >= 12) {
                break;
            }
        }
        return this.spawnCreep(body, 'WallDestroyer' + Game.time, {memory: {role: 'wallDestroyer', targetRoom: targetRoom,
                                                          homeRoom: this.room.name, wall: wallId}});
}

StructureSpawn.prototype.spawnStorageWorker =
    function (energyLimit) {
        var body = [];
        var energy = energyLimit;
        var suit = Math.floor((energy) / 150);
        for (let i = 0; i < suit; i++) {
            body.push(CARRY);
            body.push(MOVE);
            body.push(CARRY);
            if(body.length >= 15) {
                break;
            }
        }
        return this.spawnCreep(body, 'StorageWorker' + Game.time, {memory: {role: 'storageWorker'}});
}
