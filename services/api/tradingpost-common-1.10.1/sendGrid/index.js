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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendByTemplate = void 0;
const configuration_1 = require("../configuration");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const defaultFrom = "no-reply@tradingpostapp.com";
const sendByTemplate = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, from = defaultFrom, templateId, dynamicTemplateData, apiKey = (yield configuration_1.DefaultConfig.fromCacheOrSSM("sendgrid")).key } = config;
    mail_1.default.setApiKey(apiKey);
    return mail_1.default.send({
        to,
        from,
        templateId,
        dynamicTemplateData,
    });
});
exports.sendByTemplate = sendByTemplate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBZ0Q7QUFDaEQsMERBQXFDO0FBRXJDLE1BQU0sV0FBVyxHQUFHLDZCQUE2QixDQUFBO0FBRTFDLE1BQU0sY0FBYyxHQUFHLENBQU8sTUFNcEMsRUFBRSxFQUFFO0lBQ0QsTUFBTSxFQUNGLEVBQUUsRUFDRixJQUFJLEdBQUcsV0FBVyxFQUNsQixVQUFVLEVBQ1YsbUJBQW1CLEVBQ25CLE1BQU0sR0FBRyxDQUFDLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQ2hFLEdBQUcsTUFBTSxDQUFBO0lBQ1YsY0FBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixPQUFPLGNBQVEsQ0FBQyxJQUFJLENBQUM7UUFDakIsRUFBRTtRQUNGLElBQUk7UUFDSixVQUFVO1FBQ1YsbUJBQW1CO0tBQ3RCLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQSxDQUFBO0FBckJZLFFBQUEsY0FBYyxrQkFxQjFCIn0=