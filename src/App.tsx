
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Ranking from "./pages/Ranking";
import Store from "./pages/Store";
import Media from "./pages/Media";
import Missions from "./pages/Missions";
import NewsFeed from "./pages/NewsFeed";
import FactoryMap from "./pages/FactoryMap";
import Scanner from "./pages/Scanner";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/store" element={<Store />} />
        <Route path="/media" element={<Media />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/map" element={<FactoryMap />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
