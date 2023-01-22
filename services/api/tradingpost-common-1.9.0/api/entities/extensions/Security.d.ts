import Extension from "./";
import { ISecurityList, ISecurityPrices } from "../interfaces";
export default class extends Extension {
    list: (settings?: undefined) => Promise<ISecurityList[]>;
    quickadd: (settings: {
        ticker: string;
        add: boolean;
    }) => Promise<void>;
    getPrices: (settings: {
        securityId: number;
        includeIntraday: boolean;
        includeHistorical: boolean;
    }) => Promise<ISecurityPrices>;
}
