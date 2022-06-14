"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
class Configuration {
    constructor(ssmClient) {
        this.fromSSM = (path) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.ssmClient
                    .getParameter({ Name: path, WithDecryption: true })
                    .promise();
                const parameter = res.Parameter;
                if (parameter === undefined)
                    return {};
                if (parameter.Value === undefined)
                    return {};
                return JSON.parse(parameter.Value);
            }
            catch (e) {
                throw e;
            }
        });
        this.ssmClient = ssmClient;
    }
}
exports.Configuration = Configuration;
