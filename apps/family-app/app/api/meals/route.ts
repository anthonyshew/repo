import { desc } from "drizzle-orm";
import { db, meals } from "#/lib/db";

export async function GET() {
	try {
		const allMeals = await db
			.select()
			.from(meals)
			.orderBy(desc(meals.createdAt));
		return Response.json(allMeals);
	} catch (error) {
		console.error("Error fetching meals:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
