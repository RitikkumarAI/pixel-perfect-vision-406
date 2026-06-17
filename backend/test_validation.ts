const API_URL = "http://localhost:5005/api/v1";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log("Starting Production Validation Audit...\n");

  const results: any = {};

  const email = `test_${Date.now()}@nexus.com`;
  const password = "Password123!";
  let token = "";
  let userId = "";
  let orgId = "";

  // 1. User Signup
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: "Audit User" }),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) {
      token = data.accessToken;
      userId = data.user.id;
      results["Authentication (Signup)"] = "PASS";
    } else {
      results["Authentication (Signup)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Authentication (Signup)"] = `FAIL (${err.message})`;
  }

  // 2. Create Workspace
  try {
    const domain = `audit-${Date.now()}.com`;
    const res = await fetch(`${API_URL}/orgs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Audit Workspace", domain }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      orgId = data.id;
      results["Workspaces (Create)"] = "PASS";
    } else {
      results["Workspaces (Create)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Workspaces (Create)"] = `FAIL (${err.message})`;
  }

  // 3. Create Meeting
  let meetingId = "";
  try {
    const res = await fetch(`${API_URL}/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Audit Meeting", orgId, type: "video" }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      meetingId = data.id;
      results["Meetings (Create)"] = "PASS";
    } else {
      results["Meetings (Create)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Meetings (Create)"] = `FAIL (${err.message})`;
  }

  // 3. Get Workspace ID
  let workspaceId = "";
  try {
    const res = await fetch(`${API_URL}/orgs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.length > 0 && data[0].teams?.[0]?.workspaces?.[0]) {
      workspaceId = data[0].teams[0].workspaces[0].id;
    } else {
      results["Workspaces (Fetch)"] = "FAIL (No workspace found)";
    }
  } catch (err: any) {
    results["Workspaces (Fetch)"] = `FAIL (${err.message})`;
  }

  // 4. Tasks
  let taskId = "";
  try {
    if (!workspaceId) throw new Error("Missing workspaceId");
    const res = await fetch(`${API_URL}/tasks/workspaces/${workspaceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Audit Task", status: "TODO" }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      taskId = data.id;
      results["Tasks (Create)"] = "PASS";
    } else {
      results["Tasks (Create)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Tasks (Create)"] = `FAIL (${err.message})`;
  }

  // 5. Documents
  try {
    if (!workspaceId) throw new Error("Missing workspaceId");
    const res = await fetch(`${API_URL}/documents/workspaces/${workspaceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Audit Doc", content: "Audit test" }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      results["Documents (Create)"] = "PASS";
    } else {
      results["Documents (Create)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Documents (Create)"] = `FAIL (${err.message})`;
  }

  // 6. Agents
  try {
    if (!workspaceId) throw new Error("Missing workspaceId");
    const res = await fetch(`${API_URL}/agents/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ agentId: "project-manager", workspaceId, input: "Hello" }),
    });
    const data = await res.json();
    if (res.ok) {
      results["AI Agents (Run)"] = "PASS";
    } else {
      results["AI Agents (Run)"] = `PARTIAL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["AI Agents (Run)"] = `FAIL (${err.message})`;
  }

  // 7. Logout / Login
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) {
      results["Authentication (Login)"] = "PASS";
    } else {
      results["Authentication (Login)"] = `FAIL (${JSON.stringify(data)})`;
    }
  } catch (err: any) {
    results["Authentication (Login)"] = `FAIL (${err.message})`;
  }

  console.log("RESULTS:", JSON.stringify(results, null, 2));
}

runAudit().catch(console.error);
