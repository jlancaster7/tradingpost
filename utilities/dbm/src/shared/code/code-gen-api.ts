import { functionNames, prefixes } from "./code-gen-config";
import { createSqlFunctionName, ensurePascalCase, resolveSchema } from "./code-gen-util";

export const makeApiDef = (entityName: string, isTest: boolean, can: {
    update: boolean,
    insert: boolean,
    list: boolean,
    get: boolean

}) => {
    const apiFunc = (key: keyof typeof functionNames) =>
        '"' + createSqlFunctionName(resolveSchema(isTest), prefixes.API, entityName, functionNames[key]) + '"';

    const entityPascaled = ensurePascalCase(entityName);
    const interfaces = [can.get ? `I${entityPascaled}Get` : "never", can.list ? `I${entityPascaled}List` : "never", can.insert ? `I${entityPascaled}Insert` : 'never', can.update ? `I${entityPascaled}Update` : 'never'];
    const inOut = interfaces.filter(s => s !== "never").join(",");
    return `import { EntityApi } from '../static/EntityApi'
import { ${inOut} } from '../interfaces'
import { ${entityPascaled} as Extensions } from './extensions'
class ${entityPascaled}Api extends EntityApi<${interfaces.join(",")}> {
    protected getFunction = ${can.get ? apiFunc("GET") : "''"};
    protected listFunction = ${can.list ? apiFunc("LIST") : "''"};
    protected insertFunction = ${can.insert ? apiFunc("INSERT") : "''"};
    protected updateFunction = ${can.update ? apiFunc("UPDATE") : "''"};
    extensions = new Extensions.default(this)
}
export default new ${entityPascaled}Api();
export type {${inOut}}
`
}
