import { request, tokenStore } from "./client";

export async function login({ username, password }) {
  const data = await request("/auth/pegawai/login-mobile", {
    method: "POST",
    body: { username, password },
    skipAuthRedirect: true,
  });
  tokenStore.set(data.access_token);
}

export function logout() {
  tokenStore.clear();
}
