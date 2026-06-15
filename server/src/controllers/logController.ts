import { RequestHandler } from "express";
import { prismaClient } from "../apps/database.js";

export const indexLog:RequestHandler = async (req, res) => {
    try {
        const response = await prismaClient.log.findMany({
            include: {
                tasks: true,
                users: true
            }
        })

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil logs.",
            data: response
        })
    } catch (error) {
        
    }
}