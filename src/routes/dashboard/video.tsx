import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useVideo } from "../../hooks/useVideo";
import { Video, Upload, PlayCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/video")({
  component: VideoLibraryPage,
});

function VideoLibraryPage() {
  const { recordings, isLoadingRecordings, startRecording, uploadComplete } = useVideo();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadMock = async () => {
    setIsUploading(true);
    try {
      // 1. Get Presigned URL
      const { presignedUrl, recordingId } = await startRecording({
        title: `Screen Recording ${new Date().toLocaleDateString()}`,
        description: "Uploaded via Video Library"
      });
      
      // 2. Mock binary upload delay
      await new Promise(r => setTimeout(r, 1000));
      
      // 3. Mark as complete to trigger AI processing
      await uploadComplete(recordingId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col rounded-xl overflow-hidden">
      <main className="flex-1 w-full mx-auto p-6 overflow-auto">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Video Library</h1>
            <p className="text-slate-500">Record your screen or upload videos for AI transcription and summarization.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleUploadMock}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Video
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition"
            >
              <Video className="w-4 h-4" />
              Record Screen
            </button>
          </div>
        </div>

        {isLoadingRecordings ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : recordings.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500">
            No videos recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recordings.map((rec: any) => (
              <Link key={rec.id} to="/dashboard/video" className="block group">
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                    {rec.playbackId ? (
                      <img src={`https://image.mux.com/${rec.playbackId}/thumbnail.jpg?time=0`} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    
                    {rec.status === 'PROCESSING' && (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm z-10">
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-2" />
                          <span className="text-xs text-white font-medium">AI Processing...</span>
                        </div>
                      </div>
                    )}
                    <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all z-20" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{rec.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(rec.createdAt).toLocaleDateString()}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${rec.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

    </div>
  );
}
