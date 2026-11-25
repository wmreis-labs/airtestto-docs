var scalarVersion = "1.83.0";

function scalarEstaEscuro() {
  return document.body.getAttribute("data-md-color-scheme") === "slate";
}

function urlDoContrato(nome) {
  return new URL("../../openapi/" + nome + ".yaml", document.baseURI).href;
}

function montarReferencia() {
  var el = document.getElementById("scalar-referencia");
  if (!el || el.dataset.mounted === "1") {
    return;
  }
  el.dataset.mounted = "1";

  import(
    "https://cdn.jsdelivr.net/npm/@scalar/api-reference@" +
      scalarVersion +
      "/esm.js"
  )
    .then(function (mod) {
      return mod.createApiReference("#scalar-referencia", {
        theme: "default",
        darkMode: scalarEstaEscuro(),
        sources: [
          { title: "Vendas", slug: "sales", url: urlDoContrato("sales") },
          {
            title: "Financeiro",
            slug: "financial",
            url: urlDoContrato("financial"),
          },
          {
            title: "Flipping",
            slug: "flipping",
            url: urlDoContrato("flipping"),
          },
          {
            title: "Assistant",
            slug: "assistant",
            url: urlDoContrato("assistant"),
          },
        ],
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
