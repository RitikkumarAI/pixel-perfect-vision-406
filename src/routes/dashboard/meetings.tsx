import { createFileRoute } from "@tanstack/react-router";
import { useMeeting } from "../../hooks/useMeeting";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/meetings")({
  component: MeetingsRoute,
});

function MeetingsRoute() {
  const { meetingToken, isLoading, error, joinMeeting, leaveMeeting } = useMeeting();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
        <h1 className="text-2xl font-bold mb-4">WebRTC Meetings</h1>
        
        {meetingToken ? (
          <div>
            <div className="bg-slate-900 aspect-video rounded-lg mb-6 flex items-center justify-center">
              <span className="text-white/50">LiveKit Room Connected</span>
            </div>
            <Button onClick={leaveMeeting} variant="destructive">Leave Meeting</Button>
          </div>
        ) : (
          <div>
            <p className="text-slate-500 mb-6">Connect to the LiveKit server to start your video session.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button 
              onClick={() => joinMeeting('test-meeting-id')} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Connecting...' : 'Join Meeting'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
