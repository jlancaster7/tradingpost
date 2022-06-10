import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import {engine} from 'express-handlebars';
import crypto from 'crypto';
import bodyParser from "body-parser";
import logger from 'morgan';
import FinicityApi from '../../common/finicity';
import 'dotenv/config';
import fs from 'fs'
import {DateTime} from "luxon";

interface Config {
    finicityAppKey: string
    finicityPartnerId: string
    finicityPartnerSecret: string
}

const cfg: Config = {
    finicityAppKey: process.env.FINICITY_APP_KEY || '',
    finicityPartnerId: process.env.FINICITY_PARTNER_ID || '',
    finicityPartnerSecret: process.env.FINICTY_PARTNER_SECRET || ''
};

const run = async () => {
    const finicityApi = new FinicityApi();
    // Check to see if file exists, if it does, then pull in creds, if they are out of date then make request to update it
    // otherwise, keep processing
    try {
        const {token, expires} = JSON.parse(fs.readFileSync('./finicity-api-token.json', 'utf8'));
        DateTime.fromSeconds(expires)
    } catch (e) {
        const response = await finicityApi.partnerAuthentication(cfg.finicityPartnerId, cfg.finicityPartnerSecret, cfg.finicityAppKey)
        fs.writeFileSync('./finicity-api-token.json', JSON.stringify({
            token: response?.token,
            expires: DateTime.now().plus({hour: 1, minute: 30}).toUnixInteger()
        }), {
            encoding: 'utf8'
        })
    }
}


// const getHashedPassword = (password: string): string => {
//     const sha256 = crypto.createHash('sha256');
//     return sha256.update(password).digest('base64');
// }
//
// const generateAuthToken = () => {
//     return crypto.randomBytes(30).toString('hex');
// }
//
// const requireAuth = (req: any, res: any, next: any) => {
//     if (req.user) {
//         next();
//     } else {
//
//         res.redirect('login', 404, {
//             message: 'Please login to continue',
//             messageClass: 'alert-danger'
//         })
//     }
// }
//
// const users = [
//     {
//         username: 'dj',
//         password: getHashedPassword('myPass1234!'),
//     }
// ]
// const app = express();
// app.engine('handlebars', engine());
// app.set('view engine', 'handlebars');
// app.set('views', path.join(__dirname, 'views'));
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
// app.use(cookieParser());
//
// const authTokens: Record<string, any> = {};
// app.use((req, res, next) => {
//     const authToken = req.cookies['AuthToken'];
//     req.user = authTokens[authToken];
//     next();
// })
//
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.get('/', (req, res) => {
//     res.render('home');
// });
//
// app.get('/login', (req, res) => {
//     res.render('login');
// })
//
// app.post('/login', (req, res) => {
//     const {username, password} = req.body;
//     const hashedPassword = getHashedPassword(password);
//     const user = users.find(u => {
//         return u.username === username && hashedPassword === u.password
//     });
//
//     if (!user) return res.render('login', {
//         message: 'Invalid username or password',
//         messageClass: 'alert-danger'
//     });
//
//     const authToken = generateAuthToken();
//     authTokens[authToken] = user;
//
//     res.cookie('AuthToken', authToken);
//     res.redirect('/brokerage');
// });
//
// app.get('/brokerage', requireAuth, (req, res) => {
//     res.render('brokerage')
// })
//
//
// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });
//
// // error handler
// app.use(function (err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: { locals: { message: any; error: any; }; status: (arg0: any) => void; render: (arg0: string) => void; }, next: any) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });
//
// module.exports = app;