import { createFileRoute } from "@tanstack/react-router";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useMeeting } from "../../hooks/useMeeting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useEffect } from "react";

export const Route = createFileRoute("/meet/$roomId")({
  component: MeetingRoomPage,
});

function MeetingRoomPage() {
  const { roomId } = Route.useParams();
  const { meetingToken, joinMeeting, isLoading, error } = useMeeting();

  useEffect(() => {
    if (!meetingToken && roomId) {
      joinMeeting(roomId);
    }
  }, [roomId, meetingToken]);

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Meeting Room: {roomId}</h1>
        </div>

        <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative min-h-[600px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Connecting to secure LiveKit server...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400">
              {error}
            </div>
          )}

          {meetingToken && (
            <LiveKitRoom
              video={true}
              audio={true}
              token={meetingToken}
              serverUrl="ws://localhost:7880"
              data-lk-theme="default"
              className="h-full w-full"
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
