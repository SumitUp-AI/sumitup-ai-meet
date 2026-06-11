import { Routes, Route } from "react-router-dom";
import AIChatPage from "../features/dashboard/AIChatPage";
import InsightsPage from "../features/dashboard/InsightsPage";
import MeetingsPage from "../features/dashboard/MeetingsPage";
import NewMeetingPage from "../features/dashboard/NewMeetingPage";
import SettingsPage from "../features/dashboard/SettingsPage";
import SummaryPage from "../features/dashboard/SummaryPage";
import Dashboard from "../features/Dashboard";
import { DashboardLayout } from "../layouts/dashboard/DashboardLayout";
import { dashboardLoader } from "../loaders/dashboardLoader";

export function DashboardWrapper() {
  return (
    <>
      <Routes>
        <Route path="" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} loader={dashboardLoader} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="new-meetings" element={<NewMeetingPage />} />
          <Route path="summary/:meetingId" element={<SummaryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}
export default function DashboardRoutes() {
  return <DashboardWrapper />;
}
