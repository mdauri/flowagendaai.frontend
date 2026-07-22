self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {
    title: "Agendoro",
    body: "Voce tem uma atualizacao no app do cliente.",
    url: "/",
    tag: "agendoro-customer-app",
  };

  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
      tag: payload.tag,
      icon: "/agendoro-logo.png",
      badge: "/agendoro-logo.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url === targetUrl) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
