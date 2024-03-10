import express from "express";
import cors from "cors";
import { createClient } from 'redis';

const app = express();
app.use(cors());
app.use(express.json());

const publisher = createClient();
publisher.connect();

app.post('/enqueue', (req: express.Request, res: express.Response) => {
    const { id } = req.body;
    publisher.publish('ready', id);
    res.send('OK');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});