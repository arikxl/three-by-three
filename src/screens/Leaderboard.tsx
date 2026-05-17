import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ChevronRight, Trophy, Medal, Star } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface LeaderboardProps {
    theme: any;
    onBack: () => void;
}

export default function Leaderboard({ theme, onBack }: LeaderboardProps) {
    const data = useQuery(api.users.getLeaderboardData)

    if (!data) {
        return (
            <div className="w-full max-w-md flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className={`animate-spin ${theme.text}`} size={48} />
                <p className="text-gray-500 font-bold">מחשב נתונים ומרכיב את הטבלאות...</p>
            </div>
        )
    }

    // פונקציית עזר לציור שורה של שחקן (עם מדליות למקומות 1-3)
    const renderPlayerRow = (player: any, index: number) => {
        let positionIcon = <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>
        if (index === 0) positionIcon = <Trophy size={20} className="text-amber-400 w-6" />
        if (index === 1) positionIcon = <Medal size={20} className="text-gray-400 w-6" />
        if (index === 2) positionIcon = <Medal size={20} className="text-amber-700 w-6" />

        return (
            <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    {positionIcon}
                    <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.city}</p>
                    </div>
                </div>
                <div className="font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                    {player.score}
                </div>
            </div>
        )
    }

    // פונקציית עזר לציור שורה של קבוצה
    const renderTeamRow = (team: any, index: number, scoreField: string) => {
        return (
            <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400 w-4 text-center">{index + 1}</span>
                    <p className="font-bold text-gray-800 text-sm">{team.city}</p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400 text-left">ממוצע: <br /> {team.participants} שחקנים</p>
                    <div className={`font-black px-3 py-1 rounded-lg text-white ${index === 0 ? theme.bg : 'bg-gray-300'}`}>
                        {team[scoreField]}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md flex flex-col bg-white rounded-3xl shadow-sm   overflow-hidden animate-in fade-in duration-500">

            {/* Header קבוע למעלה */}
            <div className={`flex items-center p-4 border-b-2 ${theme.border} bg-white z-10 sticky top-0`}>
                <button onClick={onBack} className="text-gray-400 p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight size={24} />
                </button>
                <h2 className={`text-xl font-black ${theme.text} flex-1 pr-2 text-right`}>תותחי בו"ם</h2>
            </div>

            {/* אזור גלילה (לכל הטבלאות) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">



                {/* 1. טופ 10 שחקנים כללי */}
                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h3 className={`bg-gray-50 p-3 font-black text-gray-800 text-center border-b border-gray-200 flex items-center justify-center gap-2`}>
                        <Trophy size={18} className="text-amber-500" />
                        טופ 10 - דירוג אישי
                    </h3>
                    <div className="p-1">
                        {data.top10Overall.map((p: any, i: number) => renderPlayerRow(p, i))}
                    </div>
                </section>

                {/* 2. קבוצות - דירוג כללי */}
                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h3 className={`bg-gray-50 p-3 font-black text-gray-800 text-center border-b border-gray-200 flex items-center justify-center gap-2`}>
                        <Star size={18} className={theme.text} />
                        דירוג קבוצות - כללי (ממוצע)
                    </h3>
                    <div className="p-1">
                        {data.teamsOverall.map((t: any, i: number) => renderTeamRow(t, i, 'avgTotal'))}
                    </div>
                </section>

                <hr className="border-t-2 border-dashed border-gray-200 my-6" />

                {/* 3. אלופי הקטגוריות - שחקנים */}
                <h3 className="text-lg font-black text-center text-gray-800 mb-2">🏆 תותחים לפי נושאים</h3>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-emerald-50 text-emerald-800 p-2 font-bold text-center border-b border-emerald-100 text-sm">אלופי הפרסית</h4>
                    <div className="p-1">{data.top5Farsi.map((p: any, i: number) => renderPlayerRow(p, i))}</div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-blue-50 text-blue-800 p-2 font-bold text-center border-b border-blue-100 text-sm">אלופי המודיעין</h4>
                    <div className="p-1">{data.top5Intel.map((p: any, i: number) => renderPlayerRow(p, i))}</div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-purple-50 text-purple-800 p-2 font-bold text-center border-b border-purple-100 text-sm">אלופי תרבות איראן</h4>
                    <div className="p-1">{data.top5Culture.map((p: any, i: number) => renderPlayerRow(p, i))}</div>
                </section>

                <hr className="border-t-2 border-dashed border-gray-200 my-6" />

                {/* 4. אלופי הקטגוריות - קבוצות */}
                <h3 className="text-lg font-black text-center text-gray-800 mb-2">⭐ דירוג קבוצות לפי נושאים</h3>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-emerald-50 text-emerald-800 p-2 font-bold text-center border-b border-emerald-100 text-sm">תותחי פרסית</h4>
                    <div className="p-1">{data.teamsFarsi.map((t: any, i: number) => renderTeamRow(t, i, 'avgFarsi'))}</div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-blue-50 text-blue-800 p-2 font-bold text-center border-b border-blue-100 text-sm">תותחי מודיעין</h4>
                    <div className="p-1">{data.teamsIntel.map((t: any, i: number) => renderTeamRow(t, i, 'avgIntel'))}</div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <h4 className="bg-purple-50 text-purple-800 p-2 font-bold text-center border-b border-purple-100 text-sm">תותחי תרבות אירן</h4>
                    <div className="p-1">{data.teamsCulture.map((t: any, i: number) => renderTeamRow(t, i, 'avgCulture'))}</div>
                </section>

            </div>
        </div>
    )
}