import prisma from '../utils/prisma';
import { Server } from 'socket.io';

export class VideoService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Submit a raw video file URL to be transcoded into an HLS stream.
   * This mocks sending a job payload to AWS MediaConvert or Mux API.
   */
  public async processVideo(recordingId: string, uploaderId: string, rawFileUrl: string) {
    // 1. Mark recording as PROCESSING
    const recording = await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'PROCESSING' }
    });

    // 2. Mock sending API payload to Mux/MediaConvert
    console.log(`[VideoService] Submitting job to transcoder for: ${rawFileUrl}`);

    // 3. Emit real-time status to the uploader's active sockets
    this.io.emit(`video:${uploaderId}`, { recordingId, status: 'PROCESSING' });

    // 4. Simulate a delayed webhook callback from the transcoder
    setTimeout(() => {
      this.simulateTranscoderWebhook(recordingId, uploaderId);
    }, 10000); // 10 second mock processing time

    return recording;
  }

  /**
   * Handle webhook payloads from the transcoder indicating job completion.
   */
  public async handleWebhook(recordingId: string, hlsUrl: string, status: string) {
    const recording = await prisma.recording.update({
      where: { id: recordingId },
      data: { 
        status: status === 'finished' ? 'READY' : 'FAILED',
        hlsUrl 
      }
    });

    // Notify connected clients
    this.io.emit(`video:${recording.uploaderId}`, { 
      recordingId, 
      status: recording.status,
      hlsUrl 
    });

    return recording;
  }

  /**
   * Simulated internal method mimicking a third-party webhook arriving
   */
  private async simulateTranscoderWebhook(recordingId: string, uploaderId: string) {
    console.log(`[VideoService] Mock transcoder finished for ${recordingId}`);
    
    // Generate a fake HLS url
    const fakeHls = `https://cdn.nexus.local/hls/${recordingId}/master.m3u8`;
    
    await this.handleWebhook(recordingId, fakeHls, 'finished');
  }

  public async getRecording(recordingId: string) {
    return prisma.recording.findUnique({
      where: { id: recordingId }
    });
  }
}
