import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import {Client, Client as PGClient} from 'pg';
import {DefaultConfig} from "@tradingpost/common/configuration";
import {DateTime} from "luxon";
import {S3Client} from '@aws-sdk/client-s3'
import bodyParser from 'body-parser';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';


const run = async () => {
    const s3 = new S3Client({})

    const upload = multer({
        storage: multerS3({
            s3: s3,
            acl: 'public-read',
            bucket: 'tradingpost-images',
            // @ts-ignore
            metadata: function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            },
            // @ts-ignore
            key: function (req, file, cb) {
                // @ts-ignore
                const {filename} = req.query;
                const ext = path.extname(file.originalname);
                cb(null, `${filename}-${Date.now().toString()}${ext}`);
            }
        })
    })

    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = new Client({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database,
        port: 5432,
    });

    await pgClient.connect();
    const app: express.Application = express();
    const port = 8080;
    app.use(express.json())
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const repository = new Repository(pgClient);
    await setupRoutes(app, repository, upload);

    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage)
    })
}

const setupRoutes = async (app: express.Application, repository: IRepository, upload: multer.Multer) => {
    app.get('/', async (req: express.Request, res: express.Response) => {
        const securityWithIexSecurity = await repository.getInvalidatedSecurities();
        if (!securityWithIexSecurity) return res.json({});
        return res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity));
    })

    app.get('/:securityId', async (req: express.Request, res: express.Response) => {
        const securityId = req.params.securityId as unknown as bigint;
        const securityWithIexSecurity = await repository.getSecurity(securityId);
        if (!securityWithIexSecurity) return res.json({});
        return res.json(securityWithIexToSecurityAndIex(securityWithIexSecurity));
    });

    app.post('/', async (req: express.Request, res: express.Response) => {
        if (req.body.security) {
            const security = req.body.security;
            const securityId = req.body.securityId;
            await repository.updateSecurity(securityId, {
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
            })
            await repository.validateSecurity(req.body.security.symbol)
        }
        return res.sendStatus(200);
    });

    app.post('/search', async (req: express.Request, res: express.Response) => {
        const {query} = req.body;
        const response = await repository.search(query);
        return res.json(response);
    });

    app.post('/upload', upload.single('new-security-image'), (req, res, next) => {
        res.send({
            message: "Uploaded",
            imageMeta: {
                fil: req.file?.filename,
                encoding: req.file?.encoding,
                mimeType: req.file?.mimetype,
                // @ts-ignore
                url: req.file?.location
            }
        })
    })
}

(async () => {
    await run()
})()

type SecurityWithIexSecurity = {
    securityId: bigint
    securitySymbol: string
    securityCompanyName: string
    securityExchange: string
    securityIndustry: string
    securityWebsite: string
    securityDescription: string
    securityCeo: string
    securitySecurityName: string
    securityIssueType: string
    securitySector: string
    securityPrimarySicCode: string
    securityEmployees: string
    securityTags: string[]
    securityAddress: string
    securityAddress2: string
    securityState: string
    securityZip: string
    securityCountry: string
    securityPhone: string
    securityLogoUrl: string
    securityLastUpdated: DateTime
    securityCreatedAt: DateTime

    iexId: bigint
    iexSymbol: string
    iexCompanyName: string
    iexExchange: string
    iexIndustry: string
    iexWebsite: string
    iexDescription: string
    iexCeo: string
    iexSecurityName: string
    iexIssueType: string
    iexSector: string
    iexPrimarySicCode: string
    iexEmployees: string
    iexTags: string[]
    iexAddress: string
    iexAddress2: string
    iexState: string
    iexZip: string
    iexCountry: string
    iexPhone: string
    iexLogoUrl: string
    iexLastUpdated: DateTime
    iexCreatedAt: DateTime
    iexValidated: boolean
}

