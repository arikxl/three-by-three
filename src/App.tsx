import './App.css'

import Leaderboard from './screens/Leaderboard'
import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Image as ImageIcon, Trophy, ChevronRight, Check } from 'lucide-react'
import Quiz from './screens/Quiz'

type City = 'אילת' | 'באר שבע' | 'טירת הכרמל'

const THEMES = {
  'אילת': { bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-sky-600', border: 'border-sky-500', lightBg: 'bg-sky-50', spinner: 'border-sky-500' },
  'באר שבע': { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', border: 'border-red-600', lightBg: 'bg-red-50', spinner: 'border-red-600' },
  'טירת הכרמל': { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', border: 'border-emerald-600', lightBg: 'bg-emerald-50', spinner: 'border-emerald-600' },
  'default': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-600', lightBg: 'bg-blue-50', spinner: 'border-blue-600' }
}

function App() {
  // הוספנו את 'leaderboard' לאפשרויות המסכים
  const [currentScreen, setCurrentScreen] = useState<'home' | 'instructions' | 'team-select' | 'quiz' | 'leaderboard'>('home')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  const { user } = useUser()
  const dbUser = useQuery(api.users.getUser, user ? { tokenIdentifier: user.id } : "skip")
  const saveUserToDB = useMutation(api.users.saveUser)

  const activeCity = dbUser?.city || selectedCity
  const currentTheme = activeCity ? THEMES[activeCity as City] : THEMES['default']

  const handleStartGameClick = () => {
    if (user) {
      if (dbUser?.city) {
        setCurrentScreen('quiz')
      } else {
        setCurrentScreen('team-select')
      }
    }
  }

  const handleFinalStart = async () => {
    if (!selectedCity || !user) return
    try {
      await saveUserToDB({
        tokenIdentifier: user.id,
        name: user.fullName || user.firstName || "שחקן",
        city: selectedCity
      })
      setCurrentScreen('quiz')
    } catch (error) {
      console.error("שגיאה בשמירת המשתמש:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in" dir="rtl">


      {/* ================= 1. מסך הבית ================= */}
      {currentScreen === 'home' && (
        <main className="w-full max-w-xs flex flex-col items-center gap-8">

          {/* הברכה האישית למשתמש מחובר */}
          <SignedIn>
            <h1 className="text-2xl font-black text-gray-800 animate-in fade-in slide-in-from-top-4">
              היי, {user?.firstName || 'שחקן'}! 
            </h1>
          </SignedIn>

          <img
            src="https://res.cloudinary.com/arikxl/image/upload/v1778973968/Ella2023/mdokexsgo0tawspzpybf.png"
            alt="Arik Alexandrov"
            className="w-56 h-56 object-cover rounded-3xl transition-all duration-300"
          />

          {/* הקטנתי טיפה את הרווח (gap-3) כדי ש-3 הכפתורים ייכנסו יפה במובייל */}
          <div className="w-full flex flex-col gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className={`w-full ${currentTheme.bg} text-white font-bold text-xl py-4 rounded-2xl shadow-md transition-colors duration-300`}>
                  התחל משחק
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button
                onClick={handleStartGameClick}
                className={`w-full ${currentTheme.bg} text-white font-bold text-xl py-4 rounded-2xl shadow-md ${currentTheme.hover} active:scale-95 transition-all duration-300`}
              >
                התחל משחק
              </button>
            </SignedIn>

            {/* כפתור טבלת האלופים החדש */}
            <button
              onClick={() => setCurrentScreen('leaderboard')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl py-4 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <Trophy size={22} />
              טבלת האלופים
            </button>

            <button
              onClick={() => setCurrentScreen('instructions')}
              className={`w-full bg-white ${currentTheme.text} border-2 ${currentTheme.border} font-bold text-xl py-4 rounded-2xl hover:${currentTheme.lightBg} active:scale-95 transition-all duration-300 shadow-sm`}
            >
              הוראות
            </button>
          </div>
        </main>
      )}

      {/* ================= 2. מסך הוראות ================= */}
      {currentScreen === 'instructions' && (
        <main className="w-full max-w-xs flex flex-col bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <button onClick={() => setCurrentScreen('home')} className="text-gray-400 p-2 -mr-2 transition-colors">
              <ChevronRight size={24} />
            </button>
            <h2 className="text-xl font-black text-gray-800 flex-1 pr-2 text-right">הוראות המשחק</h2>
          </div>

          <div className="text-right space-y-4 text-sm text-gray-600 mb-8">
            <p className={`font-bold ${currentTheme.text} ${currentTheme.lightBg} p-3 rounded-xl border ${currentTheme.border} text-center transition-colors duration-300`}>
              ברוכים הבאים תלמידי כיתה י' בתוכנית בו"ם!
            </p>
            <p>• החידון מורכב משאלות בנושאי <strong>פרסית, תרבות איראן ומודיעין</strong>.</p>
            <p>• בסך הכל יש <strong>333 שאלות</strong> וכל שאלה תופיע פעם אחת בלבד.</p>
            <p>• שחקן שיסיים את כל השאלות יקבל <strong>בונוס מיוחד</strong> במערכת!</p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => setCurrentScreen('leaderboard')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition-transform"
            >
              <Trophy size={18} />
              טבלת האלופים
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className={`w-full ${currentTheme.bg} text-white font-bold py-3.5 rounded-2xl shadow-md transition-colors duration-300`}>
                  התחלת המשחק
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button
                onClick={handleStartGameClick}
                className={`w-full ${currentTheme.bg} text-white font-bold py-3.5 rounded-2xl shadow-md ${currentTheme.hover} transition-all duration-300`}
              >
                התחלת המשחק
              </button>
            </SignedIn>
          </div>
        </main>
      )}

      {/* ================= 3. מסך בחירת קבוצה ================= */}
      {currentScreen === 'team-select' && (
        <main className="w-full max-w-xs flex flex-col bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="text-right mb-6">
            <h2 className="text-xl font-black text-gray-800">בחירת קבוצה</h2>
            <p className="text-xs text-gray-400 mt-1">בחר לאיזו קבוצה אתה שייך כדי להמשיך</p>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {(['אילת', 'באר שבע', 'טירת הכרמל'] as City[]).map((city) => {
              const isSelected = selectedCity === city;
              const cityTheme = THEMES[city];

              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 font-bold transition-all duration-300 text-right ${isSelected
                      ? `${cityTheme.border} ${cityTheme.lightBg} ${cityTheme.text}`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <span>{city}</span>
                  {isSelected && <Check size={20} className={cityTheme.text} />}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleFinalStart}
            disabled={!selectedCity}
            className={`w-full text-white font-bold py-4 rounded-2xl shadow-md transition-all duration-300 ${!selectedCity ? 'opacity-50 cursor-not-allowed bg-gray-400 shadow-none' : `${currentTheme.bg} ${currentTheme.hover} active:scale-95`
              }`}
          >
            אישור והתחלת המשחק
          </button>
        </main>
      )}

      {/* ================= 4. מסך החידון ================= */}
      {currentScreen === 'quiz' && (
        <Quiz
          theme={currentTheme}
          city={activeCity}
          onPause={() => setCurrentScreen('home')}
        />
      )}

      {/* ================= 5. מסך טבלת אלופים (שלד זמני) ================= */}
      {/* ================= 5. מסך טבלת אלופים ================= */}
      {currentScreen === 'leaderboard' && (
        <Leaderboard theme={currentTheme} onBack={() => setCurrentScreen('home')} />
      )}

    </div>
  )
}

export default App