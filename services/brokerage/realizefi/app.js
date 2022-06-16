"use strict";
// import express from 'express';
// import expressWinston from 'express-winston';
// import winston from 'winston';
// import cookieParser from 'cookie-parser';
// import mustacheExpress from 'mustache-express';
// import bodyParser from 'body-parser';
// import { fileURLToPath, URLSearchParams } from 'url';
// import path from 'path';
// import dotenv from 'dotenv';
// import RealizeFi from './index.js';
// import cors from 'cors';
//
// dotenv.config();
//
// const port = process.env.APP_PORT;
// const realizefiBaseUrl = process.env.REALIZEFI_BASE_URL;
// const realizefiToken = process.env.REALIZEFI_TOKEN;
// const realizefiRedirectUrl = process.env.REALIZEFI_REDIRECT;
// const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// const app = express();
// app.set('views', `${__dirname}/views`);
// app.set('view engine', 'mustache');
// app.engine('mustache', mustacheExpress());
//
// app.use(cors());
// app.options("*", cors());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
// app.use(express.json());
// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     ),
//     meta: false,
//     msg: "HTTP  ",
//     expressFormat: true,
//     colorize: true,
//     ignoreRoute: function (req, res) { return false; }
// }));
//
// const realizefiApi = new RealizeFi(realizefiToken, realizefiBaseUrl, realizefiRedirectUrl);
//
// app.get('/', async (req, res) => {
//     const users = await realizefiApi.getUsers({});
//     res.render('index', {
//         data: JSON.stringify(users.data),
//         frontendBaseUrl: frontendBaseUrl
//     });
// });
//
// app.post("/api/realize", async(req, res) => {
//     const {action, ...rest} = req.body;
//     const response = await realizefiApi[action]({...rest});
//     res.json(response)
// });
//
// app.post("/api/realize/auth-portal", async(req, res) => {
//     const {userId} = req.body;
//     const response = await realizefiApi.authPortal({userId});
//     const {url} = response;
//     res.json({url});
// });
//
// app.get("/api/realize/redirect", async(req, res) => {
//     console.log(req.body);
//     console.log(req.path);
//     res.redirect('/')
// });
//
//
// app.listen(port, () => {
//     console.log(`Example app listening on port http://localhost:${port}`);
// });
