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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxDuration = void 0;
exports.POST = POST;
var ai_1 = require("ai");
var effect_1 = require("effect");
var db_1 = require("#/lib/db");
var schemas_1 = require("#/lib/schemas");
exports.maxDuration = 30;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, generateMealPlan, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request.json()];
                case 1:
                    prompt = (_a.sent()).prompt;
                    generateMealPlan = effect_1.Effect.gen(function () {
                        var result, todayTimestamp_1, oneDayInSeconds_1, mealInserts_1;
                        var _this = this;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [5 /*yield**/, __values(effect_1.Effect.promise(function () {
                                        return (0, ai_1.generateObject)({
                                            model: "xai/grok-3",
                                            prompt: prompt ||
                                                "You are a personal chef for our family. Create a weekly dinner plan with simple, delicious, and healthy meals for 3 people. Generate 7 different meals with variety and nutrition in mind.",
                                            schema: schemas_1.mealPlanSchema,
                                        });
                                    }))];
                                case 1:
                                    result = _b.sent();
                                    if (!((_a = result.object) === null || _a === void 0 ? void 0 : _a.meals)) return [3 /*break*/, 3];
                                    todayTimestamp_1 = Math.floor(Date.now() / 1000);
                                    oneDayInSeconds_1 = 24 * 60 * 60;
                                    mealInserts_1 = result.object.meals.map(function (meal, index) {
                                        return (0, schemas_1.convertMealForInsert)(meal, todayTimestamp_1 + index * oneDayInSeconds_1);
                                    });
                                    return [5 /*yield**/, __values(effect_1.Effect.promise(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var insertResult;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, db_1.db.insert(db_1.meals).values(mealInserts_1)];
                                                    case 1:
                                                        insertResult = _a.sent();
                                                        return [2 /*return*/, insertResult];
                                                }
                                            });
                                        }); }))];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [2 /*return*/, result.toJsonResponse()];
                            }
                        });
                    });
                    return [4 /*yield*/, effect_1.Effect.runPromise(effect_1.Effect.catchAll(generateMealPlan, function (error) {
                            return effect_1.Effect.sync(function () {
                                console.error("Error in POST handler:", error);
                                return new Response("Internal server error", { status: 500 });
                            });
                        }))];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
