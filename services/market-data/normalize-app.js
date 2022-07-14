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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const configuration_1 = require("@tradingpost/common/configuration");
const luxon_1 = require("luxon");
const client_s3_1 = require("@aws-sdk/client-s3");
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const s3 = new client_s3_1.S3Client({});
    const upload = (0, multer_1.default)({
        storage: (0, multer_s3_1.default)({
            s3: s3,
            acl: 'public-read',
            bucket: 'tradingpost-images',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                // @ts-ignore
                const { filename } = req.query;
                const ext = path_1.default.extname(file.originalname);
                cb(null, `${filename}-${Date.now().toString()}${ext}`);
            }
        })
    });
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = new pg_1.Client({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database,
        port: 5432,
    });
    yield pgClient.connect();
    const app = (0, express_1.default)();
    const port = 8080;
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: false }));
    const repository = new Repository(pgClient);
    yield setupRoutes(app, repository, upload);
    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage);
    });
});
const setupRoutes = (app, repository, upload) => __awaiter(void 0, void 0, void 0, function* () {
    app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const security = yield repository.getUncheckedSecurities();
        if (!security)
            return res.json({});
        return res.json(security);
    }));
    app.get('/:securityId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const securityId = req.params.securityId;
        const security = yield repository.getSecurity(securityId);
        if (!security)
            return res.json({});
        return res.json(security);
    }));
    app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.security) {
            const security = req.body.security;
            const securityId = req.body.securityId;
            yield repository.insertOverrideSecurity(securityId, {
                address: security.address || null,
                address2: security.address2 || null,
                ceo: security.ceo || null,
                companyName: security.companyName || null,
                country: security.country || null,
                description: security.description || null,
                employees: security.employees || null,
                exchange: security.exchange || null,
                industry: security.industry || null,
                issueType: security.issueType || null,
                logoUrl: security.logoUrl || null,
                phone: security.phone || null,
                primarySicCode: security.primarySicCode || null,
                sector: security.sector || null,
                securityId: security.securityId || null,
                securityName: security.securityName || null,
                state: security.state || null,
                symbol: security.symbol || null,
                tags: security.tags || null,
                website: security.website || null,
                zip: security.zip || null
            });
        }
        yield repository.checkSecurity(req.body.securityId);
        return res.sendStatus(200);
    }));
    app.post('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { query } = req.body;
        const response = yield repository.search(query);
        return res.json(response);
    }));
    app.post('/upload', upload.single('new-security-image'), (req, res, next) => {
        var _a, _b, _c, _d;
        res.send({
            message: "Uploaded",
            imageMeta: {
                fil: (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename,
                encoding: (_b = req.file) === null || _b === void 0 ? void 0 : _b.encoding,
                mimeType: (_c = req.file) === null || _c === void 0 ? void 0 : _c.mimetype,
                // @ts-ignore
                url: (_d = req.file) === null || _d === void 0 ? void 0 : _d.location
            }
        });
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
class Repository {
    constructor(db) {
        this.checkSecurity = (id) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query("UPDATE securities SET validated = TRUE WHERE id = $1", [id]);
        });
        this.search = (query, opts) => __awaiter(this, void 0, void 0, function* () {
            let queryStr = `
            SELECT id,
                   symbol,
                   company_name,
                   exchange,
                   industry,
                   website,
                   description,
                   ceo,
                   security_name,
                   issue_type,
                   sector,
                   primary_sic_code,
                   employees,
                   tags,
                   address,
                   address2,
                   state,
                   zip,
                   country,
                   phone,
                   logo_url,
                   last_updated,
                   created_at,
                   validated
            FROM securities
            WHERE lower(symbol) like lower($1)
            LIMIT 10`;
            const insert = `%${query}%`;
            const response = yield this.db.query(queryStr, [insert]);
            if (response.rows.length <= 0)
                return [];
            return response.rows.map(row => ({
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logo_url,
                lastUpdated: luxon_1.DateTime.fromJSDate(row.last_updated),
                createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                validated: row.validated
            }));
        });
        this.getUncheckedSecurities = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT id,
                   symbol,
                   company_name,
                   exchange,
                   industry,
                   website,
                   description,
                   ceo,
                   security_name,
                   issue_type,
                   sector,
                   primary_sic_code,
                   employees,
                   tags,
                   address,
                   address2,
                   state,
                   zip,
                   country,
                   phone,
                   logo_url,
                   last_updated,
                   created_at,
                   validated
            FROM securities
            WHERE validated = FALSE
            LIMIT 1`);
            if (response.rows.length <= 0)
                return null;
            const row = response.rows[0];
            return {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logo_url,
                lastUpdated: luxon_1.DateTime.fromJSDate(row.last_updated),
                createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                validated: row.validated
            };
        });
        this.insertOverrideSecurity = (securityId, security) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query(`INSERT INTO security_override
                             (security_id, symbol, company_name, exchange, industry, website,
                              description, ceo, security_name,
                              issue_type, sector, primary_sic_code, employees, tags, address, address2,
                              state, zip, country,
                              phone, logo_url, last_updated, created_at)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                                     $16, $17, $18, $19,
                                     $20, $21, NOW(), NOW())
                             ON CONFLICT (security_id)
                                 DO UPDATE SET symbol=EXCLUDED.symbol,
                                               company_name=EXCLUDED.company_name,
                                               exchange=EXCLUDED.exchange,
                                               industry=EXCLUDED.industry,
                                               website=EXCLUDED.website,
                                               description=EXCLUDED.description,
                                               ceo=EXCLUDED.ceo,
                                               security_name=EXCLUDED.security_name,
                                               issue_type=EXCLUDED.issue_type,
                                               sector=EXCLUDED.sector,
                                               primary_sic_code=EXCLUDED.primary_sic_code,
                                               employees=EXCLUDED.employees,
                                               tags=EXCLUDED.tags,
                                               address=EXCLUDED.address,
                                               address2=EXCLUDED.address2,
                                               state=EXCLUDED.state,
                                               zip=EXCLUDED.zip,
                                               country=EXCLUDED.country,
                                               phone=EXCLUDED.phone,
                                               logo_url=EXCLUDED.logo_url,
                                               last_updated=NOW()`, [securityId, security.symbol, security.companyName, security.exchange, security.industry,
                security.website, security.description, security.ceo, security.securityName, security.issueType,
                security.sector, security.primarySicCode, security.employees, security.tags, security.address,
                security.address2, security.state, security.zip, security.country, security.phone, security.logoUrl]);
        });
        this.getSecurity = (securityId) => __awaiter(this, void 0, void 0, function* () {
            let queryStr = `
            SELECT id,
                   symbol,
                   company_name,
                   exchange,
                   industry,
                   website,
                   description,
                   ceo,
                   security_name,
                   issue_type,
                   sector,
                   primary_sic_code,
                   employees,
                   tags,
                   address,
                   address2,
                   state,
                   zip,
                   country,
                   phone,
                   logo_url,
                   last_updated,
                   created_at,
                   validated
            FROM securities
            WHERE id = $1`;
            const response = yield this.db.query(queryStr, [securityId]);
            if (response.rows.length <= 0)
                throw new Error("no security exists for that id");
            const row = response.rows[0];
            return {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logo_url,
                lastUpdated: luxon_1.DateTime.fromJSDate(row.last_updated),
                createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                validated: row.validated
            };
        });
        this.db = db;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vcm1hbGl6ZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsc0RBQThCO0FBQzlCLGdEQUF1QjtBQUN2QiwyQkFBOEM7QUFDOUMscUVBQWdFO0FBQ2hFLGlDQUErQjtBQUMvQixrREFBMkM7QUFDM0MsOERBQXFDO0FBQ3JDLG9EQUE0QjtBQUM1QiwwREFBaUM7QUFDakMsZ0RBQXdCO0FBR3hCLE1BQU0sR0FBRyxHQUFHLEdBQVMsRUFBRTtJQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFM0IsTUFBTSxNQUFNLEdBQUcsSUFBQSxnQkFBTSxFQUFDO1FBQ2xCLE9BQU8sRUFBRSxJQUFBLG1CQUFRLEVBQUM7WUFDZCxFQUFFLEVBQUUsRUFBRTtZQUNOLEdBQUcsRUFBRSxhQUFhO1lBQ2xCLE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsUUFBUSxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUM3QixFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxHQUFHLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ3hCLGFBQWE7Z0JBQ2IsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQzdCLE1BQU0sR0FBRyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1QyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUM7U0FD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QkFBc0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hELE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ2pDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUk7Z0JBQ25DLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLElBQUk7Z0JBQ3pCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxJQUFJLElBQUk7Z0JBQ3pDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ2pDLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxJQUFJLElBQUk7Z0JBQ3pDLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxJQUFJLElBQUk7Z0JBQ3JDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUk7Z0JBQ25DLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUk7Z0JBQ25DLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxJQUFJLElBQUk7Z0JBQ3JDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ2pDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUk7Z0JBQzdCLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxJQUFJLElBQUk7Z0JBQy9DLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxJQUFJLElBQUk7Z0JBQy9CLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxJQUFJLElBQUk7Z0JBQ3ZDLFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWSxJQUFJLElBQUk7Z0JBQzNDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUk7Z0JBQzdCLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxJQUFJLElBQUk7Z0JBQy9CLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUk7Z0JBQzNCLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ2pDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLElB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