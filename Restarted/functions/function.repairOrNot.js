var repairOrNot = { 
	run: function(s) { 
		return ((s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) 
	                        																			&& s.hits < s.hitsMax * 0.8) ||
	                                						((s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) 
	                                																			  && s.hits < 12000) ||
	                                						(s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER &&
	                               		s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL && s.hits < s.hitsMax);
	}
}

module.exports = repairOrNot;
