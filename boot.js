async function loadApp() {
  if (!document.querySelector("link[data-mathclub-static-style]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./style.css";
    link.dataset.mathclubStaticStyle = "true";
    document.head.appendChild(link);
  }
  await import("./app.js");
}
loadApp();
