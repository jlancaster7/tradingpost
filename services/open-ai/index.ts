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
import { healthCheck } from './healthcheck'
//import { GPU } from "gpu.js";
import { GPTAccount } from './src/gptAccount';


const run = async () => {
    
    const app: Express.Application = Express();
    const port = process.env.PORT || 8082;
    app.use(Express.json())
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get("/", healthCheck);

    const Init = await init();
    //const gpu = new GPU({ mode: 'cpu' });
    const Respond = new SearchAndRespond(Init
        //, gpu
        )    
    await setupRoutes(app, Respond, Init.gptAccount);

    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage)
    })
}

const setupRoutes = async (app: Express.Application, respond: SearchAndRespond, account: GPTAccount) => {
    app.post('/login', async (req: Express.Request, res: Express.Response) => {
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
    app.post('/createAccount', async (req: Express.Request, res: Express.Response) => {
        try {
            if (!req.body.email || !req.body.pass) throw new PublicError("Invalid Request", 401);
            const loginResult = await createLogin(req.body.email, req.body.pass);
            const userResult = await account.createAccount({
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                handle: req.body.username,
                dummy: false
            })
            await account.sendVerificationEmail(userResult.user_id, req.body.email);

            return res.json(userResult);
        } catch (err: any) {
            console.log(err)
            if (err.constraint === 'local_login_pkey') return res.json({token: '', statusCode: 401, msg: 'An account for this email address already exists.'});
            if (err.constraint === 'handle_unique') {
                await account.deleteLogin(req.body.email);
                return res.json({token: '', statusCode: 401, msg: 'This username is already in use. Please try a different one.'});
            }
            return res.json({token: '', statusCode: 403, msg: err.message});
        }
    });
    app.get('/getAccount', async (req: Express.Request, res: Express.Response) => {
        try {
            const token = await decodeToken(req);
            if (!token.sub) throw new PublicError("Invalid authorization token", 403);
            const result = await account.getAccountInfo(token.sub);
            return res.json({...result, verified: token.verified})
        } catch (err: any) {
            return res.json({userId: '', statusCode: err.statusCode, msg: err.message});
        }
    })
    app.post('/chatGPT/prompt', async (req: Express.Request, res: Express.Response) => {
        
        const startTime = new Date()
        console.log(`Processing request ${startTime.toTimeString()}`)
        try {
            const token = await decodeToken(req);
            if (!token.sub) throw new PublicError("Invalid authorization token", 403);
            const result = await account.getAccountInfo(token.sub);
            if (token.verified) {
                if (result.totalTokens - result.tokensUsed <= 0) throw new PublicError("You're all out of tokens! DM us on Twitter @chatwithmgmtGPT or email us at josh@tradingpostapp.com to be allocated more.", 401);
            }
            else {
                if (result.totalTokens - result.tokensUsed <= 15) throw new PublicError("To use your remaining 15 tokens please verify your email address! A verification email was sent from no-reply@tradingpostapp.com.", 401);
            }

            const response = await respond.answerQuestionUsingContext(req.body.symbol, req.body.prompt, token.sub);
            if (response) {
                const endTime = new Date()
                console.log(endTime.valueOf() - startTime.valueOf())
                console.log(`Returning Response ${endTime.toTimeString()}`)
                return res.json({answer: response});
            }
            else {
                return res.json({answer: '', statusCode: 403});
            }
        } 
        catch (err: any) {
            return res.json({answer: '', statusCode: err.statusCode, msg: err.message});
        }
    });
    app.post('/verify', async (req: Express.Request, res: Express.Response) => {
        try {
            await account.verifyAccount(req.body.verificationToken);
            return res.json({verified: true})
        } 
        catch (err: any) {
            return res.json({verified: false, msg: err.message})
        }
    })
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