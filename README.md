# airtestto-docs

Portal público de documentação do backend **airtestto** e das interfaces que o consomem. O site é gerado com [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

O código-fonte dos serviços permanece nos repositórios privados. Este repositório guarda apenas a documentação publicada.

## Pré-visualizar

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Abra `http://127.0.0.1:8000`.

## Publicação

Cada push na branch `main` gera o site e publica no GitHub Pages.
