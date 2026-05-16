import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// שליפת נתוני המשתמש לפי ה-ID של Clerk
export const getUser = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
  },
});

// שמירת משתמש חדש והקבוצה שלו (אם הוא לא קיים)
export const saveUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // קודם בודקים אם המשתמש כבר קיים כדי לא לדרוס אותו
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (existingUser) {
      return existingUser._id; // אם הוא קיים, אנחנו לא נוגעים בו (נעילת קבוצה)
    }

    // אם הוא חדש, שומרים אותו עם הקבוצה שבחר
    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      city: args.city,
      totalScore: 0,
      farsiScore: 0,
      intelScore: 0,
      cultureScore: 0,
      completedQuestions: 0,
    });
  },
});