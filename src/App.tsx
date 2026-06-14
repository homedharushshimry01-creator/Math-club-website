import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import PastPapers from "./pages/PastPapers";
import SubmitProblem from "./pages/SubmitProblem";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { AuthProvider } from "./lib/auth";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/papers" element={<PastPapers />} />
              <Route path="/submit" element={<SubmitProblem />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
