"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dtExchanger = exports.dtExchange = exports.functionNames = exports.prefixes = exports.schemas = exports.$userProperty = exports.$request = void 0;
exports.$request = "request";
exports.$userProperty = "(".concat(exports.$request, "->>'user_id')::UUID");
exports.schemas = {
    TEMP: "pg_temp",
    DEFAULT: "public"
};
exports.prefixes = {
    API: "api",
    DATA: "data"
};
exports.functionNames = {
    INSERT: "insert",
    UPDATE: "update",
    LIST: "list",
    GET: "get"
};
exports.dtExchange = {
    "bigserial": "BIGINT",
    "timestamptz": "TIMESTAMP WITH TIME ZONE",
    "date": "date",
    "MONEY": "decimal"
};
function dtExchanger(type) {
    return exports.dtExchange[(type === null || type === void 0 ? void 0 : type.toLowerCase()) || ""] || type || "";
}
exports.dtExchanger = dtExchanger;
