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
            // @ts-ignore
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            // @ts-ignore
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
        const securityWithIexSecurity = yield repository.getInvalidatedSecurities();
        if (!securityWithIexSecurity)
            return res.json({});
        return res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity));
    }));
    app.get('/:securityId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const securityId = req.params.securityId;
        const securityWithIexSecurity = yield repository.getSecurity(securityId);
        if (!securityWithIexSecurity)
            return res.json({});
        return res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity));
    }));
    app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.security) {
            const security = req.body.security;
            const securityId = req.body.securityId;
            yield repository.updateSecurity(securityId, {
                address: security.address,
                address2: security.address2,
                ceo: security.ceo,
                companyName: security.companyName,
                country: security.country,
                description: security.description,
                employees: security.employees,
                exchange: security.exchange,
                industry: security.industry,
                issueType: security.issueType,
                logoUrl: security.logoUrl,
                phone: security.phone,
                primarySicCode: security.primarySicCode,
                sector: security.sector,
                securityId: security.securityId,
                securityName: security.securityName,
                state: security.state,
                symbol: security.symbol,
                tags: security.tags,
                website: security.website,
                zip: security.zip
            });
            yield repository.validateSecurity(req.body.security.symbol);
        }
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
const securityWithIexToSecurityAndIex = (s) => {
    return {
        security: {
            id: s.securityId,
            symbol: s.securitySymbol,
            companyName: s.securityCompanyName,
            exchange: s.securityExchange,
            industry: s.securityIndustry,
            website: s.securityWebsite,
            description: s.securityDescription,
            ceo: s.securityCeo,
            securityName: s.securitySecurityName,
            issueType: s.securityIssueType,
            sector: s.securitySector,
            primarySicCode: s.securityPrimarySicCode,
            employees: s.securityEmployees,
            tags: s.securityTags,
            address: s.securityAddress,
            address2: s.securityAddress2,
            state: s.securityState,
            zip: s.securityZip,
            country: s.securityCountry,
            phone: s.securityPhone,
            logoUrl: s.securityLogoUrl,
            lastUpdated: s.securityLastUpdated,
            createdAt: s.securityCreatedAt,
            validated: null
        },
        iexSecurity: {
            id: s.iexId,
            symbol: s.iexSymbol,
            companyName: s.iexCompanyName,
            exchange: s.iexExchange,
            industry: s.iexIndustry,
            website: s.iexWebsite,
            description: s.iexDescription,
            ceo: s.iexCeo,
            securityName: s.iexSecurityName,
            issueType: s.iexIssueType,
            sector: s.iexSector,
            primarySicCode: s.iexPrimarySicCode,
            employees: s.iexEmployees,
            tags: s.iexTags,
            address: s.iexAddress,
            address2: s.iexAddress2,
            state: s.iexState,
            zip: s.iexZip,
            country: s.iexCountry,
            phone: s.iexPhone,
            logoUrl: s.iexLogoUrl,
            lastUpdated: s.iexLastUpdated,
            createdAt: s.iexCreatedAt,
            validated: s.iexValidated,
        }
    };
};
class Repository {
    constructor(db) {
        this.validateSecurity = (symbol) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query("UPDATE iex_security SET validated = TRUE WHERE symbol = $1", [symbol]);
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
                   created_at
            FROM security
            WHERE lower(symbol) like lower($1)
            LIMIT 10`;
            const insert = `%${query}%`;
            const response = yield this.db.query(queryStr, [insert]);
            if (response.rows.length <= 0)
                return [];
            return response.rows.map((row) => ({
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
                validated: false,
            }));
        });
        this.getInvalidatedSecurities = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT s.id                 security_id,
                   s.symbol             security_symbol,
                   s.company_name       security_company_name,
                   s.exchange           security_exchange,
                   s.industry           security_industry,
                   s.website            security_website,
                   s.description        security_description,
                   s.ceo                security_ceo,
                   s.security_name      security_security_name,
                   s.issue_type         security_issue_type,
                   s.sector             security_sector,
                   s.primary_sic_code   security_primary_sic_code,
                   s.employees          security_employees,
                   s.tags               security_tags,
                   s.address            security_address,
                   s.address2           security_address2,
                   s.state              security_state,
                   s.zip                security_zip,
                   s.country            security_country,
                   s.phone              security_phone,
                   s.logo_url           security_logo_url,
                   s.last_updated       security_last_updated,
                   s.created_at         security_created_at,
                   iex.id               iex_id,
                   iex.symbol           iex_symbol,
                   iex.company_name     iex_company_name,
                   iex.exchange         iex_exchange,
                   iex.industry         iex_industry,
                   iex.website          iex_website,
                   iex.description      iex_description,
                   iex.ceo              iex_ceo,
                   iex.security_name    iex_security_name,
                   iex.issue_type       iex_issue_type,
                   iex.sector           iex_sector,
                   iex.primary_sic_code iex_primary_sic_code,
                   iex.employees        iex_employees,
                   iex.tags             iex_tags,
                   iex.address          iex_address,
                   iex.address2         iex_address2,
                   iex.state            iex_state,
                   iex.zip              iex_zip,
                   iex.country          iex_country,
                   iex.phone            iex_phone,
                   iex.logo_url         iex_logo_url,
                   iex.last_updated     iex_last_updated,
                   iex.created_at       iex_created_at,
                   iex.validated        iex_validated
            FROM security s
                     LEFT JOIN
                 iex_security iex
                 ON
                     iex.symbol = s.symbol
            WHERE iex.validated = FALSE
            LIMIT 1;`);
            if (response.rows.length <= 0)
                return null;
            const row = response.rows[0];
            return {
                securityId: row.security_id,
                securitySymbol: row.security_symbol,
                securityCompanyName: row.security_company_name,
                securityExchange: row.security_exchange,
                securityIndustry: row.security_industry,
                securityWebsite: row.security_website,
                securityDescription: row.security_description,
                securityCeo: row.security_ceo,
                securitySecurityName: row.security_security_name,
                securityIssueType: row.security_issue_type,
                securitySector: row.security_sector,
                securityPrimarySicCode: row.security_primary_sic_code,
                securityEmployees: row.security_employees,
                securityTags: row.security_tags,
                securityAddress: row.security_address,
                securityAddress2: row.security_address2,
                securityState: row.security_state,
                securityZip: row.security_zip,
                securityCountry: row.security_country,
                securityPhone: row.security_phone,
                securityLogoUrl: row.security_logo_url,
                securityLastUpdated: luxon_1.DateTime.fromJSDate(row.security_last_updated),
                securityCreatedAt: luxon_1.DateTime.fromJSDate(row.security_created_at),
                iexId: row.iex_id,
                iexSymbol: row.iex_symbol,
                iexCompanyName: row.iex_company_name,
                iexExchange: row.iex_exchange,
                iexIndustry: row.iex_industry,
                iexWebsite: row.iex_website,
                iexDescription: row.iex_description,
                iexCeo: row.iex_ceo,
                iexSecurityName: row.iex_security_name,
                iexIssueType: row.iex_issue_type,
                iexSector: row.iex_sector,
                iexPrimarySicCode: row.iex_primary_sic_code,
                iexEmployees: row.iex_employees,
                iexTags: row.iex_tags,
                iexAddress: row.iex_address,
                iexAddress2: row.iex_address2,
                iexState: row.iex_state,
                iexZip: row.iex_zip,
                iexCountry: row.iex_country,
                iexPhone: row.iex_phone,
                iexLogoUrl: row.iex_logo_url,
                iexLastUpdated: luxon_1.DateTime.fromJSDate(row.iex_last_updated),
                iexCreatedAt: luxon_1.DateTime.fromJSDate(row.iex_created_at),
                iexValidated: row.iex_validated
            };
        });
        this.updateSecurity = (securityId, s) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query(`
            UPDATE
                security
            SET company_name=$1,
                exchange=$2,
                industry=$3,
                website=$4,
                description=$5,
                ceo=$6,
                security_name=$7,
                issue_type=$8,
                sector=$9,
                primary_sic_code=$10,
                employees=$11,
                tags=$12,
                address=$13,
                address2=$14,
                state=$15,
                zip=$16,
                country=$17,
                phone=$18,
                logo_url=$19,
                last_updated=NOW()
            WHERE id = $20;`, [s.companyName, s.exchange, s.industry, s.website, s.description, s.ceo,
                s.securityName, s.issueType, s.securityName, s.primarySicCode, s.employees, s.tags, s.address,
                s.address2, s.state, s.zip, s.country, s.phone, s.logoUrl, securityId]);
        });
        this.getSecurity = (securityId) => __awaiter(this, void 0, void 0, function* () {
            let queryStr = `
            SELECT s.id                 security_id,
                   s.symbol             security_symbol,
                   s.company_name       security_company_name,
                   s.exchange           security_exchange,
                   s.industry           security_industry,
                   s.website            security_website,
                   s.description        security_description,
                   s.ceo                security_ceo,
                   s.security_name      security_security_name,
                   s.issue_type         security_issue_type,
                   s.sector             security_sector,
                   s.primary_sic_code   security_primary_sic_code,
                   s.employees          security_employees,
                   s.tags               security_tags,
                   s.address            security_address,
                   s.address2           security_address2,
                   s.state              security_state,
                   s.zip                security_zip,
                   s.country            security_country,
                   s.phone              security_phone,
                   s.logo_url           security_logo_url,
                   s.last_updated       security_last_updated,
                   s.created_at         security_created_at,
                   iex.id               iex_id,
                   iex.symbol           iex_symbol,
                   iex.company_name     iex_company_name,
                   iex.exchange         iex_exchange,
                   iex.industry         iex_industry,
                   iex.website          iex_website,
                   iex.description      iex_description,
                   iex.ceo              iex_ceo,
                   iex.security_name    iex_security_name,
                   iex.issue_type       iex_issue_type,
                   iex.sector           iex_sector,
                   iex.primary_sic_code iex_primary_sic_code,
                   iex.employees        iex_employees,
                   iex.tags             iex_tags,
                   iex.address          iex_address,
                   iex.address2         iex_address2,
                   iex.state            iex_state,
                   iex.zip              iex_zip,
                   iex.country          iex_country,
                   iex.phone            iex_phone,
                   iex.logo_url         iex_logo_url,
                   iex.last_updated     iex_last_updated,
                   iex.created_at       iex_created_at,
                   iex.validated        iex_validated
            FROM SECURITY s
                     LEFT JOIN
                 iex_security iex
                 ON
                     iex.symbol = s.symbol
            WHERE s.id = $1;`;
            const response = yield this.db.query(queryStr, [securityId]);
            if (response.rows.length <= 0)
                throw new Error("no security exists for that id");
            const row = response.rows[0];
            return {
                securityId: row.security_id,
                securitySymbol: row.security_symbol,
                securityCompanyName: row.security_company_name,
                securityExchange: row.security_exchange,
                securityIndustry: row.security_industry,
                securityWebsite: row.security_website,
                securityDescription: row.security_description,
                securityCeo: row.security_ceo,
                securitySecurityName: row.security_security_name,
                securityIssueType: row.security_issue_type,
                securitySector: row.security_sector,
                securityPrimarySicCode: row.security_primary_sic_code,
                securityEmployees: row.security_employees,
                securityTags: row.security_tags,
                securityAddress: row.security_address,
                securityAddress2: row.security_address2,
                securityState: row.security_state,
                securityZip: row.security_zip,
                securityCountry: row.security_country,
                securityPhone: row.security_phone,
                securityLogoUrl: row.security_logo_url,
                securityLastUpdated: luxon_1.DateTime.fromJSDate(row.security_last_updated),
                securityCreatedAt: luxon_1.DateTime.fromJSDate(row.security_created_at),
                iexId: row.iex_id,
                iexSymbol: row.iex_symbol,
                iexCompanyName: row.iex_company_name,
                iexExchange: row.iex_exchange,
                iexIndustry: row.iex_industry,
                iexWebsite: row.iex_website,
                iexDescription: row.iex_description,
                iexCeo: row.iex_ceo,
                iexSecurityName: row.iex_security_name,
                iexIssueType: row.iex_issue_type,
                iexSector: row.iex_sector,
                iexPrimarySicCode: row.iex_primary_sic_code,
                iexEmployees: row.iex_employees,
                iexTags: row.iex_tags,
                iexAddress: row.iex_address,
                iexAddress2: row.iex_address2,
                iexState: row.iex_state,
                iexZip: row.iex_zip,
                iexCountry: row.iex_country,
                iexPhone: row.iex_phone,
                iexLogoUrl: row.iex_logo_url,
                iexLastUpdated: luxon_1.DateTime.fromJSDate(row.iex_last_updated),
                iexCreatedAt: luxon_1.DateTime.fromJSDate(row.iex_created_at),
                iexValidated: row.iex_validated
            };
        });
        this.db = db;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vcm1hbGl6ZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsc0RBQThCO0FBQzlCLGdEQUF1QjtBQUN2QiwyQkFBOEM7QUFDOUMscUVBQWdFO0FBQ2hFLGlDQUErQjtBQUMvQixrREFBMkM7QUFDM0MsOERBQXFDO0FBQ3JDLG9EQUE0QjtBQUM1QiwwREFBaUM7QUFDakMsZ0RBQXdCO0FBR3hCLE1BQU0sR0FBRyxHQUFHLEdBQVMsRUFBRTtJQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFM0IsTUFBTSxNQUFNLEdBQUcsSUFBQSxnQkFBTSxFQUFDO1FBQ2xCLE9BQU8sRUFBRSxJQUFBLG1CQUFRLEVBQUM7WUFDZCxFQUFFLEVBQUUsRUFBRTtZQUNOLEdBQUcsRUFBRSxhQUFhO1lBQ2xCLE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsYUFBYTtZQUNiLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDN0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsYUFBYTtZQUNiLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDeEIsYUFBYTtnQkFDYixNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFDN0IsTUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFD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