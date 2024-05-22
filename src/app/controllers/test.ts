import { Request, Response, NextFunction } from "express";
import { socketInstance } from "../..";

class TestController {
    testSocketIo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id_user = req.body.data.id_user;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_user);
            if (findUser) {
                io.to(findUser.socket).emit("test", "hello");
            }

            res.status(200).json({ message: "success" });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new TestController();