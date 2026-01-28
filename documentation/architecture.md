# Documentação de Arquitetura do Projeto PetShop

## 1. Visão Geral

O projeto **PetShop** é uma aplicação web full-stack desenvolvida com foco em simplicidade, performance e modularidade. A arquitetura segue uma abordagem de **Monólito Modular**, onde o backend e o frontend coexistem no mesmo repositório e compartilham a infraestrutura de execução, mas mantêm uma separação clara de responsabilidades por domínios de negócio.

A aplicação utiliza **Node.js** com **Express** para o servidor backend e **SQLite** como banco de dados. O frontend é construído com **HTML/CSS** e **TypeScript** vanilla, utilizando um middleware customizado para transpilação on-the-fly de assets, eliminando a necessidade de um passo de build complexo separado para o frontend durante o desenvolvimento.

## 2. Tecnologias

### Core
- **Runtime:** Node.js (Versão LTS recomendada >= 20.x)
- **Linguagem:** TypeScript (Configurado com `strict: true` e `esnext`)
- **Framework Backend:** Express.js v5.x
- **Banco de Dados:** SQLite (via driver `sqlite3` e wrapper `sqlite`)

### Ferramentas de Desenvolvimento & Build
- **Transpiler/Bundler:** esbuild (Utilizado para transpilação em tempo real de scripts frontend)
- **Executor:** tsx (Para execução de arquivos TypeScript no backend)
- **Testes:** Vitest (Framework de testes unitários e integração) + vitest-mock-extended
- **Linter/Formatter:** Biome (Substituto moderno para ESLint/Prettier)

## 3. Estrutura do Projeto

A estrutura de diretórios reflete a separação por domínios (Feature-based) no backend e a separação por camadas técnicas no frontend.

```
src/
├── constants/         # Constantes globais e configurações (ex: portas e caminhos)
├── database/          # Configuração, conexão, seeds e definições de tabelas do SQLite
├── errors/            # Classes de erro customizadas (AppError, InternalServerError)
├── middlewares/       # Middlewares globais do Express (Transpiração, Tratamento de Erros)
├── modules/           # Módulos de Domínio (Business Logic)
│   ├── auth/          # Exemplo de Módulo: Autenticação
│   │   ├── controllers/ # Controladores HTTP
│   │   ├── providers/   # Provedores de funcionalidades específicas
│   │   ├── routers/     # Definição de rotas do módulo
│   │   ├── services/    # Regras de negócio (Use Cases)
│   │   └── tests/       # Testes unitários do módulo
│   ├── bookings/      # Módulo de Agendamentos
│   ├── pets/          # Módulo de Pets
│   ├── users/         # Módulo de Usuários
│   └── jobs/          # Módulo de Serviços
├── ui/                # Camada de Frontend
│   ├── scripts/       # Lógica TypeScript do frontend (Transpilada on-the-fly)
│   │   ├── consumers/ # Clientes HTTP para comunicação com API
│   │   └── pages/     # Scripts específicos de páginas
│   └── static/        # Assets estáticos (HTML, CSS, Imagens)
├── app.ts             # Configuração da aplicação Express e Middlewares
└── main.ts            # Ponto de entrada (Entrypoint) do servidor
```

## 4. Arquitetura do Backend

O backend segue uma arquitetura em camadas limpa, organizada dentro de módulos de domínio.

### Fluxo de Requisição
1. **Router (`routers/`)**: Recebe a requisição HTTP e a direciona para o Controller apropriado.
2. **Controller (`controllers/`)**: Extrai dados da requisição (body, params), valida tipos básicos e invoca o Service. Responsável por formatar a resposta HTTP.
3. **Service (`services/`)**: Contém a regra de negócios pura. Não deve conhecer detalhes do HTTP (req/res). Lança erros customizados (`AppError`) se as regras forem violadas. interage com o Banco de Dados.
4. **Database**: Acesso direto via driver `sqlite` ou Repository Pattern (se implementado).

### Controle de Acesso (RBAC)
O sistema implementa controle de acesso baseado em papéis (RBAC) simples:
- **Cliente (User):** Acesso padrão para cadastro de pets, agendamento e visualização de histórico próprio.
- **Administrador (Admin):** Permissões elevadas para gestão de catálogo de serviços, visualização de todos os agendamentos e registro de execução.
A validação de permissões é feita via middleware ou verificação no Service.

### Tratamento de Erros
O projeto utiliza uma estratégia centralizada de tratamento de erros.
- Erros de negócio devem lançar instâncias de `AppError` com código HTTP e mensagem apropriada.
- Um middleware global (`HandleErrorMiddleware`) intercepta todas as exceções, formata a resposta JSON padronizada e previne crash do servidor.

## 5. Arquitetura do Frontend

O frontend adota uma abordagem "No-Build" para desenvolvimento, alavancando os recursos modernos do ES Modules.

- **Serving**: O Express serve arquivos estáticos (HTML/CSS) da pasta `ui/static`.
- **Transpilação Dinâmica**: O middleware `TranspileScriptMiddleware` intercepta requisições a arquivos `.js` na rota `/scripts/*`. Ele localiza o arquivo `.ts` correspondente em `src/ui/scripts`, o transpila em memória usando **esbuild** e serve o código JavaScript compatível com o navegador (ESM).
- **Consumo de API**: A lógica de comunicação com o backend é encapsulada em "Consumers" (`src/ui/scripts/consumers`), mantendo os scripts de página limpos.

## 6. Padrões e Convenções

### Nomenclatura
- **Arquivos:** Kebab-case (`login-user-service.ts`, `auth-router.ts`).
- **Classes:** PascalCase (`LoginUserService`, `AuthController`).
- **Variáveis/Funções:** CamelCase (`createUser`, `isValid`).
- **Sufixos Explícitos:** O nome do arquivo e da classe deve refletir sua camada (`-service`, `-controller`, `-router`).

### Código
- **Async/Await:** Utilizado preferencialmente para operações assíncronas.
- **Injeção de Dependência:** As dependências devem ser passadas preferencialmente via construtor ou argumentos de método para facilitar testes.
- **Tipagem Estrita:** O uso de `any` é desencorajado. Interfaces/Tipos devem ser definidos para DTOs (Data Transfer Objects).

### Validação
Conforme requisitos do projeto (PRD), **não são utilizadas bibliotecas de validação externas** (como Zod ou Joi).
- Toda validação de entrada é feita manualmente usando funções auxiliares ou expressões regulares (Regex).
- As validações ocorrem na camada de **Controller** (para formato de dados) e **Service** (para regras de negócio).

## 7. Estratégia de Testes

A qualidade é garantida principalmente através de testes unitários focados nas regras de negócio (Services).

- **Ferramenta:** Vitest.
- **Localização:** Os testes ficam co-localizados dentro de cada módulo na pasta `tests/` ou próximos ao arquivo testado (arquivos `*.test.ts` ou `*.spec.ts`).
- **Mocking:** Utiliza-se `vitest-mock-extended` para mocar dependências externas (como banco de dados) e isolar a unidade sendo testada.
- **Escopo:**
    - **Testes Unitários:** Foco nos Services. Obrigatório para toda lógica de negócio complexa.
    - **Testes de Integração:** (Opcional/Futuro) Para rotas e comunicação real com banco de dados.

---
*Documentação gerada automaticamente por Antigravity (AI Architect Agent) em 27/01/2026.*
