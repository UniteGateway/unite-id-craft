import {
  LayoutDashboard,
  Sparkles,
  FileText,
  LayoutTemplate,
  Image as ImageIcon,
  Palette,
  Settings as SettingsIcon,
  Briefcase,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/solar", icon: LayoutDashboard, end: true },
  { title: "Generate Proposal", url: "/solar/generate", icon: Sparkles },
  { title: "Techno-Commercial", url: "/proposal-variable-slides", icon: Briefcase },
  { title: "My Proposals", url: "/solar/proposals", icon: FileText },
  { title: "Templates", url: "/solar/templates", icon: LayoutTemplate },
  { title: "Assets", url: "/solar/assets", icon: ImageIcon },
  { title: "Branding", url: "/solar/branding", icon: Palette },
  { title: "Settings", url: "/solar/settings", icon: SettingsIcon },
];

export function SolarSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Solar Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.end
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className={cn(
                          "flex items-center gap-2",
                          isActive && "text-primary font-medium",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default SolarSidebar;