# PetShop (monorepo)

Repositório reorganizado como monorepo com duas workspaces:

- `backend` — onde o código atual (antiga pasta `src`) foi movido
- `frontend` — ainda vazio por enquanto

Como usar:

1. Na raiz, execute `npm install` para instalar dependências das workspaces
2. `npm start` para rodar `backend` e `frontend` em paralelo (usa `concurrently`)