# Product Requirements Document (PRD) — Little Pets

## 1. Introdução e Objetivo

O **Little Pets** é um sistema gerenciador de informações para um PetShop. O objetivo é fornecer uma plataforma onde clientes podem cadastrar seus pets e agendar serviços (banho, tosa, etc.), enquanto a administração gerencia o catálogo de serviços e o fluxo de atendimentos.
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
**RF07 - Gestão de Serviços:** O Administrador deve cadastrar serviços contendo: Título, Descrição, Preço, Duração Estimada e Capacidade Máxima.


* 
**RF08 - Listagem:** Todos os usuários podem listar os serviços disponíveis.



### 4.5. Módulo de Agendamentos (Bookings)

* 
**RF09 - Agendar:** O Cliente seleciona um de seus Pets e um Serviço disponível para agendar.


* 
**RF10 - Cancelar:** O Cliente pode cancelar o agendamento antes da data prevista.


* 
**RF11 - Controle de Vagas:** O sistema deve impedir agendamento se a capacidade máxima do serviço for atingida.


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
**Testes:** Testes unitários cobrindo regras de negócio críticas usando Mocha e Chai (ou similar).


* 
**Configuração:** Uso de arquivo `.env` para segredos (Porta, Segredo JWT, Caminho DB).


* **Front-end:** HTML/CSS e JS Vanilla (DOM Manipulation pura). Proibido React/Vue/Angular.



---

## 7. Modelo de Dados Sugerido (Schema SQLite)

Para atender ao requisito de banco de dados relacional e ao contexto de PetShop:

* **Users:** `id, name, email, password, role ('admin'|'customer')`
* **Pets:** `id, user_id (FK), name, species, breed, age, weight`
* **Services:** `id, name, description, price, duration_min, max_capacity`
* **Bookings:** `id, user_id (FK), pet_id (FK), service_id (FK), scheduled_date, status ('agendado'|'concluido'|'cancelado'), real_start_time, real_end_time`

---

## 8. Definição de Rotas da API (Sugestão Inicial)

### Auth

* `POST /api/auth/register` - Cria conta
* `POST /api/auth/login` - Gera Token

### Services (Protegido: Admin escreve, Todos leem)

* `GET /api/services` - Lista serviços
* `POST /api/services` - Cria serviço (Admin)
* `PUT /api/services/:id` - Edita serviço (Admin)
* `DELETE /api/services/:id` - Remove serviço (Admin)

### Pets (Protegido: Dono gerencia os seus)

* `GET /api/pets` - Lista meus pets
* `POST /api/pets` - Cadastra novo pet

### Bookings (Protegido)

* `POST /api/bookings` - Agenda serviço (Valida vaga e token)
* `GET /api/bookings` - Lista meus agendamentos (Admin vê todos)
* `PATCH /api/bookings/:id/cancel` - Cancela (User/Admin)
* 
`PATCH /api/bookings/:id/complete` - Registra horários reais (Admin) 

---

## 9. Critérios de Aceite para Entrega

1. Repositório no GitHub com histórico de commits de todos os membros.


2. Relatório de testes unitários na documentação.


3. Validações manuais funcionando (sem erros de servidor ao enviar dados inválidos).


4. Front-end consumindo a API e permitindo o fluxo completo (Login -> Agendamento).