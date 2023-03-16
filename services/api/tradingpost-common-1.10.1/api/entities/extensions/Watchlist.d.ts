import Extension from ".";
import { PriceInfo } from "../../cache";
import { AllWatchlists, IWatchlistGet, IWatchlistItemList } from "../interfaces";
export type IWatchlistGetExt = Omit<IWatchlistGet, "items"> & {
    items: (IWatchlistItemList & {
        price: PriceInfo["price"] | null;
    })[];
};
export default class extends Extension {
    getAllWatchlists: (settings?: undefined) => Promise<AllWatchlists>;
    saveWatchlist: (settings: {
        id: number;
        is_saved: boolean;
    }) => Promise<{
        id: number;
        is_saved: boolean;
    }>;
    toggleNotification: (settings: {
        id: number;
        is_notification: boolean;
    }) => Promise<boolean>;
}
