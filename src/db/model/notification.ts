const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class NotificationModel extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

NotificationModel.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.UUID
    },
    content: {
        type: DataTypes.STRING
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
    },
    name: {
        type: DataTypes.STRING
    },
    id_topic: {
        type: DataTypes.UUID
    },
    id_forum: {
        type: DataTypes.UUID
    },
    id_course: {
        type: DataTypes.UUID
    },
    course_name: {
        type: DataTypes.STRING
    },
    id_exam: {
        type: DataTypes.UUID
    },
    exam_name: {
        type: DataTypes.STRING,
    },
    id_assignment: {
        type: DataTypes.UUID
    }
}, {
    sequelize,
    tableName: 'notification',
});

module.exports = NotificationModel;
