import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { login } from "../api/auth";
import { tokenStore } from "../api/client";
import logo from "../assets/logo_glass.png";
import Button from "../components/Button";
import Card from "../components/Card";

const LABEL_CLASS = "block px-4 py-2.5 focus-within:bg-white/50";
const LABEL_TEXT_CLASS = "block text-xs font-medium text-neutral-500";
const INPUT_CLASS = "mt-0.5 w-full bg-transparent text-base outline-none";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => navigate("/", { replace: true }),
  });

  if (tokenStore.get()) return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Logo Berkah Angsana" className="h-24 w-auto" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Berkah Angsana</h1>
          <p className="mt-1 text-sm text-neutral-500">Pengajuan Pembelian dan Pembayaran</p>
        </div>

        <form
          className="mt-7 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({ username, password });
          }}
        >
          <div className="divide-y divide-ink/8 overflow-hidden rounded-2xl bg-white/60 ring-1 ring-ink/5">
            <label className={LABEL_CLASS}>
              <span className={LABEL_TEXT_CLASS}>Username</span>
              <input
                required
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <div className="relative">
              <label className={`${LABEL_CLASS} pr-14`}>
                <span className={LABEL_TEXT_CLASS}>Password</span>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-1 flex w-12 cursor-pointer items-center justify-center text-neutral-500 hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-5" strokeWidth={1.5} />
                ) : (
                  <Eye className="size-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {mutation.isError && (
            <p role="alert" className="rounded-2xl bg-primary-50/80 px-4 py-3 text-sm text-primary-800">
              {mutation.error.message}
            </p>
          )}

          <Button type="submit" chevrons={!mutation.isPending} disabled={mutation.isPending}>
            {mutation.isPending ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      </Card>
      <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Berkah Angsana</p>
    </main>
  );
}
