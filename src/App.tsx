import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// Each page's code now loads only when a visitor actually navigates to
// it, instead of all pages being bundled into one large file upfront.
const Home = lazy(() => import("@/pages/Home"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const MyShopsPage = lazy(() => import("@/pages/MyShopsPage"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const AdminJobsPage = lazy(() => import("@/pages/AdminJobsPage"));
const AdminShopsPage = lazy(() => import("@/pages/AdminShopsPage"));
const LaunchPage = lazy(() => import("@/pages/LaunchPage"));
const StorefrontsPage = lazy(() => import("@/pages/StorefrontsPage"));
const RequestsPage = lazy(() => import("@/pages/RequestsPage"));
const PartnersPage = lazy(() => import("@/pages/PartnersPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-950">
    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse/:categoryId" element={<CategoryPage />} />
            <Route path="/my-shops" element={<MyShopsPage />} />
            <Route path="/shops/:slug" element={<ShopPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/shops" element={<AdminShopsPage />} />
            <Route path="/launch" element={<LaunchPage />} />
            <Route path="/storefronts" element={<StorefrontsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/partners" element={<PartnersPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}