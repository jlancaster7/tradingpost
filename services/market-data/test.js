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
const deep_object_diff_1 = require("deep-object-diff");
(() => __awaiter(void 0, void 0, void 0, function* () {
    let obj1 = {
        name: 'Steve',
        foo: 'bar',
        age: 21
    };
    let obj2 = {
        foo: 'barr',
        age: 21,
        name: 'Steve'
    };
    console.log(Object.keys((0, deep_object_diff_1.diff)(obj1, obj2)).length === 0);
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBc0M7QUFFdEMsQ0FBQyxHQUFTLEVBQUU7SUFDUixJQUFJLElBQUksR0FBRztRQUNQLElBQUksRUFBRSxPQUFPO1FBQ2IsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsRUFBRTtLQUNWLENBQUE7SUFFRCxJQUFJLElBQUksR0FBRztRQUNQLEdBQUcsRUFBRSxNQUFNO1FBQ1gsR0FBRyxFQUFFLEVBQUU7UUFDUCxJQUFJLEVBQUUsT0FBTztLQUNoQixDQUFBO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUEsdUJBQUksRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUksQ0FBQyxDQUFDLENBQUE7QUFDMUQsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBIn0=