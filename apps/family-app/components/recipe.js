"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = Recipe;
var react_1 = require("@ai-sdk/react");
var Button_1 = require("@repo/ui/Button");
var badge_1 = require("@repo/ui/badge");
var card_1 = require("@repo/ui/card");
var input_1 = require("@repo/ui/input");
var separator_1 = require("@repo/ui/separator");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var schemas_1 = require("#/lib/schemas");
function Recipe() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = (0, react_2.useState)(""), selectedMeal = _j[0], setSelectedMeal = _j[1];
    var _k = (0, react_2.useState)(null), currentRecipe = _k[0], setCurrentRecipe = _k[1];
    var _l = (0, react_1.experimental_useObject)({
        api: "/api/recipe",
        schema: schemas_1.recipeSchema,
        onFinish: function (result) {
            if (result.object) {
                setCurrentRecipe(result.object);
            }
        },
    }), object = _l.object, submit = _l.submit, isLoading = _l.isLoading;
    var generateRecipe = function () {
        if (!selectedMeal.trim())
            return;
        submit({ mealName: selectedMeal });
    };
    var handleKeyPress = function (e) {
        if (e.key === "Enter" && !isLoading) {
            generateRecipe();
        }
    };
    return (<card_1.Card className="w-full max-w-4xl mx-auto">
			<card_1.CardHeader>
				<card_1.CardTitle className="flex items-center gap-2">
					<lucide_react_1.ChefHat className="h-5 w-5"/>
					Recipe Generator
				</card_1.CardTitle>
			</card_1.CardHeader>
			<card_1.CardContent className="space-y-6">
				<div className="flex gap-2">
					<input_1.Input type="text" value={selectedMeal} onChange={function (e) { return setSelectedMeal(e.target.value); }} onKeyPress={handleKeyPress} placeholder="Enter a meal name (e.g., Chicken Parmesan)" disabled={isLoading} className="flex-1"/>
					<Button_1.Button onClick={generateRecipe} disabled={isLoading || !selectedMeal.trim()}>
						{isLoading ? "Generating..." : "Get Recipe"}
					</Button_1.Button>
				</div>

				{(currentRecipe || object) && (<card_1.Card>
						<card_1.CardHeader>
							<card_1.CardTitle className="text-2xl text-green-600">
								{(_a = (currentRecipe || object)) === null || _a === void 0 ? void 0 : _a.mealName}
							</card_1.CardTitle>
							<div className="flex flex-wrap gap-4">
								<badge_1.Badge variant="outline" className="flex items-center gap-1">
									<lucide_react_1.Clock className="h-3 w-3"/>
									Prep: {(_b = (currentRecipe || object)) === null || _b === void 0 ? void 0 : _b.prepTime}
								</badge_1.Badge>
								<badge_1.Badge variant="outline" className="flex items-center gap-1">
									<lucide_react_1.Clock className="h-3 w-3"/>
									Cook: {(_c = (currentRecipe || object)) === null || _c === void 0 ? void 0 : _c.cookTime}
								</badge_1.Badge>
								<badge_1.Badge variant="outline" className="flex items-center gap-1">
									<lucide_react_1.Users className="h-3 w-3"/>
									Serves: {(_d = (currentRecipe || object)) === null || _d === void 0 ? void 0 : _d.servings}
								</badge_1.Badge>
							</div>
						</card_1.CardHeader>
						<card_1.CardContent>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-3">
									<h5 className="font-semibold text-lg">Ingredients</h5>
									<separator_1.Separator />
									<ul className="space-y-2">
										{(_f = (_e = (currentRecipe || object)) === null || _e === void 0 ? void 0 : _e.ingredients) === null || _f === void 0 ? void 0 : _f.map(function (ingredient) { return (<li key={ingredient} className="flex items-start gap-2">
													<span className="text-green-500 mt-1">•</span>
													<span className="text-sm">{ingredient}</span>
												</li>); })}
									</ul>
								</div>

								<div className="space-y-3">
									<h5 className="font-semibold text-lg">Instructions</h5>
									<separator_1.Separator />
									<ol className="space-y-3">
										{(_h = (_g = (currentRecipe || object)) === null || _g === void 0 ? void 0 : _g.instructions) === null || _h === void 0 ? void 0 : _h.map(function (instruction, index) { return (<li key={instruction} className="flex items-start gap-3">
													<badge_1.Badge variant="default" className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs">
														{index + 1}
													</badge_1.Badge>
													<span className="text-sm leading-relaxed">
														{instruction}
													</span>
												</li>); })}
									</ol>
								</div>
							</div>
						</card_1.CardContent>
					</card_1.Card>)}
			</card_1.CardContent>
		</card_1.Card>);
}
