import { Api } from "@tradingpost/common/api";
import { useEffect, useState } from "react";
import { useData } from "./lds";

const fetchSecurities = async () => {
    console.log("I'm getting securities");
    const list = await Api.Security.extensions.list(),
        byId: Record<number, typeof list[0]> = {},
        bySymbol: Record<string, typeof list[0]> = {}
    list.forEach((r) => {
        byId[r.id] = r;
        bySymbol[r.symbol] = r;
    })
    return {
        list,
        byId,
        bySymbol
    }
}
let securityListTask: ReturnType<typeof fetchSecurities>
export const getSecurityList = () => securityListTask || (securityListTask = fetchSecurities())


export const useSecuritiesList = () => {

    const [err, setErr] = useState<any>()
    const { value: securities, setValue: setSecurities } = useData("securities");
    const [localValue, setLocalValue] = useState(securities)


    useEffect(() => {
        if (!securities)
            getSecurityList()
                .then((r) => {
                    setSecurities(r)
                    setLocalValue(r);
                }).catch(ex => setErr(ex));
    }, [securities])

    return {
        err,
        securities: localValue || {
            byId: {},
            bySymbol: {},
            list: []
        }
    }
}
