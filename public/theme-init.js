(function () {
  var theme = "dark";
  var customerAppContextMeta = document.querySelector('meta[name="agendoro-customer-app-context"]');

  try {
    var storedTheme = window.localStorage.getItem("agendoro-theme");
    if (storedTheme === "dark" || storedTheme === "light-pastel") {
      theme = storedTheme;
    }
  } catch (_error) {
    theme = "dark";
  }

  if (window.location.pathname.indexOf("/c/") === 0 || window.location.pathname === "/c") {
    var manifestLink = document.createElement("link");
    manifestLink.setAttribute("rel", "manifest");
    manifestLink.setAttribute("href", "/customer-app.webmanifest");
    document.head.appendChild(manifestLink);

    if (customerAppContextMeta) {
      customerAppContextMeta.setAttribute("content", "customer-app");
    }
  } else if (customerAppContextMeta) {
    customerAppContextMeta.setAttribute("content", "browser");
  }

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
})();
