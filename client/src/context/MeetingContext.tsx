import React, { createContext, useContext, useState } from "react";

interface MeetingData {
  id: string;
  name: string;
  meeting_link: string;
  state: string;
  summary?: string;
}

interface MeetingContextType {
  currentMeeting: MeetingData | null;
  setCurrentMeeting: (meeting: MeetingData) => void;
  clearCurrentMeeting: () => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentMeeting, setCurrentMeeting] = useState<MeetingData | null>(null);

  const clearCurrentMeeting = () => {
    setCurrentMeeting(null);
  };

  return (
    <MeetingContext.Provider
      value={{
        currentMeeting,
        setCurrentMeeting,
        clearCurrentMeeting,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};
