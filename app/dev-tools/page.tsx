import { cookies } from "next/headers";
import { hashPassword } from "@/lib/auth";
import { DEV_AUTH_COOKIE, devToolsPassword } from "@/lib/devAuth";
import { supabaseServer } from "@/lib/supabase";
import DevToolsLoginForm from "./DevToolsLoginForm";

export const dynamic = "force-dynamic";

const ENV_VARS = [
  "ANTHROPIC_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "APP_PASSWORD",
  "DEV_TOOLS_PASSWORD",
];

export default async function DevToolsPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(DEV_AUTH_COOKIE);
  const expected = await hashPassword(devToolsPassword());

  if (cookie?.value !== expected) {
    return <DevToolsLoginForm />;
  }

  const { data: errorLogs, error } = await supabaseServer()
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="dev-tools">
      <h1>Dev Tools</h1>

      <section>
        <h2>環境変数チェック</h2>
        <ul className="env-check">
          {ENV_VARS.map((name) => (
            <li key={name}>
              <span>{name}</span>
              <span className={process.env[name] ? "ok" : "missing"}>
                {process.env[name] ? "SET" : "NOT SET"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>直近のAPIエラー</h2>
        {error && <p className="dev-error">error_logs の取得に失敗しました: {error.message}</p>}
        {!error && errorLogs?.length === 0 && <p>記録されたエラーはありません。</p>}
        {!error &&
          errorLogs?.map((log) => (
            <div className="error-entry" key={log.id}>
              <div className="error-meta">
                <span className="error-route">{log.route}</span>
                <span className="error-time">{new Date(log.created_at).toLocaleString("ja-JP")}</span>
              </div>
              <div className="error-message">{log.message}</div>
              {log.stack && <pre className="error-stack">{log.stack}</pre>}
              {log.context != null && (
                <pre className="error-stack">{JSON.stringify(log.context, null, 2)}</pre>
              )}
            </div>
          ))}
      </section>
    </div>
  );
}
