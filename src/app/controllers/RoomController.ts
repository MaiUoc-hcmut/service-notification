const RoomSocket = require('../../db/model/room');

import { Request, Response, NextFunction } from "express";
import { socketInstance } from "../..";

class RoomSocketController {

    // [GET] /room
    getAllRecords = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const records = await RoomSocket.findAll();
            
            for (const record of records) {
                console.log(record.id);
            }
            res.status(200).json(records);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [GET] /room/:userId
    getAllUserInRooms = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const userId = req.params.userId;
            const userInRooms = await RoomSocket.findAll({
                where: { id_user: userId },
                attribues: ['room'],
                through: {
                    attributes: []
                }
            });

            res.status(200).json(userInRooms);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /room
    userJoinToNewRoom = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { id_user, room } = req.body;

            const newUserInRoom = await RoomSocket.create({
                id_user,
                room
            });

            res.status(201).json(newUserInRoom);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }
}

module.exports = new RoomSocketController();