const ROLES = {
    harvester: require('role.harvester'),
    builder: require('role.builder'),
    repairer: require('role.repairer')
};

Creep.prototype.runRole =
    function () {
        if (ROLES[this.memory.role] && ROLES[this.memory.role].run)
        ROLES[this.memory.role].run(this);
    }