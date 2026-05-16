import { mutation } from "./_generated/server";
import { VOCAB_GROUPS } from "./data"; 
import { TRIVIA_QUESTIONS } from "./trivia"; 

export const populateQuestions = mutation({
  handler: async (ctx) => {
    // 1. ניקוי המסד הקיים לפני הזרקה חדשה
    const existingQuestions = await ctx.db.query("questions").collect();
    for (const q of existingQuestions) {
      await ctx.db.delete(q._id);
    }

    const allQuestionsToInsert = [];

    // ==========================================
    // חלק א': יצירת 142 שאלות מפרסית
    // ==========================================
    const allWords = (VOCAB_GROUPS as any[])
      .flatMap((g) => g?.words || [])
      .filter((word) => word && word.he && word.fa);
    
    for (let i = 0; i < allWords.length; i++) {
      const currentWord = allWords[i];
      const wrongAnswers: string[] = [];
      
      // הגרלת 3 תשובות שגויות מתוך מאגר המילים כדי לבלבל
      while (wrongAnswers.length < 3) {
        const randomIdx = Math.floor(Math.random() * allWords.length);
        const randomWordObj = allWords[randomIdx];
        
        if (randomWordObj && randomWordObj.he) {
          const randomWord = randomWordObj.he;
          if (randomIdx !== i && !wrongAnswers.includes(randomWord)) {
            wrongAnswers.push(randomWord);
          }
        }
      }

      // חיבור התשובה הנכונה עם השגויות וערבוב הסדר שלהן!
      const options = [...wrongAnswers, currentWord.he].sort(() => Math.random() - 0.5);

      allQuestionsToInsert.push({
        text: `מה הפירוש של המילה הפרסית '${currentWord.fa}'?`,
        category: "פרסית",
        options: options,
        correctAnswer: currentWord.he, // שומרים את המחרוזת הנכונה ולא אינדקס, כי ערבבנו את המערך
      });
    }

    // ==========================================
    // חלק ב': השלמה ל-333 מתוך מאגר הטריוויה
    // ==========================================
    
    // חישוב כמה שאלות טריוויה חסרות לנו (333 - 142 = 191)
    const questionsNeeded = 333 - allQuestionsToInsert.length;

    // מערבבים את כל השאלות מקובץ הטריוויה וחותכים רק את הכמות הנדרשת
    const shuffledTrivia = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
    const selectedTrivia = shuffledTrivia.slice(0, questionsNeeded);

    // פונקציה שמנקה טקסט בתוך סוגריים (כדי שהתשובה לא תהיה ארוכה ומסגירה)
    const removeParentheses = (str: string) => str.replace(/\s*\(.*?\)\s*/g, '').trim();

    for (const tq of selectedTrivia) {
      // חילוץ התשובה הנכונה המקורית וניקוי שלה
      const originalCorrectAnswer = tq.options[tq.correctIndex];
      const cleanCorrectAnswer = removeParentheses(originalCorrectAnswer);

      // ניקוי הסוגריים מכל האופציות + ערבוב הסדר שלהן כדי שהתשובה לא תהיה תמיד באותו מקום!
      const cleanOptions = tq.options
        .map((opt: string) => removeParentheses(opt))
        .sort(() => Math.random() - 0.5);

      const category = (tq.topicId === "iran" || tq.topicId === "arab_culture") 
        ? "תרבות איראן" 
        : "מודיעין";

      allQuestionsToInsert.push({
        text: removeParentheses(tq.text),
        category: category,
        options: cleanOptions,
        correctAnswer: cleanCorrectAnswer,
      });
    }

    // ==========================================
    // חלק ג': שמירה במסד הנתונים
    // ==========================================
    for (const q of allQuestionsToInsert) {
      await ctx.db.insert("questions", q);
    }

    return `המערכת יצרה, ערבבה, והזריקה בהצלחה בדיוק ${allQuestionsToInsert.length} שאלות!`;
  },
});