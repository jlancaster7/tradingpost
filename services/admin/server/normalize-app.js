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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var pg_1 = require("pg");
var configuration_1 = require("@tradingpost/common/configuration");
var luxon_1 = require("luxon");
var client_s3_1 = require("@aws-sdk/client-s3");
var body_parser_1 = __importDefault(require("body-parser"));
var multer_1 = __importDefault(require("multer"));
var multer_s3_1 = __importDefault(require("multer-s3"));
var path_1 = __importDefault(require("path"));
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var s3, upload, postgresConfiguration, pgClient, app, port, repository, runningMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                s3 = new client_s3_1.S3Client({});
                upload = (0, multer_1.default)({
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
                            var filename = req.query.filename;
                            var ext = path_1.default.extname(file.originalname);
                            cb(null, "".concat(filename, "-").concat(Date.now().toString()).concat(ext));
                        }
                    })
                });
                return [4 /*yield*/, configuration_1.DefaultConfig.fromCacheOrSSM("postgres")];
            case 1:
                postgresConfiguration = _a.sent();
                pgClient = new pg_1.Client({
                    host: postgresConfiguration.host,
                    user: postgresConfiguration.user,
                    password: postgresConfiguration.password,
                    database: postgresConfiguration.database,
                    port: 5432,
                });
                return [4 /*yield*/, pgClient.connect()];
            case 2:
                _a.sent();
                app = (0, express_1.default)();
                port = 8080;
                app.use(express_1.default.json());
                app.use((0, cors_1.default)());
                app.use(body_parser_1.default.json());
                app.use(body_parser_1.default.urlencoded({ extended: false }));
                repository = new Repository(pgClient);
                return [4 /*yield*/, setupRoutes(app, repository, upload)];
            case 3:
                _a.sent();
                runningMessage = "Server running at http://localhost:".concat(port);
                app.listen(port, function () {
                    console.log(runningMessage);
                });
                return [2 /*return*/];
        }
    });
}); };
var setupRoutes = function (app, repository, upload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var securityWithIexSecurity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repository.getInvalidatedSecurities()];
                    case 1:
                        securityWithIexSecurity = _a.sent();
                        if (!securityWithIexSecurity)
                            return [2 /*return*/, res.json({})];
                        return [2 /*return*/, res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity))];
                }
            });
        }); });
        app.get('/:securityId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var securityId, securityWithIexSecurity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        securityId = req.params.securityId;
                        return [4 /*yield*/, repository.getSecurity(securityId)];
                    case 1:
                        securityWithIexSecurity = _a.sent();
                        if (!securityWithIexSecurity)
                            return [2 /*return*/, res.json({})];
                        return [2 /*return*/, res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity))];
                }
            });
        }); });
        app.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var security, securityId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.security) return [3 /*break*/, 3];
                        security = req.body.security;
                        securityId = req.body.securityId;
                        return [4 /*yield*/, repository.updateSecurity(securityId, {
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
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, repository.validateSecurity(req.body.security.symbol)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, res.sendStatus(200)];
                }
            });
        }); });
        app.post('/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var query, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = req.body.query;
                        return [4 /*yield*/, repository.search(query)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, res.json(response)];
                }
            });
        }); });
        app.post('/upload', upload.single('new-security-image'), function (req, res, next) {
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
        return [2 /*return*/];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, run()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
var securityWithIexToSecurityAndIex = function (s) {
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
var Repository = /** @class */ (function () {
    function Repository(db) {
        var _this = this;
        this.validateSecurity = function (symbol) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("UPDATE iex_security SET validated = TRUE WHERE symbol = $1", [symbol])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.search = function (query, opts) { return __awaiter(_this, void 0, void 0, function () {
            var queryStr, insert, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryStr = "\n            SELECT id,\n                   symbol,\n                   company_name,\n                   exchange,\n                   industry,\n                   website,\n                   description,\n                   ceo,\n                   security_name,\n                   issue_type,\n                   sector,\n                   primary_sic_code,\n                   employees,\n                   tags,\n                   address,\n                   address2,\n                   state,\n                   zip,\n                   country,\n                   phone,\n                   logo_url,\n                   last_updated,\n                   created_at\n            FROM security\n            WHERE lower(symbol) like lower($1)\n            LIMIT 10";
                        insert = "%".concat(query, "%");
                        return [4 /*yield*/, this.db.query(queryStr, [insert])];
                    case 1:
                        response = _a.sent();
                        if (response.rows.length <= 0)
                            return [2 /*return*/, []];
                        return [2 /*return*/, response.rows.map(function (row) { return ({
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
                            }); })];
                }
            });
        }); };
        this.getInvalidatedSecurities = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n            SELECT s.id                 security_id,\n                   s.symbol             security_symbol,\n                   s.company_name       security_company_name,\n                   s.exchange           security_exchange,\n                   s.industry           security_industry,\n                   s.website            security_website,\n                   s.description        security_description,\n                   s.ceo                security_ceo,\n                   s.security_name      security_security_name,\n                   s.issue_type         security_issue_type,\n                   s.sector             security_sector,\n                   s.primary_sic_code   security_primary_sic_code,\n                   s.employees          security_employees,\n                   s.tags               security_tags,\n                   s.address            security_address,\n                   s.address2           security_address2,\n                   s.state              security_state,\n                   s.zip                security_zip,\n                   s.country            security_country,\n                   s.phone              security_phone,\n                   s.logo_url           security_logo_url,\n                   s.last_updated       security_last_updated,\n                   s.created_at         security_created_at,\n                   iex.id               iex_id,\n                   iex.symbol           iex_symbol,\n                   iex.company_name     iex_company_name,\n                   iex.exchange         iex_exchange,\n                   iex.industry         iex_industry,\n                   iex.website          iex_website,\n                   iex.description      iex_description,\n                   iex.ceo              iex_ceo,\n                   iex.security_name    iex_security_name,\n                   iex.issue_type       iex_issue_type,\n                   iex.sector           iex_sector,\n                   iex.primary_sic_code iex_primary_sic_code,\n                   iex.employees        iex_employees,\n                   iex.tags             iex_tags,\n                   iex.address          iex_address,\n                   iex.address2         iex_address2,\n                   iex.state            iex_state,\n                   iex.zip              iex_zip,\n                   iex.country          iex_country,\n                   iex.phone            iex_phone,\n                   iex.logo_url         iex_logo_url,\n                   iex.last_updated     iex_last_updated,\n                   iex.created_at       iex_created_at,\n                   iex.validated        iex_validated\n            FROM security s\n                     LEFT JOIN\n                 iex_security iex\n                 ON\n                     iex.symbol = s.symbol\n            WHERE iex.validated = FALSE\n            LIMIT 1;")];
                    case 1:
                        response = _a.sent();
                        if (response.rows.length <= 0)
                            return [2 /*return*/, null];
                        row = response.rows[0];
                        return [2 /*return*/, {
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
                            }];
                }
            });
        }); };
        this.updateSecurity = function (securityId, s) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n            UPDATE\n                security\n            SET company_name=$1,\n                exchange=$2,\n                industry=$3,\n                website=$4,\n                description=$5,\n                ceo=$6,\n                security_name=$7,\n                issue_type=$8,\n                sector=$9,\n                primary_sic_code=$10,\n                employees=$11,\n                tags=$12,\n                address=$13,\n                address2=$14,\n                state=$15,\n                zip=$16,\n                country=$17,\n                phone=$18,\n                logo_url=$19,\n                last_updated=NOW()\n            WHERE id = $20;", [s.companyName, s.exchange, s.industry, s.website, s.description, s.ceo,
                            s.securityName, s.issueType, s.securityName, s.primarySicCode, s.employees, s.tags, s.address,
                            s.address2, s.state, s.zip, s.country, s.phone, s.logoUrl, securityId])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.getSecurity = function (securityId) { return __awaiter(_this, void 0, void 0, function () {
            var queryStr, response, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryStr = "\n            SELECT s.id                 security_id,\n                   s.symbol             security_symbol,\n                   s.company_name       security_company_name,\n                   s.exchange           security_exchange,\n                   s.industry           security_industry,\n                   s.website            security_website,\n                   s.description        security_description,\n                   s.ceo                security_ceo,\n                   s.security_name      security_security_name,\n                   s.issue_type         security_issue_type,\n                   s.sector             security_sector,\n                   s.primary_sic_code   security_primary_sic_code,\n                   s.employees          security_employees,\n                   s.tags               security_tags,\n                   s.address            security_address,\n                   s.address2           security_address2,\n                   s.state              security_state,\n                   s.zip                security_zip,\n                   s.country            security_country,\n                   s.phone              security_phone,\n                   s.logo_url           security_logo_url,\n                   s.last_updated       security_last_updated,\n                   s.created_at         security_created_at,\n                   iex.id               iex_id,\n                   iex.symbol           iex_symbol,\n                   iex.company_name     iex_company_name,\n                   iex.exchange         iex_exchange,\n                   iex.industry         iex_industry,\n                   iex.website          iex_website,\n                   iex.description      iex_description,\n                   iex.ceo              iex_ceo,\n                   iex.security_name    iex_security_name,\n                   iex.issue_type       iex_issue_type,\n                   iex.sector           iex_sector,\n                   iex.primary_sic_code iex_primary_sic_code,\n                   iex.employees        iex_employees,\n                   iex.tags             iex_tags,\n                   iex.address          iex_address,\n                   iex.address2         iex_address2,\n                   iex.state            iex_state,\n                   iex.zip              iex_zip,\n                   iex.country          iex_country,\n                   iex.phone            iex_phone,\n                   iex.logo_url         iex_logo_url,\n                   iex.last_updated     iex_last_updated,\n                   iex.created_at       iex_created_at,\n                   iex.validated        iex_validated\n            FROM SECURITY s\n                     LEFT JOIN\n                 iex_security iex\n                 ON\n                     iex.symbol = s.symbol\n            WHERE s.id = $1;";
                        return [4 /*yield*/, this.db.query(queryStr, [securityId])];
                    case 1:
                        response = _a.sent();
                        if (response.rows.length <= 0)
                            throw new Error("no security exists for that id");
                        row = response.rows[0];
                        return [2 /*return*/, {
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
                            }];
                }
            });
        }); };
        this.db = db;
    }
    return Repository;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vcm1hbGl6ZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsb0RBQThCO0FBQzlCLDhDQUF1QjtBQUN2Qix5QkFBOEM7QUFDOUMsbUVBQWdFO0FBQ2hFLCtCQUErQjtBQUMvQixnREFBMkM7QUFDM0MsNERBQXFDO0FBQ3JDLGtEQUE0QjtBQUM1Qix3REFBaUM7QUFDakMsOENBQXdCO0FBR3hCLElBQU0sR0FBRyxHQUFHOzs7OztnQkFDRixFQUFFLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUVyQixNQUFNLEdBQUcsSUFBQSxnQkFBTSxFQUFDO29CQUNsQixPQUFPLEVBQUUsSUFBQSxtQkFBUSxFQUFDO3dCQUNkLEVBQUUsRUFBRSxFQUFFO3dCQUNOLEdBQUcsRUFBRSxhQUFhO3dCQUNsQixNQUFNLEVBQUUsb0JBQW9CO3dCQUM1QixhQUFhO3dCQUNiLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTs0QkFDN0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQzt3QkFDRCxhQUFhO3dCQUNiLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTs0QkFDeEIsYUFBYTs0QkFDTixJQUFBLFFBQVEsR0FBSSxHQUFHLENBQUMsS0FBSyxTQUFiLENBQWM7NEJBQzdCLElBQU0sR0FBRyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUM1QyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQUcsUUFBUSxjQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FB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