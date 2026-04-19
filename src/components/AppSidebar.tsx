import {
  CreditCard,
  Contact,
  FileImage,
  BookOpen,
  Presentation,
  FileSignature,
  Mail,
  LibraryBig,
  LayoutDashboard,
  Home as HomeIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; icon: React.ElementType; soon?: boolean };

const studio: Item[] = [
  { title: "Studio", url: "/home", icon: HomeIcon },
];

const create: Item[] = [
  { title: "ID Cards", url: "/id-cards", icon: CreditCard },
  { title: "Business Cards", url: "/visiting-cards", icon: Contact },
  { title: "Flyers", url: "/flyers", icon: FileImage, soon: true },
  { title: "Brochures", url: "/brochures", icon: BookOpen, soon: true },
  { title: "Presentations", url: "/presentations", icon: Presentation, soon: true },
  { title: "Proposals", url: "/proposals", icon: FileSignature, soon: true },
  { title: "Letterheads", url: "/letterheads", icon: Mail, soon: true },
];

const work: Item[] = [
  { title: "Library", url: "/visiting-cards?tab=library", icon: LibraryBig },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const nav = useNavigate();

  const isActive = (url: string) => {
    const path = url.split("?")[0];
    return location.pathname === path;
  };

  const renderItem = (item: Item) => {
    const Icon = item.icon;
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.url}
            className={cn(
              "flex items-center gap-2",
              active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="flex-1 truncate">{item.title}</span>
            )}
            {!collapsed && item.soon && (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Soon
              </span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-foreground truncate">Unite Solar</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">Design Studio</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{studio.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{create.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your work</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{work.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={async () => {
                await signOut();
                nav("/");
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
