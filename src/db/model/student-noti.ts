const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const NotificationModel = require('./notification');

class StudentNotification extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

StudentNotification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_student: {
        type: DataTypes.UUID
    },
    id_notification: {
        type: DataTypes.UUID
    }
}, {
    sequelize,
    tableName: 'student-noti',
    timestamps: false
});

StudentNotification.belongsTo(NotificationModel, { foreignKey: 'id_notification' });
NotificationModel.hasMany(StudentNotification, { foreignKey: 'id_notification', as: 'students' });

module.exports = StudentNotification;
