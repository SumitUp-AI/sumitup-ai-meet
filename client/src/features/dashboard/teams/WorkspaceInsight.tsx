/**
 * WorkspaceInsight Component
 * Dark card showing AI-generated workspace collaboration insights
 */

const WorkspaceInsight: React.FC = () => {
  // Placeholder score — replace with real data from API when available
  const efficiencyScore = 84;

  return (
    <div className="bg-slate-800 rounded-xl p-6 text-white h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold mb-3">Workspace Insight</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Your team's collaboration rate has increased by{" "}
          <span className="text-white font-semibold">24%</span> since Elena
          Rodriguez joined. Adding a data analyst might further optimize meeting
          summaries.
        </p>
      </div>

      {/* Efficiency Score Badge */}
      <div className="mt-6 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-white">{efficiencyScore}%</span>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            Team Efficiency Score
          </p>
          <div className="mt-1.5 w-32 bg-slate-600 rounded-full h-1.5">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all"
              style={{ width: `${efficiencyScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInsight;