"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityApi_1 = require("../static/EntityApi");
const extensions_1 = require("./extensions");
class TradeApi extends EntityApi_1.EntityApi {
    constructor() {
        super(...arguments);
        this.getFunction = '';
        this.listFunction = '';
        this.insertFunction = '';
        this.updateFunction = '';
        this.apiCallName = 'TradeApi';
        this.extensions = new extensions_1.Trade.default(this);
    }
}
exports.default = new TradeApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhZGVBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUcmFkZUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUUvQyw2Q0FBa0Q7QUFDbEQsTUFBTSxRQUFTLFNBQVEscUJBQWtDO0lBQXpEOztRQUNjLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLGdCQUFXLEdBQUcsVUFBVSxDQUFDO1FBQ25DLGVBQVUsR0FBRyxJQUFJLGtCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLENBQUM7Q0FBQTtBQUNELGtCQUFlLElBQUksUUFBUSxFQUFFLENBQUMifQ==