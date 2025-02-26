
import { Trophy, Map, QrCode, Store, Medal, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Início", icon: Home, url: "/" },
  { title: "Mapa da Fábrica", icon: Map, url: "/mapa" },
  { title: "Scanner QR", icon: QrCode, url: "/scanner" },
  { title: "Conquistas", icon: Medal, url: "/conquistas" },
  { title: "Ranking", icon: Trophy, url: "/ranking" },
  { title: "Loja de Prêmios", icon: Store, url: "/loja" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inkor Tour</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
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
  );
}

