const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class RoomSocket extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RoomSocket.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.UUID
    },
    room: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    timestamps: false,
    tableName: 'room_socket',
});

module.exports = RoomSocket;
