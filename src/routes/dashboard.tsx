import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, MessageSquare, Video, KanbanSquare, FileText } from "lucide-react";

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
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
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
