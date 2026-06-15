import { RequestHandler } from "express";
import { prismaClient } from "../apps/database.js";

export const IndexUser:RequestHandler = async (req, res) => {
    try {
        const response = await prismaClient.user.findMany({
            select: {
                id: true,
                username: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data user.',
            data: response
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error."
        });
        return;
    }
} 