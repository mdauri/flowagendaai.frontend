export type HelpEventName = "help_center_opened" | "help_search" | "help_article_opened" | "help_contextual_link_clicked" | "help_support_clicked";
export function trackHelpEvent(name: HelpEventName, payload: Record<string, unknown> = {}) { if (typeof window === "undefined") return; window.dispatchEvent(new CustomEvent("agendoro:help-event", { detail: { name, payload } })); }
