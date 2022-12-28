import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import { init, initOutput } from "./src/init"
import { SearchAndRespond } from './src/searchAndRespond';
import { GPU } from "gpu.js";


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
        const startTime = new Date()
        console.log(`Processing request ${startTime.toTimeString()}`)
        try {
            const response = await respond.answerQuestionUsingContext(req.body.symbol, req.body.prompt);
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
        catch (err) {
            console.error(err)
            return res.json({});
        }
       

    });

}

(async () => {
    await run()
})()