import { html, nothing } from "lit";
import { t } from "../../i18n/index.js";
import { formatRelativeTimestamp } from "../format.js";
import type { GoogleChatStatus } from "../types.js";
import { renderChannelConfigSection } from "./channels.config.js";
import type { ChannelsProps } from "./channels.types.js";

export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.googlechat.title")}</div>
      <div class="card-sub">${t("channels.googlechat.subtitle")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.status.configured")}</span>
          <span>${googleChat ? (googleChat.configured ? t("common.yes") : t("common.no")) : t("common.notAvailable")}</span>
        </div>
        <div>
          <span class="label">${t("channels.status.running")}</span>
          <span>${googleChat ? (googleChat.running ? t("common.yes") : t("common.no")) : t("common.notAvailable")}</span>
        </div>
        <div>
          <span class="label">${t("channels.status.credential")}</span>
          <span>${googleChat?.credentialSource ?? t("common.notAvailable")}</span>
        </div>
        <div>
          <span class="label">${t("channels.status.audience")}</span>
          <span>
            ${
              googleChat?.audienceType
                ? `${googleChat.audienceType}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
                : t("common.notAvailable")
            }
          </span>
        </div>
        <div>
          <span class="label">${t("channels.status.lastStart")}</span>
          <span>${googleChat?.lastStartAt ? formatRelativeTimestamp(googleChat.lastStartAt) : t("common.notAvailable")}</span>
        </div>
        <div>
          <span class="label">${t("channels.status.lastProbe")}</span>
          <span>${googleChat?.lastProbeAt ? formatRelativeTimestamp(googleChat.lastProbeAt) : t("common.notAvailable")}</span>
        </div>
      </div>

      ${
        googleChat?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${googleChat.lastError}
          </div>`
          : nothing
      }

      ${
        googleChat?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${t("channels.probe")} ${googleChat.probe.ok ? t("channels.probeOk") : t("channels.probeFailed")} ·
            ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "googlechat", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.probe")}
        </button>
      </div>
    </div>
  `;
}
