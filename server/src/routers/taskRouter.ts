import express from "express";
import { createTask, deleteTask, indexTask } from "../controllers/taskController.js";
import { updateTask } from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.get('/', indexTask);
taskRouter.post('/create', createTask);
taskRouter.put('/update/:id', updateTask);
taskRouter.delete('/delete/:id', deleteTask);


export default taskRouter;