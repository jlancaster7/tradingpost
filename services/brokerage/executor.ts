import 'dotenv/config'
import RealizefiProvider from "./realizefi-provider";
import Realizefi from '@tradingpost/common/realizefi';
import Repository from './repository';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise from 'pg-promise';
import BrokerageService from "./service";

(async () => {
    const postgresConfiguration = await DefaultConfig.fromSSM("postgres");
    const pgp = pgPromise({});
    const conn = pgp({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    })

    const realizefi = new Realizefi(
        process.env.REALIZEFI_SECRET_KEY || "",
        process.env.REALIZEFI_AUTH_URLS || "",
    );

    const repository = new Repository(conn, pgp);
    const realizefiProvider = new RealizefiProvider(realizefi, repository);
    // const userId = 'usr_DCEwWdTVMg3exFlUVMic4Rhgr851kz8p';
    // const institutionId = 'il_UlaMrIsnVBGLCuME9todgFh1rweYkblX';
    // await realizefiProvider.importPositions(userId)

    const brokerageService = new BrokerageService(realizefiProvider, repository);
    await brokerageService.newRealizefiAccounts('')
})()