import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

class CheckingNotification {
    checkTeacherSendNotification = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.teacher.data.id;

            
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}


module.exports = new CheckingNotification();