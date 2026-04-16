import { useState, useEffect } from "react";
import { useAuth } from "../../../context/Authcontext";
import StudentTimetableService from "../../../service/TimetableServices";
import { DAYS, PERIODS, SUBJECTS } from "../../../service/admin/TimetableServices";
import { Calendar, Library, GraduationCap } from "lucide-react";

const subjectMap = Object.fromEntries(SUBJECTS.map(s => [s.name, s]));

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`${height} ${color} rounded-full transition-all duration-500`}
      style={{ width: `${max ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Timetable() {
  const { currentUser } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [viewMode, setViewMode] = useState("week");
  const [activeDay] = useState("Monday");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    let unsubscribe = () => {};

    const setupTimetable = async () => {
      unsubscribe = await StudentTimetableService.subscribeToMyTimetable(currentUser.uid, (data) => {
        setTimetable(data);
        setLoading(false);
      });
    };
    
    setupTimetable();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const safeSchedule = timetable ?? {};
  const allCells = Object.values(safeSchedule).flatMap(d => Object.values(d));
  const lessonCount = allCells.filter(c => c.subject !== "Free").length;
  const freeCount = allCells.filter(c => c.subject === "Free").length;
  const displayDays = viewMode === "day" ? [activeDay] : DAYS;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* Hero Banner */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">My Class Timetable</h1>
            <p className="text-green-300 text-xs md:text-sm">
              Current Semester Schedule
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[{ value: lessonCount, label: "Lessons" }, { value: freeCount, label: "Free Periods" }].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]"
              >
                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-green-50 rounded-xl flex items-center justify-center text-base md:text-lg">
                  <Library className="w-5 h-5 text-green-600 inline-block" />
                </div>
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">Week</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{lessonCount}</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">Total Lessons</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Coverage</span>
                <span>{lessonCount} / {lessonCount + freeCount}</span>
              </div>
              <ProgressBar value={lessonCount} max={lessonCount + freeCount} color="bg-green-500" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-base md:text-lg">
                  <Calendar className="w-5 h-5 text-blue-600 inline-block" />
                </div>
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Days</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">5</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">School Days</div>
              <ProgressBar value={5} max={5} color="bg-blue-500" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Breaks</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">10</div>
              <ProgressBar value={2} max={2} color="bg-yellow-400" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">Free</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{freeCount}</div>
              <ProgressBar value={freeCount} max={lessonCount + freeCount} color="bg-purple-400" />
            </div>
          </div>

          {/* Week/Day toggle block */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 inline-flex">
            {[["week", "Weekly View"], ["day", "Daily View"]].map(([v, lbl]) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${viewMode === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {v === "week" && <Calendar className="w-4 h-4 inline-block mr-1" />}
                {lbl}
              </button>
            ))}
          </div>

          {/* Main Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-500 text-xs uppercase tracking-wider w-36 text-center">
                    Period
                  </th>
                  {displayDays.map(day => (
                    <th key={day} className="p-4 border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-800 text-sm text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PERIODS.map(period => (
                  <tr key={period.id} className={period.isBreak ? "bg-gray-50" : "hover:bg-gray-50/30 transition-colors"}>
                    <td className="p-4 text-center border-r border-gray-50">
                      <div className="text-xs font-bold text-gray-900">{period.label}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{period.time}</div>
                    </td>
                    {displayDays.map(day => {
                      const cell = safeSchedule[day]?.[period.id];
                      const isFree = !cell || cell?.subject === "Free";
                      const subjectInfo = subjectMap[cell?.subject];

                      if (period.isBreak) {
                        return (
                          <td key={day} className="p-4 text-center">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{period.label}</span>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="p-2 sm:p-3">
                          <div
                            className={`relative h-full min-h-[85px] rounded-xl p-3 border transition-all ${
                              isFree 
                                ? "border-dashed border-gray-200 bg-gray-50 flex items-center justify-center opacity-60" 
                                : `border-transparent ${subjectInfo?.pill || "bg-gray-100 text-gray-800"} shadow-sm`
                            }`}
                          >
                            {isFree ? (
                              <span className="text-xs font-medium text-gray-400">Free Period</span>
                            ) : (
                              <div className="flex flex-col h-full justify-between gap-1.5">
                                 <div className="font-bold text-xs sm:text-sm tracking-tight leading-tight">{cell?.subject}</div>
                                 <div className="space-y-0.5 pt-1">
                                   <div className="text-[10px] font-medium opacity-80 flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                     <Library className="w-3 h-3 flex-shrink-0" />
                                     {cell?.room}
                                   </div>
                                   <div className="text-[10px] font-medium opacity-80 flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                     <GraduationCap className="w-3 h-3 flex-shrink-0" />
                                     {cell?.teacher}
                                   </div>
                                 </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}