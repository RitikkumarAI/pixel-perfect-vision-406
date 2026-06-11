export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export const AgentRegistry: AgentDefinition[] = [
  {
    id: "personal-assistant",
    name: "Personal Assistant Agent",
    description: "An AI assistant to help you manage tasks, schedule meetings, and summarize documents.",
    capabilities: ["Create Tasks", "Summarize Docs", "Schedule Meetings", "Search Workspace"]
  },
  {
    id: "meeting-agent",
    name: "Meeting Agent",
    description: "Specializes in analyzing meeting transcripts, generating action items, and creating follow-ups.",
    capabilities: ["Analyze Meeting Notes", "Generate Action Items", "Create Follow-Ups", "Generate Summaries"]
  },
  {
    id: "project-manager",
    name: "Project Manager Agent",
    description: "Tracks project progress, detects blockers, and generates comprehensive sprint summaries.",
    capabilities: ["Analyze Tasks", "Detect Blockers", "Generate Weekly Reports", "Sprint Summaries"]
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Deeply searches workspace knowledge and answers complex questions based on existing documents.",
    capabilities: ["Search Workspace Knowledge", "Summarize Documents", "Answer Questions"]
  }
];
