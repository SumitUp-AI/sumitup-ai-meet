import { MeetingCard } from "../../components/MeetingCard";
import { StatCard } from "../../components/StatCard";
import { BarChart3, TrendingUp, Users, Calendar, CheckCircle, Clock } from "lucide-react";

const DashboardOverview: React.FC = () => {
  const stats = [
    {
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Total meetings processed',
      value: '42',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Follow-up action items',
      value: '8',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Decisions tracked',
      value: '15',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Time saved this week',
      value: '4.5 hrs',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  const meetings = [
    {
      logo: <Calendar className="w-6 h-6 text-blue-600" />,
      title: 'Q3 Product Roadmap',
      date: 'Oct 15, 3:00 PM',
      duration: '45m',
      participants: ['JD', 'SK', 'AM'],
      status: 'Processed' as const,
      statusColor: 'green'
    },
    {
      logo: <Users className="w-6 h-6 text-purple-600" />,
      title: 'Design Team Weekly Sync',
      date: 'Yesterday, 2:00 PM',
      duration: '30m',
      participants: ['LM', 'RT'],
      status: 'Processing' as const,
      statusColor: 'blue'
    },
    {
      logo: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: 'Client Discovery - Acme Corp',
      date: 'Oct 14, 10:00 AM',
      duration: '1h 15m',
      participants: ['JD', 'AM', 'SK'],
      status: 'Processed' as const,
      statusColor: 'green'
    },
    {
      logo: <BarChart3 className="w-6 h-6 text-orange-600" />,
      title: 'Marketing Campaign Review',
      date: 'Oct 13, 4:00 PM',
      duration: '40m',
      participants: ['TC', 'PK'],
      status: 'Processed' as const,
      statusColor: 'green'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your meetings, finally understood</h1>
        <p className="text-sm sm:text-base text-gray-500">Here's what happened while you were busy building</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Meetings</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View all
          </button>
        </div>

        <div className="space-y-3">
          <div className="hidden lg:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <div className="w-10"></div>
            <div>Title & Date</div>
            <div className="w-16 text-center">Duration</div>
            <div className="w-20 text-center">Participants</div>
            <div className="w-32 text-center">Status</div>
            <div className="w-28 text-center">Action</div>
          </div>
          {meetings.map((meeting, index) => (
            <MeetingCard key={index} {...meeting} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;