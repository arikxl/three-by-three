import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // משתמשים - כאן נשמור מי שייך לאיזו עיר
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), // המזהה מ-Clerk
    city: v.string(),            // אילת, באר שבע, או טירת הכרמל
    farsiScore: v.number(),
    intelScore: v.number(),
    cultureScore: v.number(),
    totalScore: v.number(),
    completedQuestions: v.number(),

  }).index("by_token", ["tokenIdentifier"]),

  // השאלות (בינתיים רק המבנה)
  questions: defineTable({
    text: v.string(),
    category: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
  }),
});