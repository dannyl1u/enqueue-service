import express from "express";
import cors from "cors";
import { createClient } from 'redis';
require('dotenv').config();

import { Storage } from "@google-cloud/storage";
const storage = new Storage();
const bucketName = 'terraform_bucket-1234';

const app = express();
app.use(cors());
app.use(express.json());

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;

const publisher = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

publisher.connect();

app.post('/enqueue', async (req: express.Request, res: express.Response) => {
    const { id } = req.body;
    // upload a terraform file to gcp bucket
    publisher.lPush('upload-queue', id);
    publisher.hSet('upload-status', id, 'enqueued');
    res.json({
        id: id
    });
    // upload main.tf to gcp bucket
    const filename = 'main.tf';

    try {
        await storage.bucket(bucketName).upload(filename, {
            destination: `${id}.tf`
        });

        await publisher.lPush('upload-queue', id);
        await publisher.hSet('upload-status', id, 'enqueued');

        res.json({ id: id });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(7000, () => {
    console.log('Server is running on port 3000');
});