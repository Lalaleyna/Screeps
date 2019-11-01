var roleStorageWorker = {
  run: function (creep) {
      if (!creep.memory.infoPushed) {
          if (creep.ticksToLive <= creep.body.length * CREEP_SPAWN_TIME) {
              creep.room.memory.creepsToSpawn.push({role: creep.memory.role})
              creep.memory.infoPushed = true
          }
      }

      if (_.sum(creep.store) == creep.store.getCapacity()) {
          creep.memory.working = false
      }
      if (_.sum(creep.store) == 0) {
          creep.memory.working = true
      }

      if (creep.memory.working) {
        let mainLink = Game.getObjectById(creep.room.memory.mainLinkId);
        if (mainLink.store[RESOURCE_ENERGY] > 0) {
            if (creep.withdraw(mainLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
              creep.moveTo(mainLink);
        } else {
          if (!creep.memory.tombstone) {
            creep.memory.tombstone = creep.room.memory.tombstones[0];
          }
          let tombstone = Game.getObjectById(creep.memory.tombstone);
          if (tombstone && _.sum(tombstone.store)) {
            for (let sourceType in tombstone.store) {
              if (creep.withdraw(tombstone, sourceType) == ERR_NOT_IN_RANGE)
                creep.moveTo(tombstone);
            }
          }
        }
      } else {
        let storage = creep.room.storage;
        if (_.sum(storage.store) < storage.store.getCapacity() && creep.store[RESOURCE_ENERGY]) {
          if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(storage);
        } else {
          let terminal = creep.room.terminal;
          if (_.sum(terminal.store) < terminal.store.getCapacity()) {
            for (let sourceType in creep.store) {
              if (creep.transfer(terminal, sourceType) == ERR_NOT_IN_RANGE)
                creep.moveTo(terminal);
            }
          }
        }
      }
  }
}

module.exports = roleStorageWorker;
