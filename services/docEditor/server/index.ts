import 'dotenv/config'
import {loginPass, loginToken, resetPassword, createLogin, createUser } from '@tradingpost/common/api/auth' 
import { DefaultConfig } from '@tradingpost/common/configuration';
import { apiUrl, PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
import jwt, { JwtPayload, verify } from 'jsonwebtoken';
import fs from 'fs';
import Express, { RequestHandler, response } from "express";
import cors from 'cors'
import bodyParser from 'body-parser';
import { healthCheck } from './healthcheck'



const run = async () => {
    
    const app: Express.Application = Express();
    const port = process.env.PORT || 8084;
    app.use(Express.json())
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get("/", healthCheck);


    await setupRoutes(app);

    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage)
    })
}

const setupRoutes = async (app: Express.Application) => {
    app.get('/list', async (req: Express.Request, res: Express.Response) => {
        try {
            const allFiles = fs.readdirSync('src/data/');
            const filesToSend = allFiles.filter(a => a.endsWith('_tagged.html'));
            return res.json({files: filesToSend});
        }
        catch (err) {
            return res.json({files: [], statusCode: 401, msg: 'No files available!'})
        }

    })
    app.get('/file', async (req: Express.Request, res: Express.Response) => {
        try {
            const allFiles = fs.readdirSync('src/data/');
            const fileName = req.query.fileName as string;
            
            if (!allFiles.includes(fileName)) return res.json({html: '', statusCode: 401, msg: 'File not found.'})
            const fileContents = fs.readFileSync(`src/data/${fileName}`).toString()
            return res.json({html: fileContents})
        }
        catch (err) {
            return res.json({html: '', statusCode: 401, msg: 'Unknown Error'})
        }  
    })
    app.post('/file', async (req: Express.Request, res: Express.Response) => {
        try {
            const fileName = req.body.fileName;
            const edittedHtml = req.body.edittedHtml;
    
            fs.writeFileSync(`src/data/${fileName}`, edittedHtml)
            return res.json({msg: 'success!'})
        }
        catch (err) {
            return res.json({statusCode: 401, msg: 'Unknown Error'})
        }

    })
}


(async () => {
    await run()
})()