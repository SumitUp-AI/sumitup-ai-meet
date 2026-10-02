import React from 'react';

const ParticipantsPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-6 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Participants</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and view meeting participants.</p>
          </div>
        </header>

        {/* Empty state for now as requested */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          No participants to display yet.
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
