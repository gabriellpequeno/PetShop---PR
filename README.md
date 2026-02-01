# 🐱Little Pets🐶
## Descrição do Desafio

O projeto **PetShop** é uma aplicação web full-stack desenvolvida com foco em simplicidade, performance e modularidade. A arquitetura segue uma abordagem de **Monólito Modular**, onde o backend e o frontend coexistem no mesmo repositório e compartilham a infraestrutura de execução, mas mantêm uma separação clara de responsabilidades por domínios de negócio.

A aplicação utiliza **Node.js** com **Express** para o servidor backend e **SQLite** como banco de dados. O frontend é construído com **HTML/CSS** e **TypeScript** vanilla, utilizando um middleware customizado para transpilação on-the-fly de assets, eliminando a necessidade de um passo de build complexo separado para o frontend durante o desenvolvimento.

## Backlog do Produto
| Valor | User Story |
| -- | -- |
| Alto | Como usuario quero agendar serviços para meu pet de maneira ágil e rápida. |
| Alto | Como usuário, quero cadastrar e editar os perfis dos meus pets e atualizar meus dados cadastrais. |
| Alto | Como usuário, quero acessar e editar meu perfil e atualizar meus dados cadastrais. |
| Medio | Como administrador, quero criar e gerenciar os serviços do meu Petshop: editar, adicionar e remover serviços. |
| Medio | Como administrador, preciso gerenciar clientes e seus pets, podendo controlar a quantidade e editar perfis. |
| Medio | Como administrador, preciso controlar a agenda do Petshop (dias/horários), reagendar e cancelar agendamentos conforme necessário. |

## Tecnologias
O sistema foi desenvolvido usando as tecnologias, solicitadas pelo escopo do desafio:

- **Transpiler/Bundler:** esbuild (Utilizado para transpilação em tempo real de scripts frontend)
- **Executor:** tsx (Para execução de arquivos TypeScript no backend)
- **Testes:** Vitest (Framework de testes unitários e integração) + vitest-mock-extended
- **Linter/Formatter:** Biome (Substituto moderno para ESLint/Prettier)

##  Estrutura do Repositório
Uma arquitetura de monolito modular, servindo o front atravez do back:

-   **`src/modules/`**: A api desenvolvida em TypeScript, que gerencia usuarios, pets, serviços e agendamentos. 
-   **`src/ui/`**: Interface web desenvolvida em Html, Css e Ts que monta as paginas para os usuarios.

## Como executar o projeto

1.  Na raiz, execute  `npm install`  para instalar dependências das workspaces
2.  `npm start`  para rodar  `backend`  e  `frontend`  em paralelo (usa  `concurrently`)

## Documentação do projeto

 - [ Padrao de Commit](https://github.com/gabriellpequeno/PetShop---PR/blob/main/documentation/commit-pattern.md)
 - [PRD](https://github.com/gabriellpequeno/PetShop---PR/blob/main/documentation/prd.md)
 - [Arquitetura](https://github.com/gabriellpequeno/PetShop---PR/blob/main/documentation/architecture.md)

## Equipe

| Nome | Github | Linkedin |
|--|--|--|
| Gabriel Pequeno | [Github](https://github.com/gabriellpequeno) | [Linkedin](https://www.linkedin.com/in/gabriel-pequeno-saraiva-tavares-b99267144/) |
| Helen Tesch | [Github](https://github.com/HelenTesch) | [Linkedin](https://www.linkedin.com/in/helen-tesch-79b61b177/) |
| Bianca Gonzaga | [Github](https://github.com/biagonzag-hue) | [Linkedin](https://www.linkedin.com/in/bianca-gonzaga-192109280/) |
| Felipe Mello | [Github](https://github.com/Felipemello29) | [Linkedin](https://www.linkedin.com/in/felipe-mello-53541421a/) |
| Thiago Martins | [Github](https://github.com/0thigs) | Linkedin |
| Edinaldo Junio | [Github](https://github.com/EdinaldoJunio) | [Linkedin](https://www.linkedin.com/in/edinaldo-junio/) |