type Security = {
    id: bigint
    symbol: string
    companyName: string | null
    exchange: string | null
    industry: string | null
    website: string | null
    description: string | null
    ceo: string | null
    securityName: string | null
    issueType: string | null
    sector: string | null
    primarySicCode: string | null
    employees: string | null
    tags: string[] | null
    address: string | null
    address2: string | null
    state: string | null
    zip: string | null
    country: string | null
    phone: string | null
    logoUrl: string | null
    lastUpdated: DateTime | null
    createdAt: DateTime | null
    validated: boolean | null
}

type OverrideSecurity = {
    securityId: bigint | null
    symbol: string | null
    companyName: string | null
    exchange: string | null
    industry: string | null
    website: string | null
    description: string | null
    ceo: string | null
    securityName: string | null
    issueType: string | null
    sector: string | null
    primarySicCode: string | null
    employees: string | null
    tags: string[] | null
    address: string | null
    address2: string | null
    state: string | null
    zip: string | null
    country: string | null
    phone: string | null
    logoUrl: string | null
}

type QueryOpts = {
    onlyValidated: boolean
}

type SecurityAndIexSecurity = {
    security: Security
    iexSecurity: Security
}

interface IRepository {
    getInvalidatedSecurities(): Promise<SecurityWithIexSecurity | null>

    getSecurity(securityId: bigint): Promise<SecurityWithIexSecurity>

    validateSecurity(symbol: string): Promise<void>

    updateSecurity(securityId: bigint, s: OverrideSecurity): Promise<void>

    search(query: string, opts?: QueryOpts): Promise<Security[]>
}

const securityWithIexToSecurityAndIex = (s: SecurityWithIexSecurity): SecurityAndIexSecurity => {
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
    }
}

class Repository implements IRepository {
    private db: PGClient;

    constructor(db: PGClient) {
        this.db = db;
    }

    validateSecurity = async (symbol: string): Promise<void> => {
        await this.db.query("UPDATE iex_security SET validated = TRUE WHERE symbol = $1", [symbol]);
    }

    search = async (query: string, opts?: QueryOpts): Promise<Security[]> => {
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
            WHERE lower(symbol) like lower($1) COLLATE "tr-TR-x-icu"
            LIMIT 10`
        const insert = `%${query}%`;

        const response = await this.db.query(queryStr, [insert]);

        if (response.rows.length <= 0) return [];
        return response.rows.map((row: any) => ({
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
            lastUpdated: DateTime.fromJSDate(row.last_updated),
            createdAt: DateTime.fromJSDate(row.created_at),
            validated: false,
        }));
    }

    getInvalidatedSecurities = async (): Promise<SecurityWithIexSecurity | null> => {
        const response = await this.db.query(`
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
            LIMIT 1;`)
        if (response.rows.length <= 0) return null;
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
            securityLastUpdated: DateTime.fromJSDate(row.security_last_updated),
            securityCreatedAt: DateTime.fromJSDate(row.security_created_at),
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
            iexLastUpdated: DateTime.fromJSDate(row.iex_last_updated),
            iexCreatedAt: DateTime.fromJSDate(row.iex_created_at),
            iexValidated: row.iex_validated
        }
    }

    updateSecurity = async (securityId: bigint, s: OverrideSecurity): Promise<void> => {
        await this.db.query(`
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
            s.address2, s.state, s.zip, s.country, s.phone, s.logoUrl, securityId])
    }

    getSecurity = async (securityId: bigint): Promise<SecurityWithIexSecurity> => {
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
            WHERE s.id = $1;`
        const response = await this.db.query(queryStr, [securityId]);
        if (response.rows.length <= 0) throw new Error("no security exists for that id");
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
            securityLastUpdated: DateTime.fromJSDate(row.security_last_updated),
            securityCreatedAt: DateTime.fromJSDate(row.security_created_at),
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
            iexLastUpdated: DateTime.fromJSDate(row.iex_last_updated),
            iexCreatedAt: DateTime.fromJSDate(row.iex_created_at),
            iexValidated: row.iex_validated
        }
    }
}

