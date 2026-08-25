import type { OfficialOnboardingVideoKey } from "./types";
export const officialOnboardingVideos: Record<OfficialOnboardingVideoKey, { src: string; label: string }> = {
  "company-data": { src: "/onboarding-videos/company-data.webm", label: "Dados da empresa" },
  "business-hours": { src: "/onboarding-videos/business-hours.webm", label: "Horário de funcionamento" },
  "first-professional": { src: "/onboarding-videos/first-professional.webm", label: "Primeiro profissional" },
  "first-service": { src: "/onboarding-videos/first-service.webm", label: "Primeiro serviço" },
  appearance: { src: "/onboarding-videos/appearance.webm", label: "Personalização" },
  notifications: { src: "/onboarding-videos/notifications.webm", label: "Notificações" },
  "test-booking": { src: "/onboarding-videos/test-booking.webm", label: "Agendamento de teste" },
  publish: { src: "/onboarding-videos/publish.webm", label: "Publicar link" },
};
export function videoSrc(key: OfficialOnboardingVideoKey): string { return officialOnboardingVideos[key].src; }
