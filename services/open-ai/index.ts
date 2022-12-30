import 'dotenv/config'
import {loginPass, loginToken, resetPassword, createLogin, createUser } from '@tradingpost/common/api/auth' 
import { DefaultConfig } from '@tradingpost/common/configuration';
import { PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
import jwt, { JwtPayload, verify } from 'jsonwebtoken';
import Express, { RequestHandler, response } from "express";
import cors from 'cors'
import bodyParser from 'body-parser';
import { init, initOutput } from "./src/init"
import { SearchAndRespond } from './src/searchAndRespond';
import { GPU } from "gpu.js";


const run = async () => {
    
    const app: Express.Application = Express();
    const port = 8080;
    app.use(Express.json())
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

const setupRoutes = async (app: Express.Application, respond: SearchAndRespond) => {
    app.post('/chatGPT/login', async (req: Express.Request, res: Express.Response) => {
        try {
            if (!req.body.pass) throw new PublicError("Unauthorized...", 401)
            else {
                if (req.body.email) return res.json(await loginPass(req.body.email, req.body.pass, ""));
                else return res.json(await loginToken(req.body.pass));
            }
        } catch (err: any) {
            return res.json({token: '', statusCode: err.statusCode, msg: err.message})
        }
        });
    app.post('/chatGPT/createAccount', async (req: Express.Request, res: Express.Response) => {
        try {
            if (!req.body.email || !req.body.pass) throw new PublicError("Invalid Request");
            const loginResult = await createLogin(req.body.email, req.body.pass);
            const userResult = await createUser({
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                handle: req.body.username,
                dummy: false
            })
            return res.json(userResult);
            
        } catch (err: any) {
            return res.json({token: '', statusCode: err.statusCode, msg: err.message});
        }
    });
    app.post('/chatGPT/prompt', async (req: Express.Request, res: Express.Response) => {
        
        const startTime = new Date()
        console.log(`Processing request ${startTime.toTimeString()}`)
        try {
            const token = await decodeToken(req);
            const response = await respond.answerQuestionUsingContext(req.body.symbol, req.body.prompt, token.sub);
            if (response.choices[0].text) {
                const parsedResponse = response.choices[0].text.replace('"', '').replace('"', '').replace('\n', '');
                const endTime = new Date()
                console.log(endTime.valueOf() - startTime.valueOf())
                console.log(`Returning Response ${endTime.toTimeString()}`)
                return res.json({answer: parsedResponse});
            }
            else {
                return res.json({});
            }
        } 
        catch (err: any) {
            console.error(err)
            return res.json({statusCode: err.statusCode, msg: err.message});
        }
    });
}
const decodeToken = async (req: Express.Request, disableModelCheck?: boolean) => {

    const bearerHeader = req.headers['authorization'];
    
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        if (bearer[0].toLowerCase() !== "bearer")
            throw new Error(`Invalid authorization type: "${bearer[0]}".`)

        const result = verify(bearer[1],
            await DefaultConfig.fromCacheOrSSM("authkey"));
            
        if (!disableModelCheck && !result.sub)
            throw new Error(`Invalid authorization token`);
        else
            return result as JwtPayload;

    } else {
        throw new Error("Unauthoized....");
    }
}

(async () => {
    await run()
})()