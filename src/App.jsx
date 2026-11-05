import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from "react-router";
import { ApiError, tokenStore } from "./api/client";
import AppLayout from "./layouts/AppLayout";
import Beranda from "./pages/Beranda";
import DetailPengajuan from "./pages/DetailPengajuan";
import FormPengajuan from "./pages/FormPengajuan";
import Login from "./pages/Login";
import Pengajuan from "./pages/Pengajuan";
import Riwayat from "./pages/Riwayat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Error 4xx tidak akan berubah bila diulang.
      retry: (count, error) =>
        count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
      refetchOnWindowFocus: false,
    },
  },
});

function RequireAuth() {
  return tokenStore.get() ? <Outlet /> : <Navigate to="/login" replace />;
}

// Data router diperlukan oleh useBlocker di form.
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Beranda />} />
          <Route path="pengajuan" element={<Pengajuan />} />
          <Route path="pengajuan/baru" element={<FormPengajuan />} />
          <Route path="pengajuan/:id" element={<DetailPengajuan />} />
          <Route path="riwayat" element={<Riwayat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </>,
  ),
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
