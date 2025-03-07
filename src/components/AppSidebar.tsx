
import { Trophy, Map, QrCode, Store, Medal, Home, FileVideo, Package2 } from "lucide-react";
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
  { title: "Missões", icon: Medal, url: "/missoes" },
  { title: "Scanner QR", icon: QrCode, url: "/scanner" },
  { title: "Ranking", icon: Trophy, url: "/ranking" },
  { title: "Produtos", icon: Package2, url: "/produtos" },
  { title: "Mídias", icon: FileVideo, url: "/midias" },
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
