const ROLES = {
    harvester: require('role.harvester'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    distributor: require('role.distributor'),
    upgrader: require('role.upgrader'),
    reserver: require('role.reserver'),
    remoteCreator: require('role.remoteCreator'),
    remoteHarvester: require('role.remoteHarvester'),
    remoteDistributor: require('role.remoteDistributor'),
    remoteProtector: require('role.remoteProtector'),
    remoteRoadRepairer: require('role.remoteRoadRepairer'),
    spawnBuilder: require('role.spawnBuilder'),
    claimer: require('role.claimer'),
    wallDestroyer: require('role.wallDestroyer'),
    storageWorker: require('role.storageWorker')
};

Creep.prototype.runRole =
    function () {
        try {
            if (ROLES[this.memory.role] && ROLES[this.memory.role].run && !this.spawning) {
                ROLES[this.memory.role].run(this);
            }
        } catch (e) {
            console.log(e.stack);
        }
    }
