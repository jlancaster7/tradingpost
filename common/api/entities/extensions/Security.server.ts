import { ensureServerExtensions } from ".";
import SecurityApi from "../static/SecurityApi";
import Security from "./Security";


export default ensureServerExtensions<Security>({
    list: () => SecurityApi.internal.list()
})