import { html } from "lit";
import { t } from "../../i18n/index.js";
import { formatRelativeTimestamp, formatDurationHuman } from "../format.js";
import type { GatewayHelloOk } from "../gateway.js";
import { formatNextRun } from "../presenter.js";
import type { UiSettings } from "../storage.js";

export type OverviewProps = {
  connected: boolean;
  hello: GatewayHelloOk | null;
  settings: UiSettings;
  password: string;
  lastError: string | null;
  presenceCount: number;
  sessionsCount: number | null;
  cronEnabled: boolean | null;
  cronNext: number | null;
  lastChannelsRefresh: number | null;
  onSettingsChange: (next: UiSettings) => void;
  onPasswordChange: (next: string) => void;
  onSessionKeyChange: (next: string) => void;
  onConnect: () => void;
  onRefresh: () => void;
};

export function renderOverview(props: OverviewProps) {
  const snapshot = props.hello?.snapshot as
    | { uptimeMs?: number; policy?: { tickIntervalMs?: number } }
    | undefined;
  const uptime = snapshot?.uptimeMs
    ? formatDurationHuman(snapshot.uptimeMs)
    : t("common.notAvailable");
  const tick = snapshot?.policy?.tickIntervalMs
    ? `${snapshot.policy.tickIntervalMs}ms`
    : t("common.notAvailable");
  const authHint = (() => {
    if (props.connected || !props.lastError) {
      return null;
    }
    const lower = props.lastError.toLowerCase();
    const authFailed = lower.includes("unauthorized") || lower.includes("connect failed");
    if (!authFailed) {
      return null;
    }
    const hasToken = Boolean(props.settings.token.trim());
    const hasPassword = Boolean(props.password.trim());
    if (!hasToken && !hasPassword) {
      return html`
        <div class="muted" style="margin-top: 8px;">
          ${t("overview.auth.required")}
          <div style="margin-top: 6px;">
            <span class="mono">openclaw dashboard --no-open</span> → tokenized URL<br />
            <span class="mono">openclaw doctor --generate-gateway-token</span> → set token
          </div>
          <div style="margin-top: 6px;">
            <a
              class="session-link"
              href="https://docs.openclaw.ai/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="${t("overview.auth.docsLink")}"
              >${t("overview.auth.docsLink")}</a
            >
          </div>
        </div>
      `;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        ${t("overview.auth.failed")}
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.openclaw.ai/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="${t("overview.auth.docsLink")}"
            >${t("overview.auth.docsLink")}</a
          >
        </div>
      </div>
    `;
  })();
  const insecureContextHint = (() => {
    if (props.connected || !props.lastError) {
      return null;
    }
    const isSecureContext = typeof window !== "undefined" ? window.isSecureContext : true;
    if (isSecureContext) {
      return null;
    }
    const lower = props.lastError.toLowerCase();
    if (!lower.includes("secure context") && !lower.includes("device identity required")) {
      return null;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        ${t("overview.insecure.hint")}
        <div style="margin-top: 6px;">
          ${t("overview.insecure.configHint")}
        </div>
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.openclaw.ai/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="${t("overview.insecure.tailscaleLink")}"
            >${t("overview.insecure.tailscaleLink")}</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.openclaw.ai/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="${t("overview.insecure.insecureLink")}"
            >${t("overview.insecure.insecureLink")}</a
          >
        </div>
      </div>
    `;
  })();

  return html`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">${t("overview.gatewayAccess.title")}</div>
        <div class="card-sub">${t("overview.gatewayAccess.subtitle")}</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>${t("overview.gatewayAccess.wsUrl")}</span>
            <input
              .value=${props.settings.gatewayUrl}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, gatewayUrl: v });
              }}
              placeholder="${t("overview.gatewayAccess.wsUrlPlaceholder")}"
            />
          </label>
          <label class="field">
            <span>${t("overview.gatewayAccess.token")}</span>
            <input
              .value=${props.settings.token}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, token: v });
              }}
              placeholder="${t("overview.gatewayAccess.tokenPlaceholder")}"
            />
          </label>
          <label class="field">
            <span>${t("overview.gatewayAccess.password")}</span>
            <input
              type="password"
              .value=${props.password}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onPasswordChange(v);
              }}
              placeholder="${t("overview.gatewayAccess.passwordPlaceholder")}"
            />
          </label>
          <label class="field">
            <span>${t("overview.gatewayAccess.sessionKey")}</span>
            <input
              .value=${props.settings.sessionKey}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSessionKeyChange(v);
              }}
            />
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${() => props.onConnect()}>${t("overview.gatewayAccess.connect")}</button>
          <button class="btn" @click=${() => props.onRefresh()}>${t("overview.gatewayAccess.refresh")}</button>
          <span class="muted">${t("overview.gatewayAccess.connectHint")}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">${t("overview.snapshot.title")}</div>
        <div class="card-sub">${t("overview.snapshot.subtitle")}</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">${t("overview.snapshot.status")}</div>
            <div class="stat-value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? t("overview.snapshot.connected") : t("overview.snapshot.disconnected")}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">${t("overview.snapshot.uptime")}</div>
            <div class="stat-value">${uptime}</div>
          </div>
          <div class="stat">
            <div class="stat-label">${t("overview.snapshot.tickInterval")}</div>
            <div class="stat-value">${tick}</div>
          </div>
          <div class="stat">
            <div class="stat-label">${t("overview.snapshot.lastChannelsRefresh")}</div>
            <div class="stat-value">
              ${
                props.lastChannelsRefresh
                  ? formatRelativeTimestamp(props.lastChannelsRefresh)
                  : t("common.notAvailable")
              }
            </div>
          </div>
        </div>
        ${
          props.lastError
            ? html`<div class="callout danger" style="margin-top: 14px;">
              <div>${props.lastError}</div>
              ${authHint ?? ""}
              ${insecureContextHint ?? ""}
            </div>`
            : html`<div class="callout" style="margin-top: 14px;">
              ${t("overview.snapshot.channelsHint")}
            </div>`
        }
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">${t("overview.stats.instances")}</div>
        <div class="stat-value">${props.presenceCount}</div>
        <div class="muted">${t("overview.stats.instancesHint")}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">${t("overview.stats.sessions")}</div>
        <div class="stat-value">${props.sessionsCount ?? t("common.notAvailable")}</div>
        <div class="muted">${t("overview.stats.sessionsHint")}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">${t("overview.stats.cron")}</div>
        <div class="stat-value">
          ${
            props.cronEnabled == null
              ? t("common.notAvailable")
              : props.cronEnabled
                ? t("overview.stats.cronEnabled")
                : t("overview.stats.cronDisabled")
          }
        </div>
        <div class="muted">${t("overview.stats.cronNextWake", { time: formatNextRun(props.cronNext) })}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">${t("overview.notes.title")}</div>
      <div class="card-sub">${t("overview.notes.subtitle")}</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">${t("overview.notes.tailscale")}</div>
          <div class="muted">${t("overview.notes.tailscaleHint")}</div>
        </div>
        <div>
          <div class="note-title">${t("overview.notes.sessionHygiene")}</div>
          <div class="muted">${t("overview.notes.sessionHygieneHint")}</div>
        </div>
        <div>
          <div class="note-title">${t("overview.notes.cronReminders")}</div>
          <div class="muted">${t("overview.notes.cronRemindersHint")}</div>
        </div>
      </div>
    </section>
  `;
}
