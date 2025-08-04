"use server";
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
exports.subscribeUser = subscribeUser;
exports.unsubscribeUser = unsubscribeUser;
exports.sendNotification = sendNotification;
var check_env_var_1 = require("@repo/utils/check-env-var");
var effect_1 = require("effect");
var web_push_1 = require("web-push");
var vapidPublicKey = (0, check_env_var_1.checkEnvVar)("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
var vapidPrivateKey = (0, check_env_var_1.checkEnvVar)("VAPID_PRIVATE_KEY");
web_push_1.default.setVapidDetails("mailto:your-email@example.com", // TODO: Does it matter what I put here?
vapidPublicKey, vapidPrivateKey);
var subscription = null;
function subscribeUser(sub) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            subscription = sub;
            // TODO: In a production environment, you would want to store the subscription in a database
            // For example: await db.subscriptions.create({ data: sub })
            return [2 /*return*/, { success: true }];
        });
    });
}
function unsubscribeUser() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            subscription = null;
            // TODO: In a production environment, you would want to remove the subscription from the database
            // For example: await db.subscriptions.delete({ where: { ... } })
            return [2 /*return*/, { success: true }];
        });
    });
}
function sendNotification(message) {
    return __awaiter(this, void 0, void 0, function () {
        var sendPushNotification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sendPushNotification = effect_1.Effect.gen(function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!subscription) return [3 /*break*/, 2];
                                    return [5 /*yield**/, __values(effect_1.Effect.fail(new Error("No subscription available")))];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2: return [5 /*yield**/, __values(effect_1.Effect.promise(function () {
                                        return web_push_1.default.sendNotification(
                                        // @ts-expect-error -- TODO: Type is messed up - or code is actually wrong?
                                        subscription, JSON.stringify({
                                            title: "Family App Notification",
                                            body: message,
                                            icon: "/next.svg",
                                        }));
                                    }))];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    });
                    return [4 /*yield*/, effect_1.Effect.runPromise(effect_1.Effect.catchAll(sendPushNotification, function (error) {
                            return effect_1.Effect.sync(function () {
                                console.error("Error sending push notification:", error);
                                return { success: false, error: "Failed to send notification" };
                            });
                        }))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
