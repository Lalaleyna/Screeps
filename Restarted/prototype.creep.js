Creep.prototype.moveToRoom = function(roomName, opts = null)
{
    if (!opts)
        opts = {};
    
    opts.range = 22;
    
    let pos = new RoomPosition(24, 24, roomName);
    return this.moveTo(pos, opts);
}