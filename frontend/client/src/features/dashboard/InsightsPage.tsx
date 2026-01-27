import { TrendingUp, BarChart3, PieChart, Calendar, Users, Clock, Target } from "lucide-react";

const InsightsPage: React.FC = () => {
  const insights = [
    {
      title: "Meeting Efficiency Trends",
      description: "Your team's meeting efficiency has improved by 23% this month",
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      value: "+23%",
      trend: "up",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Average Meeting Duration",
      description: "Meetings are 15 minutes shorter on average compared to last month",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      value: "42 min",
      trend: "down",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Action Item Completion",
      description: "85% of action items are being completed on time",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      value: "85%",
      trend: "up",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Team Participation",
      description: "Average participation rate across all meetings",
      icon: <Users className="w-6 h-6 text-orange-600" />,
      value: "92%",
      trend: "up",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const weeklyData = [
    { day: 'Mon', meetings: 8, duration: 320 },
    { day: 'Tue', meetings: 12, duration: 480 },
    { day: 'Wed', meetings: 6, duration: 240 },
    { day: 'Thu', meetings: 10, duration: 400 },
    { day: 'Fri', meetings: 4, duration: 160 },
  ];

  const topTopics = [
    { topic: "Product Roadmap", mentions: 24, percentage: 35 },
    { topic: "User Experience", mentions: 18, percentage: 26 },
    { topic: "Budget Planning", mentions: 12, percentage: 18 },
    { topic: "Team Structure", mentions: 8, percentage: 12 },
    { topic: "Marketing Strategy", mentions: 6, percentage: 9 }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meeting Insights</h1>
        <p className="text-sm sm:text-base text-gray-500">Discover patterns and trends in your meeting data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className={`w-12 h-12 ${insight.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              {insight.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${insight.textColor}`}>{insight.value}</span>
              {insight.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Meeting Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-600">Meeting count and duration by day</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-900">{day.meetings} meetings</span>
                    <span className="text-sm text-gray-600">{Math.floor(day.duration / 60)}h {day.duration % 60}m</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(day.meetings / 12) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Discussion Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Top Discussion Topics</h3>
              <p className="text-sm text-gray-600">Most frequently discussed topics</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {topTopics.map((topic, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{topic.topic}</span>
                    <span className="text-sm text-gray-600">{topic.mentions} mentions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 w-12 text-right">
                  {topic.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Suggestions to improve your meeting effectiveness</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Optimize Meeting Length</h4>
            <p className="text-sm text-blue-700">Consider shortening Tuesday meetings by 15 minutes. Data shows productivity peaks at 30-45 minute sessions.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Improve Follow-up</h4>
            <p className="text-sm text-green-700">Send meeting summaries within 2 hours to increase action item completion by 40%.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Schedule Optimization</h4>
            <p className="text-sm text-purple-700">Friday afternoons show 20% lower engagement. Consider rescheduling important meetings.</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Topic Focus</h4>
            <p className="text-sm text-orange-700">Product roadmap discussions are trending up. Consider dedicated weekly sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;