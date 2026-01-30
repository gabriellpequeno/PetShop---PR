# Product Requirements Document (PRD) — Little's Petshop

## 1. Introdução e Objetivo

O **Little's Petshop** é um sistema gerenciador de informações para um PetShop. O objetivo é fornecer uma plataforma onde clientes podem cadastrar seus pets e agendar serviços (banho, tosa, etc.), enquanto a administração gerencia o catálogo de serviços e o fluxo de atendimentos.
O projeto consiste em uma **API REST** (Back-end) e uma interface web simples (Front-end).

## 2. Escopo do Projeto

O sistema deve gerenciar o fluxo completo de agendamento de serviços para animais de estimação, desde o cadastro do dono e do pet até a conclusão do serviço pelo atendente.

### Fora do Escopo

* Pagamentos online (gateway de pagamento real).
* Integração com calendários externos (Google Calendar).
* Frameworks de Front-end (React, Vue, Angular).


* Bibliotecas de validação de dados (Joi, Zod, Yup).

---

## 3. Atores e Permissões

O sistema possui dois níveis de acesso baseados em roles (funções).

| Ator | Descrição | Permissões Chave |
| --- | --- | --- |
| **Cliente (Usuário Comum)** | Dono do animal que deseja contratar serviços. | • Cadastrar-se e fazer login.

<br>

<br>• Cadastrar seus Pets.<br>

<br>• Visualizar serviços disponíveis.<br>

<br>• Agendar e cancelar serviços.<br>

<br>• Visualizar histórico de agendamentos. 

 |
| **Administrador (Atendente)** | Gerente ou funcionário do PetShop. | • Todas as permissões do Cliente.

<br>

<br>• Criar, editar e excluir Serviços.<br>

<br>• Visualizar todos os agendamentos.<br>

<br>• Registrar horários de início/término de serviços. 

 |

---

## 4. Requisitos Funcionais (Por Módulo)

### 4.1. Módulo de Autenticação (Auth)

* 
**RF01 - Cadastro:** O sistema deve permitir o cadastro de usuários com Nome, E-mail e Senha.


* 
**RF02 - Login:** O sistema deve autenticar o usuário e retornar um **Token JWT**.


* 
**RF03 - Sessão:** O token JWT deve ter tempo de expiração definido e ser exigido em rotas protegidas.



### 4.2. Módulo de Usuários (Users)

* **RF04 - Perfil:** O usuário deve poder visualizar seus próprios dados.

### 4.3. Módulo de Pets (Pets)

* 
**RF05 - Cadastro de Pet:** O Cliente deve poder cadastrar seus animais (Nome, Espécie, Raça, Peso).


* **RF06 - Listagem de Pets:** O Cliente visualiza apenas seus pets; o Admin visualiza todos.

### 4.4. Módulo de Serviços (Services)

* 
**RF07 - Gestão de Serviços:** O Administrador deve cadastrar serviços contendo: Título, Descrição, Preços por porte (P/M/G), Duração Estimada e Disponibilidade semanal (dias/horários).


* 
**RF08 - Listagem:** Todos os usuários podem listar os serviços disponíveis.



### 4.5. Módulo de Agendamentos (Bookings)

* 
**RF09 - Agendar:** O Cliente seleciona um de seus Pets e um Serviço disponível para agendar.


* 
**RF10 - Cancelar:** O Cliente pode cancelar o agendamento antes da data prevista.


* 
**RF11 - Controle de Disponibilidade:** O sistema deve impedir agendamento fora dos períodos disponíveis (validados por `job_availability`) e prevenir duplicidade de agendamento por pet/serviço/horário.

* 
**RF12 - Registro de Execução:** O Administrador deve registrar a data/hora real de início e término do serviço prestado.



---

## 5. Regras de Negócio e Validações

⚠️ **Importante:** Toda validação deve ser feita manualmente (funções próprias ou Regex).

1. 
**Segurança da Senha:** A senha deve ter requisitos mínimos (ex: min 8 caracteres, 1 letra, 1 número).


2. 
**E-mail Único:** Não permitir dois cadastros com o mesmo e-mail.


