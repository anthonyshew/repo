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
exports.MealPlanner = MealPlanner;
var react_1 = require("@ai-sdk/react");
var Button_1 = require("@repo/ui/Button");
var badge_1 = require("@repo/ui/badge");
var card_1 = require("@repo/ui/card");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var schemas_1 = require("#/lib/schemas");
function MealPlanner() {
    var _this = this;
    var _a = (0, react_2.useState)(null), isRegeneratingFor = _a[0], setIsRegeneratingFor = _a[1];
    var _b = (0, react_2.useState)([]), dbMeals = _b[0], setDbMeals = _b[1];
    var _c = (0, react_1.experimental_useObject)({
        api: "/api/meals/day",
        schema: schemas_1.mealSchema,
    }), singleMealObject = _c.object, submitSingleMeal = _c.submit, isSingleMealLoading = _c.isLoading;
    // Fetch meals from database
    var fetchDbMeals = (0, react_2.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, meals, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/meals")];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    meals = _a.sent();
                    setDbMeals(meals);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Failed to fetch meals:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load meals from database on component mount
    (0, react_2.useEffect)(function () {
        void fetchDbMeals();
    }, [fetchDbMeals]);
    // Convert date to a consistent string format for storage
    var dateToKey = (0, react_2.useCallback)(function (date) { return date.toDateString(); }, []);
    // Update the meal plan when a single meal is regenerated and refresh database
    (0, react_2.useEffect)(function () {
        if ((singleMealObject === null || singleMealObject === void 0 ? void 0 : singleMealObject.name) && isRegeneratingFor) {
            setIsRegeneratingFor(null);
            // Refresh database meals after single meal generation
            void fetchDbMeals();
        }
    }, [singleMealObject, isRegeneratingFor, fetchDbMeals]);
    var regenerateSingleMeal = function (date) {
        setIsRegeneratingFor(date);
        var currentMeal = allMeals.get(dateToKey(date));
        var dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        var timestamp = Math.floor(date.getTime() / 1000);
        submitSingleMeal({
            prompt: "Generate a single meal recommendation for ".concat(dayName, ". Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from \"").concat(currentMeal, "\" and common meals like spaghetti, pizza, or tacos."),
            date: timestamp,
        });
    };
    var generateMealForDate = function (date) {
        var dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        var timestamp = Math.floor(date.getTime() / 1000);
        setIsRegeneratingFor(date);
        submitSingleMeal({
            prompt: "Generate a single meal recommendation for ".concat(dayName, ". Focus on variety, nutrition, and family-friendly meals for 3 people."),
            date: timestamp,
        });
    };
    // Create meals map from database only
    var combinedMeals = (0, react_2.useCallback)(function () {
        var combined = new Map();
        // Add database meals, which use unix timestamps for dates
        dbMeals.forEach(function (meal) {
            // Convert unix timestamp to date
            var mealDate = new Date(meal.day * 1000);
            combined.set(dateToKey(mealDate), meal.name);
        });
        return combined;
    }, [dbMeals, dateToKey]);
    var allMeals = combinedMeals();
    // Generate array of next 7 days starting from today
    var getNext7Days = function () {
        var days = [];
        var today = new Date();
        for (var i = 0; i < 7; i++) {
            var date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    };
    return (<div className="w-full max-w-4xl mx-auto space-y-6">
			<card_1.Card>
				<card_1.CardHeader>
					<card_1.CardTitle className="flex items-center gap-2">
						<lucide_react_1.CalendarDays className="h-5 w-5"/>
						Meal Planning
					</card_1.CardTitle>
				</card_1.CardHeader>
				<card_1.CardContent className="space-y-4">
					<div className="space-y-3">
						{getNext7Days().map(function (date) {
            var dateKey = dateToKey(date);
            var meal = allMeals.get(dateKey);
            var isGenerating = isRegeneratingFor && dateToKey(isRegeneratingFor) === dateKey;
            return (<card_1.Card key={dateKey} className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<h3 className="font-semibold text-lg">
												{date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })}
											</h3>
											{meal ? (<p className="text-muted-foreground mt-1">{meal}</p>) : (<p className="text-muted-foreground mt-1 italic">
													No meal planned
												</p>)}
										</div>

										<div className="flex items-center gap-2">
											<badge_1.Badge variant={meal ? "default" : "secondary"}>
												{meal ? "Planned" : "No meal"}
											</badge_1.Badge>

											{meal ? (<Button_1.Button variant="outline" size="sm" onClick={function () { return regenerateSingleMeal(date); }} disabled={isGenerating || isSingleMealLoading}>
													<lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(isGenerating ? "animate-spin" : "")}/>
													{isGenerating ? "Generating..." : "Regenerate"}
												</Button_1.Button>) : (<Button_1.Button size="sm" onClick={function () { return generateMealForDate(date); }} disabled={isGenerating || isSingleMealLoading}>
													{isGenerating ? "Generating..." : "Generate"}
												</Button_1.Button>)}
										</div>
									</div>
								</card_1.Card>);
        })}
					</div>
				</card_1.CardContent>
			</card_1.Card>
		</div>);
}
