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


export const updateProgress = mutation({
  args: {
    tokenIdentifier: v.string(),
    category: v.string(),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // מקדמים את מונה השאלות שהשחקן סיים
    const newCompletedCount = (user.completedQuestions || 0) + 1;
    const patches: any = {
      completedQuestions: newCompletedCount,
    };

    // חישוב הנקודות להוספה
    let scoreAddition = args.isCorrect ? 1 : 0; // נקודה על תשובה נכונה

    // בונוס מיוחד: אם זו בדיוק השאלה ה-333, נוסיף 33 נקודות בונוס!
    if (newCompletedCount === 333) {
      scoreAddition += 33;
    }

    // מעדכנים את הציון הכללי אם התווספו נקודות (תשובה נכונה או בונוס סיום)
    if (scoreAddition > 0) {
      patches.totalScore = (user.totalScore || 0) + scoreAddition;
    }

    // מעדכנים את קטגוריית המשנה (רק אם התשובה הייתה נכונה)
    if (args.isCorrect) {
      if (args.category === "פרסית") {
        patches.farsiScore = (user.farsiScore || 0) + 1;
      } else if (args.category === "תרבות איראן") {
        patches.cultureScore = (user.cultureScore || 0) + 1;
      } else if (args.category === "מודיעין") {
        patches.intelScore = (user.intelScore || 0) + 1;
      }
    }

    await ctx.db.patch(user._id, patches);
    return { success: true };
  },
});


// הוסף את זה לסוף הקובץ convex/users.ts
export const getLeaderboardData = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // פונקציית עזר לשליפת המובילים לפי שדה מסוים
    const getTopPlayers = (field: keyof typeof users[0], limit: number) => {
      return [...users]
        .sort((a, b) => ((b[field] as number) || 0) - ((a[field] as number) || 0))
        .slice(0, limit)
        .map(u => ({ name: u.name, city: u.city, score: u[field] }));
    };

    const cities = ['אילת', 'באר שבע', 'טירת הכרמל'];
    
    // חישוב ממוצעים לכל קבוצה
// חישוב ממוצעים לכל קבוצה (מעוגל למספר שלם לחלוטין)
    const teamStats = cities.map(city => {
      const teamUsers = users.filter(u => u.city === city);
      const count = teamUsers.length > 0 ? teamUsers.length : 1; // מניעת חלוקה באפס
      
      return {
        city,
        participants: teamUsers.length,
        avgTotal: Math.round(teamUsers.reduce((sum, u) => sum + (u.totalScore || 0), 0) / count),
        avgFarsi: Math.round(teamUsers.reduce((sum, u) => sum + (u.farsiScore || 0), 0) / count),
        avgIntel: Math.round(teamUsers.reduce((sum, u) => sum + (u.intelScore || 0), 0) / count),
        avgCulture: Math.round(teamUsers.reduce((sum, u) => sum + (u.cultureScore || 0), 0) / count),
      };
    });

    return {
      top10Overall: getTopPlayers("totalScore", 10),
      top5Farsi: getTopPlayers("farsiScore", 5),
      top5Intel: getTopPlayers("intelScore", 5),
      top5Culture: getTopPlayers("cultureScore", 5),
      teamsOverall: [...teamStats].sort((a, b) => b.avgTotal - a.avgTotal),
      teamsFarsi: [...teamStats].sort((a, b) => b.avgFarsi - a.avgFarsi),
      teamsIntel: [...teamStats].sort((a, b) => b.avgIntel - a.avgIntel),
      teamsCulture: [...teamStats].sort((a, b) => b.avgCulture - a.avgCulture),
    };
  },
});