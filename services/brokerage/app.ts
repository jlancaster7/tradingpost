import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import {engine} from 'express-handlebars';
import crypto from 'crypto';
import bodyParser from "body-parser";
import logger from 'morgan';
import Finicity from '@tradingpost/common/finicity';
import 'dotenv/config';
import {UserInterface, Config} from "./custom";


const cfg: Config = {
    finicityAppKey: process.env.FINICITY_APP_KEY || '',
    finicityPartnerId: process.env.FINICITY_PARTNER_ID || '',
    finicityPartnerSecret: process.env.FINICITY_PARTNER_SECRET || '',
    finicityWebhook: process.env.FINICITY_WEBHOOK || ''
};

const app = express();

const run = async () => {
    const finicity = new Finicity(cfg.finicityPartnerId, cfg.finicityPartnerSecret, cfg.finicityAppKey);
    await finicity.init();
    console.log("Ready")
    const getHashedPassword = (password: string): string => {
        const sha256 = crypto.createHash('sha256');
        return sha256.update(password).digest('base64');
    }

    const generateAuthToken = () => {
        return crypto.randomBytes(30).toString('hex');
    }

    const requireAuth = (req: any, res: any, next: any) => {
        if (req.user) {
            next();
        } else {
            res.redirect('/login', 404, {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            })
        }
    }

    const users: UserInterface[] = [
        {
            authToken: "",
            username: 'dj',
            password: getHashedPassword('myPass1234!'),
            finicityCustomerId: "",
            finicityCustomerUsername: "",
            finicityCustomerCreated: undefined,
        }
    ]

    app.engine('handlebars', engine());
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, 'views'));
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    const authTokens: Record<string, any> = {};
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        const authToken = req.cookies['AuthToken'];
        console.log("AUTH TOKEN: ", authToken)
        // @ts-ignore
        req.user = authTokens[authToken];
        next();
    })

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.render('home');
    });

    app.get('/login', (req, res) => {
        res.render('login');
    })

    app.post('/login', (req, res) => {
        const {username, password} = req.body;
        const hashedPassword = getHashedPassword(password);
        const user = users.find(u => {
            return u.username === username && hashedPassword === u.password
        });

        if (!user) return res.render('login', {
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });

        const authToken = generateAuthToken();
        authTokens[authToken] = user;

        res.cookie('AuthToken', authToken);
        res.redirect('/finicity/brokerage');
    });

    app.get('/finicity/brokerage', requireAuth, (req, res) => {
        console.log("Broekrage...")
        res.render('brokerage')
    })

    app.get('/finicity/brokerage/auth', requireAuth, async (req, res) => {
        try {
            // @ts-ignore
            const {user} = req;
            const r = await finicity.generateConnectUrl(user.finicityCustomerId, cfg.finicityWebhook);
            console.log("LINK: ", r)
            res.redirect(r.link);
        } catch (e) {
            console.log(e);
        }
    });

    app.post("/finicity/customer/add", async (req, res) => {
        try {
            const {username, applicationId} = req.body
            const r = await finicity.addCustomer(applicationId, username)
            res.json(r);
        } catch (e) {
            res.json({
                msg: "could not create a customer",
                err: e
            })
        }
    })

    app.post("/finicity/webhook", async (req, res) => {
    })


// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

// error handler
    app.use(function (err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: { locals: { message: any; error: any; }; status: (arg0: any) => void; render: (arg0: string) => void; }, next: any) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    return app;
}

exports.appPromise = new Promise(function (resolve, reject) {
    run().then(app => {
        resolve(app)
    });
})

