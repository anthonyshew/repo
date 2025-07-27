export type Meal = {
	day: string;
	meal: string;
};

export type RecipeType = {
	mealName: string;
	ingredients: string[];
	instructions: string[];
	prepTime: string;
	cookTime: string;
	servings: number;
};
