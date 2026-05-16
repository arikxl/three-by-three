import { query } from "./_generated/server";

export const getAll = query({
  handler: async (ctx) => {
    // שולף את כל השאלות ממסד הנתונים
    return await ctx.db.query("questions").collect();
  },
});