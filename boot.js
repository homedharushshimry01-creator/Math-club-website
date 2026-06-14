async function loadApp() {
  try {
    await import("/src/main.tsx");
    return;
  } catch {
    const isDistBoot = new URL(import.meta.url).pathname.includes("/dist/");
    const cssHref = isDistBoot ? "./style.css" : "/dist/style.css";
    const appSrc = isDistBoot ? "./app.js" : "/dist/app.js";

    if (!document.querySelector('link[data-mathclub-static-style]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      link.dataset.mathclubStaticStyle = "true";
      document.head.appendChild(link);
    }

    await import(appSrc);
  }
}

loadApp();
