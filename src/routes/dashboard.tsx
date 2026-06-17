import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, MessageSquare, Video, KanbanSquare, FileText, Calendar, Bot, Shield, BarChart, Film, CreditCard } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    // Check auth synchronously
    const token = localStorage.getItem("token");
    if (!token) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const items = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Chat", url: "/dashboard/chat", icon: MessageSquare },
    { title: "Meetings", url: "/dashboard/meetings", icon: Video },
    { title: "Tasks", url: "/dashboard/kanban", icon: KanbanSquare },
    { title: "Documents", url: "/dashboard/docs", icon: FileText },
    { title: "Recordings", url: "/dashboard/video", icon: Film },
    { title: "Scheduling", url: "/dashboard/scheduling", icon: Calendar },
    { title: "AI Agents", url: "/dashboard/agents", icon: Bot },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart },
    { title: "Security", url: "/dashboard/security", icon: Shield },
    { title: "Webhooks", url: "/dashboard/webhooks", icon: Shield },
    { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Nexus Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
