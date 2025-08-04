"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationManager = PushNotificationManager;
var check_env_var_1 = require("@repo/utils/check-env-var");
var react_1 = require("react");
var actions_1 = require("#/app/actions");
var utils_1 = require("../lib/utils");
function PushNotificationManager() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isSupported = _a[0], setIsSupported = _a[1];
    var _b = (0, react_1.useState)(null), subscription = _b[0], setSubscription = _b[1];
    var _c = (0, react_1.useState)(""), message = _c[0], setMessage = _c[1];
    var registerServiceWorker = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var registration, sub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.serviceWorker.register("/sw.js", {
                        scope: "/",
                        updateViaCache: "none",
                    })];
                case 1:
                    registration = _a.sent();
                    return [4 /*yield*/, registration.pushManager.getSubscription()];
                case 2:
                    sub = _a.sent();
                    setSubscription(sub);
                    return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            void registerServiceWorker();
        }
    }, [registerServiceWorker]);
    function subscribeToPush() {
        return __awaiter(this, void 0, void 0, function () {
            var registration, vapidPublicKey, sub, serializedSub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.serviceWorker.ready];
                    case 1:
                        registration = _a.sent();
                        vapidPublicKey = (0, check_env_var_1.checkEnvVar)("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
                        return [4 /*yield*/, registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: (0, utils_1.urlBase64ToUint8Array)(vapidPublicKey),
                            })];
                    case 2:
                        sub = _a.sent();
                        setSubscription(sub);
                        serializedSub = JSON.parse(JSON.stringify(sub));
                        return [4 /*yield*/, (0, actions_1.subscribeUser)(serializedSub)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function unsubscribeFromPush() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe())];
                    case 1:
                        _a.sent();
                        setSubscription(null);
                        return [4 /*yield*/, (0, actions_1.unsubscribeUser)()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function sendTestNotification() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!subscription) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, actions_1.sendNotification)(message)];
                    case 1:
                        _a.sent();
                        setMessage("");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    }
    if (!isSupported) {
        return (<p className="text-red-500">
				Push notifications are not supported in this browser.
			</p>);
    }
    return (<div className="mb-8 p-4 border rounded-lg">
			<h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
			{subscription ? (<>
					<p className="text-green-600 mb-4">
						You are subscribed to push notifications.
					</p>
					<div className="flex gap-2 mb-4">
						<input type="text" placeholder="Enter notification message" value={message} onChange={function (e) { return setMessage(e.target.value); }} className="flex-1 px-3 py-2 border rounded"/>
						<button type="button" onClick={sendTestNotification} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
							{" "}
							Send Test
						</button>
					</div>
					<button type="button" onClick={unsubscribeFromPush} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
						{" "}
						Unsubscribe
					</button>
				</>) : (<>
					<p className="text-gray-600 mb-4">
						You are not subscribed to push notifications.
					</p>
					<button type="button" onClick={subscribeToPush} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
						{" "}
						Subscribe
					</button>
				</>)}
		</div>);
}
