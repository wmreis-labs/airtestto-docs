var scalarVersion = "1.83.0";

function scalarEstaEscuro() {
  return document.body.getAttribute("data-md-color-scheme") === "slate";
}

function carregarEstilo() {
  var href =
    "https://cdn.jsdelivr.net/npm/@scalar/api-reference@" +
    scalarVersion +
    "/dist/style.css";
  if (document.querySelector("link[data-scalar-style]")) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.scalarStyle = "1";
    link.onload = function () {
      resolve();
    };
    link.onerror = function () {
      reject(new Error("css"));
    };
    document.head.appendChild(link);
  });
}

function montarReferencia() {
  var el = document.getElementById("scalar-referencia");
  if (!el || el.dataset.mounted === "1") {
    return;
  }
  el.dataset.mounted = "1";

  var indexUrl = new URL("../../openapi/index.json", document.baseURI).href;
  Promise.all([
    carregarEstilo(),
    fetch(indexUrl).then(function (response) {
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      return response.json();
    }),
    import(
      "https://cdn.jsdelivr.net/npm/@scalar/api-reference@" +
        scalarVersion +
        "/esm.js"
    ),
  ])
    .then(function (result) {
      var index = result[1];
      var mod = result[2];
      return mod.createApiReference("#scalar-referencia", {
        theme: "default",
        darkMode: scalarEstaEscuro(),
        sources: index.map(function (item) {
          return {
            title: item.title,
            slug: item.slug,
            url: new URL("../../openapi/" + item.file, document.baseURI).href,
          };
        }),
      });
    })
    .then(function (app) {
      if (!app || typeof app.updateConfiguration !== "function") {
        return;
      }
      var observer = new MutationObserver(function () {
        app.updateConfiguration({ darkMode: scalarEstaEscuro() });
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-md-color-scheme"],
      });
    })
    .catch(function () {
      el.textContent = "A referência da API não carregou.";
    });
}

if (typeof document$ !== "undefined" && document$.subscribe) {
  document$.subscribe(montarReferencia);
} else {
  document.addEventListener("DOMContentLoaded", montarReferencia);
}
