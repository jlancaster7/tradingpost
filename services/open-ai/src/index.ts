import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import {Client, Client as PGClient} from 'pg';
import {DefaultConfig} from "@tradingpost/common/configuration";
import {DateTime} from "luxon";
import {S3Client} from '@aws-sdk/client-s3'
import bodyParser from 'body-parser';
import multer from 'multer';
import { init, initOutput } from "./init"
import { SearchAndRespond } from './searchAndRespond';
import { GPU } from "gpu.js";
import multerS3 from 'multer-s3';
import path from 'path';

const run = async () => {
    
    const app: express.Application = express();
    const port = 8080;
    app.use(express.json())
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const Init = await init();
    const gpu = new GPU({ mode: 'cpu' });
    const Respond = new SearchAndRespond(Init, gpu)    
    await setupRoutes(app, Respond);

    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage)
    })
}

const setupRoutes = async (app: express.Application, respond: SearchAndRespond) => {
    app.post('/login', async (req: express.Request, res: express.Response) => {
        
        return res.json();
    });
    app.post('/createAccount', async (req: express.Request, res: express.Response) => {
        
        return res.json();
    });
    app.post('/chatGPT/prompt', async (req: express.Request, res: express.Response) => {
        console.log('Processing request')
        
        const response = await respond.answerQuestionUsingContext(req.body.symbol, req.body.prompt);
        if (response.choices[0].text) {
            const parsedResponse = response.choices[0].text.replace('"', '').replace('"', '').replace('\n', '');
            return res.json({answer: parsedResponse});
        }
        else {
            return res.json({});
        }

    });

}

(async () => {
    await run()
})()