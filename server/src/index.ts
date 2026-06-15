import express from "express";
import taskRouter from "./routers/taskRouter.js";
import cors from "cors";
import { IndexUser } from "./controllers/userController.js"
import { indexLog } from "./controllers/logController.js";

const app = express();
const port = 3100;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(express.json());


app.use('/api/task', taskRouter);
app.get('/api/users', IndexUser);
app.get('/api/logs', indexLog);

app.get("/", (req, res) => {
    res.send("Hello, typescript");
});


app.listen(port, () => {
    console.log(`Server is running in http://localhost:${port}`);
})