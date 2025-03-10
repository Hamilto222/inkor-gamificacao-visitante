
import { Trophy, Map, QrCode, Store, Medal, Home, FileVideo, Package2, MessageSquare } from "lucide-react";
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
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Início", icon: Home, url: "/" },
  { title: "Mapa da Fábrica", icon: Map, url: "/map" },
  { title: "Missões", icon: Medal, url: "/missions" },
  { title: "Scanner QR", icon: QrCode, url: "/scanner" },
  { title: "Ranking", icon: Trophy, url: "/ranking" },
  { title: "Feed de Notícias", icon: MessageSquare, url: "/news" },
  { title: "Mídias", icon: FileVideo, url: "/media" },
  { title: "Loja de Prêmios", icon: Store, url: "/store" },
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
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
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
  );
}
