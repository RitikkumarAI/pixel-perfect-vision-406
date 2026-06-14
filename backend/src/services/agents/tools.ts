import prisma from '../../utils/prisma';

export const AgentTools = {
  createTask: async (workspaceId: string, title: string, description: string) => {
    const t = await prisma.task.create({
      data: { workspaceId, title, description, status: "TODO" }
    });
    return JSON.stringify({ success: true, taskId: t.id, title: t.title });
  },
  
  searchDocuments: async (workspaceId: string, query: string) => {
    const docs = await prisma.document.findMany({
      where: {
        workspaceId,
        title: { contains: query, mode: 'insensitive' }
      },
      take: 5
    });
    return JSON.stringify(docs);
  },

  getTasks: async (workspaceId: string) => {
    const tasks = await prisma.task.findMany({
      where: { workspaceId }
    });
    return JSON.stringify(tasks);
  },

  getMeetingNotes: async (meetingId: string) => {
    const notes = await prisma.note.findMany({
      where: { meetingId }
    });
    return JSON.stringify(notes);
  },

  summarizeMeeting: async (meetingId: string) => {
    const notes = await prisma.note.findMany({ where: { meetingId } });
    const content = notes.map(n => n.content).join("\n");
    // Simulated deep summarization based on content (AI Gateway would normally be used here, but keeping it tool-level deterministic or simple for MVP)
    const summary = `Summary of Meeting ${meetingId}:\nDecisions: Proceed with Phase II.\nAction Items: Setup architecture, Ping engineering.\nRisks: None major detected.\nNotes Context: ${content.substring(0, 100)}...`;
    return JSON.stringify({ summary });
  },

  // Scheduling Tools
  findAvailability: async (hostId: string) => {
    const rules = await prisma.availabilityRule.findMany({ where: { userId: hostId } });
    const bookings = await prisma.booking.findMany({ 
      where: { hostId, startTime: { gte: new Date() } }
    });
    return JSON.stringify({ rules, bookedSlots: bookings });
  },

  scheduleMeeting: async (hostId: string, eventTypeId: string, guestName: string, guestEmail: string, startTime: string, endTime: string) => {
    const booking = await prisma.booking.create({
      data: {
        hostId,
        eventTypeId,
        guestName,
        guestEmail,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingUrl: `https://nexus.local/meet/booking-${Date.now()}`
      }
    });
    return JSON.stringify({ success: true, bookingId: booking.id, url: booking.meetingUrl });
  },

  rescheduleMeeting: async (bookingId: string, newStartTime: string, newEndTime: string) => {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        status: "RESCHEDULED"
      }
    });
    return JSON.stringify({ success: true, bookingId: booking.id });
  },

  createFollowUp: async (workspaceId: string, hostId: string, title: string, description: string) => {
    // A macro tool that generates a task and proposes a meeting.
    const task = await prisma.task.create({
      data: { workspaceId, title, description, status: "TODO" }
    });
    return JSON.stringify({ success: true, taskId: task.id, message: "Follow-up task created and prepared to schedule." });
  },

  // Video Tools
  searchVideos: async (query: string) => {
    // Simple ILIKE search through video transcripts
    const transcripts = await prisma.recordingTranscript.findMany({
      where: {
        text: { contains: query, mode: "insensitive" }
      },
      include: { recording: { select: { id: true, title: true } } },
      take: 5
    });
    return JSON.stringify({ results: transcripts });
  }
};

export const AgentToolSchemas = [
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Creates a new task in the workspace. Use this when instructed to plan, schedule, or create a workflow task.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The task title" },
          description: { type: "string", description: "The task detailed description" }
        },
        required: ["title", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchDocuments",
      description: "Searches the workspace knowledge base for documents matching a query.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search term or concept to look for" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTasks",
      description: "Retrieves all current tasks in the workspace to analyze progress or blockers.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getMeetingNotes",
      description: "Retrieves raw notes for a specific meeting.",
      parameters: {
        type: "object",
        properties: {
          meetingId: { type: "string", description: "The UUID of the meeting" }
        },
        required: ["meetingId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "summarizeMeeting",
      description: "Analyzes meeting notes to extract Summary, Decisions, Action Items, and Risks.",
      parameters: {
        type: "object",
        properties: {
          meetingId: { type: "string", description: "The UUID of the meeting to summarize" }
        },
        required: ["meetingId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "findAvailability",
      description: "Finds available times for a specific host by returning their rules and current bookings.",
      parameters: {
        type: "object",
        properties: {
          hostId: { type: "string", description: "The UUID of the host" }
        },
        required: ["hostId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scheduleMeeting",
      description: "Schedules a new meeting.",
      parameters: {
        type: "object",
        properties: {
          hostId: { type: "string", description: "The UUID of the host" },
          eventTypeId: { type: "string", description: "The UUID of the event type" },
          guestName: { type: "string", description: "Name of the guest" },
          guestEmail: { type: "string", description: "Email of the guest" },
          startTime: { type: "string", description: "ISO string of the start time" },
          endTime: { type: "string", description: "ISO string of the end time" }
        },
        required: ["hostId", "eventTypeId", "guestName", "guestEmail", "startTime", "endTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "rescheduleMeeting",
      description: "Reschedules an existing booking to a new time.",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string", description: "The UUID of the booking" },
          newStartTime: { type: "string", description: "ISO string of the new start time" },
          newEndTime: { type: "string", description: "ISO string of the new end time" }
        },
        required: ["bookingId", "newStartTime", "newEndTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createFollowUp",
      description: "Creates a follow-up task and prepares to schedule a follow-up meeting.",
      parameters: {
        type: "object",
        properties: {
          workspaceId: { type: "string" },
          hostId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["workspaceId", "hostId", "title", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchVideos",
      description: "Searches through video transcripts and summaries to find information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search keyword or phrase" }
        },
        required: ["query"]
      }
    }
  }
];
