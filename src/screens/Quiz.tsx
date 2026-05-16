import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Timer, Pause, Loader2, Trophy } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface QuizProps {
    theme: { bg: string; hover: string; text: string; border: string; lightBg: string; spinner: string; };
    city: string | null;
    onPause?: () => void;
}

export default function Quiz({ theme, city, onPause }: QuizProps) {
    const { user } = useUser()

    // 1. שליפת השאלות מקונבקס
    const rawQuestions = useQuery(api.questions.getAll)

    // 2. ניהול ה-State של המשחק
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(10)

    // ניהול בדיקת התשובה (כדי להציג צבעים ולהשהות טיימר)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    // ציון האם המשתמש ביקש הפסקה
    const [pauseRequested, setPauseRequested] = useState(false)

    // 3. ערבוב השאלות ברגע שהן מגיעות מהשרת
    useEffect(() => {
        if (rawQuestions && questions.length === 0) {
            setQuestions([...rawQuestions].sort(() => Math.random() - 0.5))
        }
    }, [rawQuestions])

    // 4. לוגיקת הטיימר
    useEffect(() => {
        if (isChecking || timeLeft === 0 || questions.length === 0 || currentIndex >= questions.length) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft, isChecking, questions.length, currentIndex])

    // טיפול במצב שבו הזמן נגמר
    useEffect(() => {
        if (timeLeft === 0 && !isChecking) {
            handleTimeUp()
        }
    }, [timeLeft, isChecking])

    const currentQuestion = questions[currentIndex]

    // 5. פונקציית מעבר שאלה (או חזרה לדף הבית אם התבקשה הפסקה)
    const goToNextQuestion = () => {
        // בדיקה האם המשתמש ביקש הפסקה במהלך השאלה
        if (pauseRequested && onPause) {
            onPause()
            return // עוצרים כאן ולא ממשיכים לשאלה הבאה
        }

        setSelectedAnswer(null)
        setIsChecking(false)
        setTimeLeft(10)
        setCurrentIndex((prev) => prev + 1)
    }

    // 6. מה קורה כשהזמן נגמר
    const handleTimeUp = () => {
        setIsChecking(true)
        setTimeout(() => {
            goToNextQuestion()
        }, 2000)
    }

    // 7. לחיצה על תשובה
    const handleAnswerClick = (answer: string) => {
        if (isChecking) return

        setSelectedAnswer(answer)
        setIsChecking(true)

        const isCorrect = answer === currentQuestion.correctAnswer

        if (isCorrect) {
            setScore((prev) => prev + 1) // כל תשובה נכונה מעניקה בדיוק נקודה אחת
        }

        setTimeout(() => {
            goToNextQuestion()
        }, 2000)
    }

    // ================= תצוגות מיוחדות =================

    // טעינה
    if (questions.length === 0) {
        return (
            <div className="w-full max-w-md flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className={`animate-spin ${theme.text}`} size={48} />
                <p className="text-gray-500 font-bold">טוען את 333 השאלות...</p>
            </div>
        )
    }

    // סיום המשחק
    if (currentIndex >= questions.length) {
        return (
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center animate-in zoom-in duration-500 flex flex-col gap-6">
                <Trophy size={64} className="text-amber-400 mx-auto" />
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">כל הכבוד!</h2>
                    <p className="text-gray-600">סיימת את כל 333 השאלות של בו"ם.</p>
                </div>
                <div className={`p-4 rounded-2xl ${theme.lightBg} border ${theme.border}`}>
                    <p className="text-sm font-bold text-gray-500 mb-1">הניקוד הסופי שלך:</p>
                    <p className={`text-4xl font-black ${theme.text}`}>{score} נק'</p>
                </div>
                <button
                    onClick={onPause}
                    className={`w-full text-white font-bold py-4 rounded-2xl shadow-md transition-all active:scale-95 ${theme.bg} ${theme.hover}`}
                >
                    חזור למסך הבית
                </button>
            </div>
        )
    }

    // ================= המסך המרכזי =================

    const timerColor = timeLeft <= 3 ? 'text-red-500' : theme.text;

    return (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500 flex flex-col gap-4">

            {/* Header */}
            <header className={`flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border-2 ${theme.border}`}>
                <div className="text-right">
                    <p className="font-bold text-gray-500 text-xs mb-0.5">{user?.firstName || 'שחקן'}</p>
                    <p className="font-black text-gray-800 text-xl leading-tight">{score} נק'</p>
                    <p className={`text-sm font-bold ${theme.text}`}>קבוצת {city}</p>
                </div>
                <div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* גוף החידון */}
            <main className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 relative overflow-hidden">

                {/* פס התקדמות עליון */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                    <div
                        className={`h-full transition-all duration-500 ${theme.bg}`}
                        style={{ width: `${(currentIndex / questions.length) * 100}%` }}
                    />
                </div>

                {/* טיימר */}
                <div className="flex justify-center mt-2">
                    <div className={`flex items-center gap-2 text-3xl font-black ${timerColor} transition-colors duration-300 ${timeLeft === 0 && 'animate-pulse'}`}>
                        <Timer size={32} />
                        <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                    </div>
                </div>

                {/* הודעת זמן נגמר */}
                {timeLeft === 0 && isChecking && (
                    <p className="text-center font-bold text-red-500 animate-in fade-in">הזמן נגמר!</p>
                )}

                {/* השאלה */}
                <div className="text-center pb-2">
                    <h2 className="text-2xl font-black text-gray-800 leading-snug">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* אזור התשובות */}
                <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((answer: string, index: number) => {
                        let buttonStyle = `border-gray-100 text-gray-600 hover:${theme.border} hover:${theme.lightBg} hover:${theme.text}`

                        if (isChecking) {
                            if (answer === currentQuestion.correctAnswer) {
                                buttonStyle = 'border-green-500 bg-green-50 text-green-700'
                            } else if (answer === selectedAnswer) {
                                buttonStyle = 'border-red-500 bg-red-50 text-red-700'
                            } else {
                                buttonStyle = 'border-gray-100 text-gray-300 opacity-50'
                            }
                        }

                        return (
                            <button
                                key={index}
                                disabled={isChecking}
                                onClick={() => handleAnswerClick(answer)}
                                className={`w-full p-4 text-center font-bold text-lg rounded-2xl border-2 transition-all active:scale-95 ${buttonStyle}`}
                            >
                                {answer}
                            </button>
                        )
                    })}
                </div>

            </main>

            {/* כפתור הפסקה מעודכן */}
            <button
                onClick={() => setPauseRequested(true)}
                disabled={pauseRequested || isChecking}
                className={`flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-500 font-bold text-lg transition-all active:scale-95 shadow-sm mt-2 ${pauseRequested
                        ? 'opacity-50 cursor-not-allowed bg-gray-50'
                        : 'hover:bg-gray-50 hover:text-gray-700'
                    }`}
            >
                <Pause size={20} />
                {pauseRequested ? 'נחזור למסך הבית בסיום השאלה...' : 'הפסקה לאחר שאלה זו'}
            </button>

        </div>
    )
}