3. 
**Duplicidade de Agendamento:** Um mesmo Pet não pode ser agendado para o mesmo serviço na mesma data/horário.


4. **Imutabilidade Histórica:** Serviços já concluídos não podem ser cancelados ou editados pelo cliente.

---

## 6. Requisitos Técnicos (Não Funcionais)

* 
**Linguagem:** Node.js (Runtime) e JavaScript/TypeScript.


* **Framework Web:** Express.js.
* 
**Banco de Dados:** SQLite (Armazenamento relacional local).


* 
**Autenticação:** JSON Web Token (JWT).


* 
**Testes:** Testes unitários cobrindo regras de negócio críticas usando **Vitest**.


* 
**Configuração:** Uso de arquivo `.env` para segredos (Porta, Segredo JWT, Caminho DB).


* **Front-end:** HTML/CSS e JS Vanilla (DOM Manipulation pura). Proibido React/Vue/Angular.



---

## 7. Modelo de Dados Atual (SQLite)

O schema atual usado no projeto corresponde às tabelas criadas em `src/database/tables.ts`:

* **users:** `id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL, phone TEXT, location TEXT, birth_date TEXT`
* **pets:** `id TEXT PRIMARY KEY, userId TEXT NOT NULL, name TEXT NOT NULL, species TEXT NOT NULL, breed TEXT NOT NULL, age INTEGER NOT NULL, weight REAL NOT NULL, size TEXT NOT NULL DEFAULT 'M'`  (FK: `userId` → `users.id`)
* **jobs (serviços):** `id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, priceP REAL NOT NULL, priceM REAL NOT NULL, priceG REAL NOT NULL, duration INTEGER NOT NULL` — preços por porte (P/M/G) e duração em minutos
* **job_availability:** `id TEXT PRIMARY KEY, jobId TEXT NOT NULL, dayOfWeek INTEGER NOT NULL, startTime TEXT NOT NULL, endTime TEXT NOT NULL` — disponibilidade semanal por serviço
* **bookings:** `id TEXT PRIMARY KEY, userId TEXT NOT NULL, petId TEXT NOT NULL, jobId TEXT NOT NULL, bookingDate TEXT NOT NULL, bookingTime TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'agendado', price REAL NOT NULL DEFAULT 0, realStartTime TEXT, realEndTime TEXT, createdAt TEXT NOT NULL`

---

## 8. Definição de Rotas da API 

### Auth

* `POST /api/auth/register` - Cria conta
* `POST /api/auth/login` - Gera Token (retorna token e seta cookie `token`)
* `POST /api/auth/logout` - Logout e limpeza de cookie

### Jobs / Services (Protegido: Admin escreve, Todos leem)

* `GET /api/jobs` - Lista todos os serviços
* `GET /api/jobs/available` - Lista serviços disponíveis (por usuário/rota que requer autenticação)
* `POST /api/jobs` - Cria serviço (Admin)
* `PUT /api/jobs/:id` - Edita serviço (Admin)
* `DELETE /api/jobs/:id` - Remove serviço (Admin)

### Pets (Protegido: Dono gerencia os seus)

* `GET /api/pets` - Lista meus pets
* `POST /api/pets` - Cadastra novo pet
* `PUT /api/pets/:id` - Edita pet (Dono/Admin)
* `DELETE /api/pets/:id` - Remove pet (Dono/Admin)

### Bookings (Protegido)

* `POST /api/bookings` - Agenda serviço (valida disponibilidade e duplicidade)
* `GET /api/bookings` - Lista agendamentos (Admin vê todos; usuário vê os seus)
* `GET /api/bookings/occupied-slots` - Retorna slots ocupados para uma data
* `PATCH /api/bookings/:id/cancel` - Cancela (User/Admin)
* `PATCH /api/bookings/:id/complete` - Registra horários reais (Admin)

---

## 9. Critérios de Aceite para Entrega

1. Repositório no GitHub com histórico de commits de todos os membros.


2. Relatório de testes unitários na documentação.


3. Validações manuais funcionando (sem erros de servidor ao enviar dados inválidos).


4. Front-end consumindo a API e permitindo o fluxo completo (Login -> Agendamento).