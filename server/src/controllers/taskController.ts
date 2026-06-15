import { RequestHandler } from "express";
import { prismaClient } from "../apps/database.js";
import { actionEnum } from "../../generated/prisma/enums.js";

export const indexTask:RequestHandler = async (req, res) => {
    try {
        const response = await prismaClient.task.findMany({});

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data task.',
            data: response
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error."
        });
        return;
    }
} 

export const createTask: RequestHandler = async (req, res) => {
    try {
        const { user_id, title, description } = req.body;

        // Validasi awal agar backend tidak crash jika user_id kosong
        if (!user_id) {
            res.status(400).json({
                success: false,
                message: "User ID (actor) wajib diisi."
            });
            return;
        }

        await prismaClient.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: {
                    title: title,
                    description: description,
                    // Jika di skema database kamu task juga terikat ke user,
                    // jangan lupa tambahkan relasi user_id di sini jika perlu.
                }
            });

            const log = await tx.log.create({
                data: {
                    // Paksa konversi ke Number untuk mengantisipasi tipe data string
                    actor_id: Number(user_id), 
                    task_id: task.id,
                    action: actionEnum.CREATE
                }
            });

            return { task, log };
        });

        res.json({
            success: true,
            message: "Berhasil menambah task."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error."
        });
    }
}

export const updateTask:RequestHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { user_id, title, description, status } = req.body;

        const transactions = await prismaClient.$transaction(async (tx) => {

            const taskNow = await tx.task.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    status: true,
                }
            });

            const updateTask = await tx.task.update({
                where:{ id: id },
                data:  {
                    title: title,
                    description: description,
                    status: status
                }
            });

            await tx.log.create({
                data: {
                    actor_id: user_id,
                    task_id: updateTask.id,
                    action: actionEnum.UPDATE,
                    from_status: taskNow?.status,
                    to_status: updateTask.status
                }
            });
            return { updateTask };
        });

        res.status(200).json({
            success: true,
            message: "Berhasil mengubah task.",
            data: transactions.updateTask
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error."
        });
        return;
    }
} 

export const deleteTask:RequestHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { user_id } = req.body;

        await prismaClient.$transaction(async (tx) => {
            const taskDelete = await tx.task.delete({
                where: { id: id }
            });

            await tx.log.create({
                data: {
                    actor_id: user_id,
                    action: actionEnum.DELETE,
                }
            });

            return { deleteTask };
        });

        res.status(200).json({
            success: true,
            message: "Berhasil menghapus task!"
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error."
        });
        return;
    }
}  