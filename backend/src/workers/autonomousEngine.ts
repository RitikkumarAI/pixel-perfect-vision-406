import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

// -----------------------------------------------------------------------------
// EVENT QUEUES
// -----------------------------------------------------------------------------
export const autonomousQueue = new Queue('AutonomousWorkEngine', { connection });

// -----------------------------------------------------------------------------
// EVENT TYPES
// -----------------------------------------------------------------------------
export enum AutonomousEvent {
  MeetingEnded = 'MeetingEnded',
  TaskOverdue = 'TaskOverdue',
  DocumentCreated = 'DocumentCreated',
  BookingScheduled = 'BookingScheduled',
  PaymentReceived = 'PaymentReceived',
  WorkspaceCreated = 'WorkspaceCreated',
  LeadCaptured = 'LeadCaptured'
}

// -----------------------------------------------------------------------------
// DIGITAL EMPLOYEE WORKERS (SWARM)
// -----------------------------------------------------------------------------

export const autonomousWorker = new Worker('AutonomousWorkEngine', async (job: Job) => {
  const { event, payload } = job.data;
  
  console.log(`[AUTONOMOUS ENGINE] Received Event: ${event}`);

  try {
    switch (event) {
      case AutonomousEvent.MeetingEnded:
        await MeetingAgentWorker(payload);
        break;
      case AutonomousEvent.TaskOverdue:
        await ProjectManagerWorker(payload);
        break;
      case AutonomousEvent.LeadCaptured:
        await SalesAgentWorker(payload);
        break;
      // ... other event handlers
      default:
        console.warn(`[AUTONOMOUS ENGINE] Unhandled event type: ${event}`);
    }
  } catch (error) {
    console.error(`[AUTONOMOUS ENGINE] Workflow Failed for ${event}:`, error);
    throw error;
  }
}, { connection });

// -----------------------------------------------------------------------------
// WORKER IMPLEMENTATIONS
// -----------------------------------------------------------------------------

async function MeetingAgentWorker(payload: any) {
  const { meetingId, workspaceId } = payload;
  console.log(`[MeetingAgentWorker] Analyzing transcript for meeting ${meetingId}...`);
  // 1. Fetch Transcript from pgvector / Mux
  // 2. Execute RAG Prompt for Action Items
  // 3. Create Tasks autonomously
  await prisma.task.create({
    data: {
      title: 'Automated Follow-up (AI Generated)',
      status: 'TODO',
      workspaceId,
      // Extracted from AI reasoning
    }
  });
  
  // Record to AI Action Ledger (Phase U Governance)
  await prisma.aIActionLedger.create({
    data: {
      workspaceId,
      agentId: 'MeetingAgentWorker_01',
      toolUsed: 'create_task',
      inputs: { meetingId },
      outputs: { status: 'success' },
      reasoningChain: 'Detected unassigned action item in meeting transcript.',
      riskScore: 'LOW'
    }
  });
}

async function ProjectManagerWorker(payload: any) {
  const { taskId, assigneeId } = payload;
  console.log(`[ProjectManagerWorker] Reassigning overdue task ${taskId}...`);
  // Logic to reassign or ping user
}

async function SalesAgentWorker(payload: any) {
  const { leadId, email } = payload;
  console.log(`[SalesAgentWorker] Qualifying lead ${email}...`);
  // Qualify lead, draft email
}

export function triggerAutonomousEvent(event: AutonomousEvent, payload: any) {
  return autonomousQueue.add(event, { event, payload });
}
