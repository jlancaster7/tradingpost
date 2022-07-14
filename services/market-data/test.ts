import {DefaultConfig} from "@tradingpost/common/configuration/index";
import pgPromise from "pg-promise";

(async() => {
    const postgresConfiguration = await DefaultConfig.fromSSM("postgres");
    const pgp = pgPromise({});
    const conn = pgp({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    })

    await conn.connect();

    const data = await conn.result("SELECT symbol from security");
    console.log(data.rows)
})()