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
            metadata: function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            },
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
        const security = await repository.getUncheckedSecurities();
        if (!security) return res.json({});
        return res.json(security);
    })

    app.get('/:securityId', async (req: express.Request, res: express.Response) => {
        const securityId = req.params.securityId as unknown as bigint;
        const security = await repository.getSecurity(securityId);
        if (!security) return res.json({});
        return res.json(security);
    });

    app.post('/', async (req: express.Request, res: express.Response) => {
        if (req.body.security) {
            const security = req.body.security;
            const securityId = req.body.securityId;
            await repository.insertOverrideSecurity(securityId, {
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
            })
        }
        await repository.checkSecurity(req.body.securityId)
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

type Security = {
    id: bigint
    symbol: string
    companyName: string
    exchange: string
    industry: string
    website: string
    description: string
    ceo: string
    securityName: string
    issueType: string
    sector: string
    primarySicCode: string
    employees: string
    tags: string[]
    address: string
    address2: string
    state: string
    zip: string
    country: string
    phone: string
    logoUrl: string
    lastUpdated: DateTime
    createdAt: DateTime
    validated: boolean
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

interface IRepository {
    getUncheckedSecurities(): Promise<Security | null>

    getSecurity(securityId: bigint): Promise<Security>

    checkSecurity(id: bigint): Promise<void>

    insertOverrideSecurity(securityId: bigint, security: OverrideSecurity): Promise<void>

    search(query: string, opts?: QueryOpts): Promise<Security[]>
}

class Repository implements IRepository {
    private db: PGClient;

    constructor(db: PGClient) {
        this.db = db;
    }

    checkSecurity = async (id: bigint): Promise<void> => {
        await this.db.query("UPDATE securities SET validated = TRUE WHERE id = $1", [id]);
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
                   created_at,
                   validated
            FROM securities
            WHERE lower(symbol) like lower($1)
            LIMIT 10`
        const insert = `%${query}%`;
        const response = await this.db.query(queryStr, [insert]);
        if (response.rows.length <= 0) return [];
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
            lastUpdated: DateTime.fromJSDate(row.last_updated),
            createdAt: DateTime.fromJSDate(row.created_at),
            validated: row.validated
        }));
    }

    getUncheckedSecurities = async (): Promise<Security | null> => {
        const response = await this.db.query(`
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
            LIMIT 1`)
        if (response.rows.length <= 0) return null;
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
            lastUpdated: DateTime.fromJSDate(row.last_updated),
            createdAt: DateTime.fromJSDate(row.created_at),
            validated: row.validated
        }
    }

    insertOverrideSecurity = async (securityId: bigint, security: OverrideSecurity): Promise<void> => {
        await this.db.query(`INSERT INTO security_override
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
                                               last_updated=NOW()`,
            [securityId, security.symbol, security.companyName, security.exchange, security.industry,
                security.website, security.description, security.ceo, security.securityName, security.issueType,
                security.sector, security.primarySicCode, security.employees, security.tags, security.address,
                security.address2, security.state, security.zip, security.country, security.phone, security.logoUrl])
    }

    getSecurity = async (securityId: bigint): Promise<Security> => {
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
            WHERE id = $1`
        const response = await this.db.query(queryStr, [securityId]);
        if (response.rows.length <= 0) throw new Error("no security exists for that id");
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
            lastUpdated: DateTime.fromJSDate(row.last_updated),
            createdAt: DateTime.fromJSDate(row.created_at),
            validated: row.validated
        }
    }
}

