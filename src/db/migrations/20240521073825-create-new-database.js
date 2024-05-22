'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notification', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      id_user: {
        type: Sequelize.UUID
      },
      id_topic: {
        type: Sequelize.UUID
      },
      id_forum: {
        type: Sequelize.UUID
      },
      id_course: {
        type: Sequelize.UUID
      },
      course_name: {
        type: Sequelize.STRING
      },
      id_exam: {
        type: Sequelize.UUID
      },
      exam_name: {
        type: Sequelize.STRING
      },
      id_assignment: {
        type: Sequelize.UUID
      },
      content: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      read: {
        type: Sequelize.BOOLEAN
      },
      createdAt: Sequelize.DATE,
      updatedAT: Sequelize.DATE
    });
    await queryInterface.createTable('room_socket', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      id_user: {
        type: Sequelize.UUID
      },
      room: {
        type: Sequelize.STRING
      }
    });
    await queryInterface.createTable('student-noti', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.UUID,
      },
      id_notification: {
        type: Sequelize.UUID,
        references: {
          model: 'notification',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('student-noti');
    await queryInterface.dropTable('room_socket');
    await queryInterface.dropTable('notification');
  }
};
