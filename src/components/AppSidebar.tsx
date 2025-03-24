
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
import { useIsMobile, isMobileApp } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "Início", icon: Home, url: "/" },
  { title: "Mapa da Fábrica", icon: Map, url: "/map" },
  { title: "Missões", icon: Medal, url: "/missions" },
  { title: "Scanner QR", icon: QrCode, url: "/scanner" },
  { title: "Ranking", icon: Trophy, url: "/ranking" },
  { title: "Feed de Notícias", icon: MessageSquare, url: "/news" },
  { title: "Mídias", icon: FileVideo, url: "/media" },
  { title: "Loja de Prêmios", icon: Store, url: "/store" },
  { title: "Produtos", icon: Package2, url: "/products" }
];

export function AppSidebar() {
  const isMobile = useIsMobile();
  const isApp = isMobileApp();
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  
  // Only show mobile nav in certain pages
  useEffect(() => {
    if (isMobile && isApp) {
      const isAdminPage = window.location.pathname.includes("/admin");
      setMobileNavVisible(!isAdminPage);
    } else {
      setMobileNavVisible(false);
    }
  }, [isMobile, isApp]);

  if (isApp && isMobile && mobileNavVisible) {
    // Render bottom navigation bar instead of sidebar for mobile apps
    return (
      <nav className="mobile-nav">
        {menuItems.slice(0, 5).map((item) => (
          <Link 
            to={item.url} 
            key={item.title}
            className="flex flex-col items-center justify-center p-1 w-full"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </nav>
    );
  }

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
