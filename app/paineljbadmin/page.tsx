import { authConfigError, isAuthenticated } from "@/lib/auth";
import { listApplications, storageMode } from "@/lib/storage";
import { formatDateSP } from "@/lib/format";
import LoginForm from "./LoginForm";
import Dashboard, { type Row } from "./Dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const cfgError = authConfigError();
  if (cfgError || !(await isAuthenticated())) {
    return <LoginForm configError={cfgError} />;
  }
  const items = await listApplications();
  const rows: Row[] = items.map((a) => ({ ...a, dataHora: formatDateSP(a.createdAt) }));
  return <Dashboard rows={rows} storage={storageMode()} />;
}
