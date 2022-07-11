"use strict";
// Then we are going create a frontend that will page over all securities that have not been "checked"
// if that security has been checked, we will not display it as a result set
// In the UI if we Check check mark then mark it checked
// In UI if we update a field, allocate a record in override, build relationship and check as checked
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
// Next steps..... every friday we should kick off a job that compares the securities table and
// the resposne from companies to see if anything has changed, if it has, then we should toggle the check
// mark to OFF and push a chat into Teams for further investigation
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const configuration_1 = require("@tradingpost/common/configuration");
const luxon_1 = require("luxon");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const repository = new Repository(pgClient);
    yield setupRoutes(app, repository);
    const runningMessage = `Server running at http://localhost:${port}`;
    app.listen(port, () => {
        console.log(runningMessage);
    });
});
const setupRoutes = (app, repository) => __awaiter(void 0, void 0, void 0, function* () {
    app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const security = yield repository.getUncheckedSecurities();
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
        console.log("Finsihed");
        return res.sendStatus(200);
    }));
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
class Repository {
    constructor(db) {
        this.checkSecurity = (id) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query("UPDATE securities SET validated = TRUE WHERE id = $1", [id]);
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
        this.db = db;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vcm1hbGl6ZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNHQUFzRztBQUN0Ryw0RUFBNEU7QUFDNUUsd0RBQXdEO0FBQ3hELHFHQUFxRzs7Ozs7Ozs7Ozs7Ozs7QUFFckcsK0ZBQStGO0FBQy9GLHlHQUF5RztBQUN6RyxtRUFBbUU7QUFDbkUseUJBQXNCO0FBQ3RCLHNEQUE4QjtBQUM5QixnREFBdUI7QUFDdkIsMkJBQThDO0FBQzlDLHFFQUFnRTtBQUNoRSxpQ0FBK0I7QUFFL0IsTUFBTSxHQUFHLEdBQUcsR0FBUyxFQUFFO0lBQ25CLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RSxNQUFNLFFBQVEsR0FBRyxJQUFJLFdBQU0sQ0FBQztRQUN4QixJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtRQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtRQUN4QyxJQUFJLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLE1BQU0sR0FBRyxHQUF3QixJQUFBLGlCQUFPLEdBQUUsQ0FBQztJQUMzQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7SUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGNBQUksR0FBRSxDQUFDLENBQUM7SUFFaEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUMsTUFBTSxXQUFXLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRW5DLE1BQU0sY0FBYyxHQUFHLHNDQUFzQyxJQUFJLEVBQUUsQ0FBQztJQUNwRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUMvQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQSxDQUFBO0FBRUQsTUFBTSxXQUFXLEdBQUcsQ0FBTyxHQUF3QixFQUFFLFVBQXVCLEVBQUUsRUFBRTtJQUM1RSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFPLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxFQUFFO1FBQy9ELE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDM0QsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFPLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxFQUFFO1FBQ2hFLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbkMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDdkMsTUFBTSxVQUFVLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFO2dCQUNoRCxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJO2dCQUNqQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJO2dCQUNuQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJO2dCQUN6QixXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJO2dCQUN6QyxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJO2dCQUNqQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJO2dCQUN6QyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJO2dCQUNyQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJO2dCQUNuQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJO2dCQUNuQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJO2dCQUNyQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJO2dCQUNqQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssSUFBSSxJQUFJO2dCQUM3QixjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWMsSUFBSSxJQUFJO2dCQUMvQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJO2dCQUMvQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsSUFBSSxJQUFJO2dCQUN2QyxZQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVksSUFBSSxJQUFJO2dCQUMzQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssSUFBSSxJQUFJO2dCQUM3QixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJO2dCQUMvQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJO2dCQUMzQixPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJO2dCQUNqQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJO2FBQzVCLENBQUMsQ0FBQTtTQUNMO1FBQ0QsTUFBTSxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN2QixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFBO0FBRUQsQ0FBQyxHQUFTLEVBQUU7SUFDUixNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2YsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBO0FBNkRKLE1BQU0sVUFBVTtJQUdaLFlBQVksRUFBWTtRQUl4QixrQkFBYSxHQUFHLENBQU8sRUFBVSxFQUFpQixFQUFFO1lBQ2hELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsc0RBQXNELEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsR0FBbUMsRUFBRTtZQUMxRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBMkJ6QixDQUFDLENBQUE7WUFDYixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDM0MsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixPQUFPO2dCQUNILEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDVixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07Z0JBQ2xCLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWTtnQkFDN0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO2dCQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7Z0JBQ3RCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO2dCQUM1QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7Z0JBQ1osWUFBWSxFQUFFLEdBQUcsQ0FBQyxhQUFhO2dCQUMvQixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7Z0JBQ3pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtnQkFDbEIsY0FBYyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7Z0JBQ3BDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztnQkFDeEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO2dCQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO2dCQUN0QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7Z0JBQ2hCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztnQkFDWixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3BCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztnQkFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRO2dCQUNyQixXQUFXLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztnQkFDbEQsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzlDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUzthQUMzQixDQUFBO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCwyQkFBc0IsR0FBRyxDQUFPLFVBQWtCLEVBQUUsUUFBMEIsRUFBaUIsRUFBRTtZQUM3RixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0VBOEJzQyxFQUN0RCxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDcEYsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsU0FBUztnQkFDL0YsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsT0FBTztnQkFDN0YsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBQ2pILENBQUMsQ0FBQSxDQUFBO1FBdEdHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FzR0oifQ==