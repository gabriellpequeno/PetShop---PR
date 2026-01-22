# Project Context — PetShop

## 1. Objetivo do projeto
Desenvolver uma API REST em Node.js para gerenciar um sistema de PetShop. O sistema deve permitir cadastro de usuários, gerenciamento de serviços (banho, tosa, vacinação), inscrição de pets em atividades e um frontend simples (JS/TS puro) para consumir a API.

## 2. Tecnologias & requisitos técnicos
- **Back-end:** Node.js + Express
- **Banco de dados:** SQLite
- **Autenticação:** JWT (expiração configurável)
- **Validação:** Implementada manualmente (sem Zod/Joi)
- **Testes:** Unitários com Mocha/Chai (ou similar)
- **Config:** Variáveis em `.env`
- **Front-end:** JS/TS puro, funcional e minimamente estilizado

## 3. Perfis de usuário & permissões
| Perfil | Permissões principais |
|---|---|
| Usuário comum (Dono do pet) | Criar conta, login, ver serviços, agendar/cancelar inscrição do pet, ver inscrições do próprio pet |
| Administrador (Atendente) | Tudo do usuário comum + gerenciar catálogo (criar/editar/excluir serviços), ver lista de participantes, registrar pets e horários reais de atendimento |

## 4. Regras de negócio principais
- **Cadastro de serviço:** título, descrição, data/hora, valor, limite de participantes
- **Disponibilidade:** só inscrever pets enquanto houver vagas
- **Limite:** um pet não pode ser inscrito duas vezes no mesmo serviço/horário
- **Finalização:** admin registra início/término real do atendimento

## 5. Validações obrigatórias
- Qualquer validação deve ser via regex
- Senhas devem atender política mínima de segurança (definida pela equipe)
- Campos de criação de serviço validados (todos obrigatórios e formato correto)
- Tokens JWT com expiração; renovação via login