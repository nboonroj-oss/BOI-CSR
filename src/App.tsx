import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { ProjectProvider } from './ProjectContext';
import { Header, Footer } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { InquiryPage } from './pages/InquiryPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <ProjectProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-32 pb-20 px-6 md:px-12">
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/project/:id" element={<ProjectDetailPage />} />
                <Route path="/inquiry" element={<InquiryPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ProjectProvider>
  );
}
