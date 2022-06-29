"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_handlebars_1 = require("express-handlebars");
const crypto_1 = __importDefault(require("crypto"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("@tradingpost/common/finicity/index"));
require("dotenv/config");
const cfg = {
    finicityAppKey: process.env.FINICITY_APP_KEY || '',
    finicityPartnerId: process.env.FINICITY_PARTNER_ID || '',
    finicityPartnerSecret: process.env.FINICITY_PARTNER_SECRET || '',
    finicityWebhook: process.env.FINICITY_WEBHOOK || ''
};
const app = (0, express_1.default)();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const finicity = new index_1.default(cfg.finicityPartnerId, cfg.finicityPartnerSecret, cfg.finicityAppKey);
    yield finicity.init();
    const getHashedPassword = (password) => {
        const sha256 = crypto_1.default.createHash('sha256');
        return sha256.update(password).digest('base64');
    };
    const generateAuthToken = () => {
        return crypto_1.default.randomBytes(30).toString('hex');
    };
    const requireAuth = (req, res, next) => {
        if (req.user) {
            next();
        }
        else {
            res.redirect('/login', 404, {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    };
    const users = [
        {
            username: 'dj',
            password: getHashedPassword('myPass1234!'),
            finicityCustomerId: "6004456313",
            finicityCustomerUsername: "djbozentka",
            finicityCustomerCreated: "1655908987",
        }
    ];
    app.engine('handlebars', (0, express_handlebars_1.engine)());
    app.set('view engine', 'handlebars');
    app.set('views', path_1.default.join(__dirname, 'views'));
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    const authTokens = {};
    app.use((req, res, next) => {
        const authToken = req.cookies['AuthToken'];
        console.log("AUTH TOKEN: ", authToken);
        // @ts-ignore
        req.user = authTokens[authToken];
        next();
    });
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    app.get('/', (req, res) => {
        res.render('home');
    });
    app.get('/login', (req, res) => {
        res.render('login');
    });
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const hashedPassword = getHashedPassword(password);
        const user = users.find(u => {
            return u.username === username && hashedPassword === u.password;
        });
        if (!user)
            return res.render('login', {
                message: 'Invalid username or password',
                messageClass: 'alert-danger'
            });
        const authToken = generateAuthToken();
        authTokens[authToken] = user;
        res.cookie('AuthToken', authToken);
        res.redirect('/finicity/brokerage');
    });
    app.get('/finicity/brokerage', requireAuth, (req, res) => {
        res.render('brokerage', {
            apiToken: finicity.accessToken
        });
    });
    app.get('/finicity/brokerage/auth', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // @ts-ignore
            const { user } = req;
            const r = yield finicity.generateConnectUrl(user.finicityCustomerId, cfg.finicityWebhook);
            console.log("LINK: ", r);
            res.redirect(r.link);
        }
        catch (e) {
            console.log(e);
        }
    }));
    app.post("/finicity/customer/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Adding finciity partner");
            const { username, applicationId } = req.body;
            const r = yield finicity.addCustomer(applicationId, username);
            res.json(r);
        }
        catch (e) {
            res.json({
                msg: "could not create a customer",
                err: e
            });
        }
    }));
    app.post("/finicity/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(req.body);
        res.sendStatus(200);
    }));
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next((0, http_errors_1.default)(404));
    });
    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    return app;
});
exports.appPromise = new Promise(function (resolve, reject) {
    run().then(app => {
        resolve(app);
    });
});
