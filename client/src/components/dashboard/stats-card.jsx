export default function StatsCard({ title, value, icon, iconBg, trend, trendText }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{trendText}</p>
      </div>
    </div>
  );
}
