# Architecture Guidelines

## 1. Routes (Roteamento)
Definição: Apenas mapeia o endpoint (URL) e o verbo HTTP para um método específico do Controller. É a porta de entrada da requisição.

**JavaScript**

```javascript
// src/routes/petRoutes.js
const { Router } = require('express');
const PetController = require('../controllers/petController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// Apenas usuários autenticados podem cadastrar pets
router.post('/pets', authMiddleware, PetController.create);

module.exports = router;
```

## 2. Controllers (Entrada e Saída)
Definição: Responsável por capturar os dados da requisição (req.body, req.params) e enviar a resposta final ao cliente (res.status().json()). Não deve conter lógica de negócio.

**JavaScript**

```javascript
// src/controllers/petController.js
const PetService = require('../services/petService');

class PetController {
  async create(req, res) {
    try {
      // O ID do dono vem do token JWT decodificado no middleware
      const ownerId = req.user.id; 
      const petData = req.body;

      const newPet = await PetService.createPet(petData, ownerId);
      return res.status(201).json(newPet);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}
module.exports = new PetController();
```

## 3. Services (Lógica e Validação Manual)
Definição: É o "cérebro" da aplicação. Aqui ficam as validações manuais  e as regras de negócio. Esta camada é a que deve ser coberta por testes unitários.

**JavaScript**

```javascript
// src/services/petService.js
const PetRepository = require('../repositories/petRepository');

class PetService {
  async createPet(data, ownerId) {
    // VALIDAÇÃO MANUAL (Sem bibliotecas externas) [cite: 39]
    if (!data.name || data.name.length < 2) {
      throw new Error("Nome do pet é obrigatório e deve ter mais de 2 caracteres");
    }
    if (!data.species) {
      throw new Error("A espécie do pet deve ser informada");
    }

    // Regra de Negócio: Chamar o repositório para salvar
    return await PetRepository.save({ ...data, owner_id: ownerId });
  }
}
module.exports = new PetService();
```

## 4. Repositories (Persistência de Dados)

Definição: Única camada que executa comandos SQL no SQLite. Isola o acesso aos dados para que o restante do sistema não precise conhecer SQL.

**JavaScript**

```javascript
// src/repositories/petRepository.js
const db = require('../utils/database'); // Conexão SQLite

class PetRepository {
  async save(pet) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO pets (name, species, breed, owner_id) VALUES (?, ?, ?, ?)`;
      db.run(query, [pet.name, pet.species, pet.breed, pet.owner_id], function(err) {
        if (err) reject(err);
        resolve({ id: this.lastID, ...pet });
      });
    });
  }
}
module.exports = new PetRepository();
```

## 5. Middlewares (Segurança e Filtros)

Definição: Funções que interceptam a requisição para verificar o token JWT ou o tipo de usuário (Admin vs Comum).

**JavaScript**

```javascript
// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido ou expirado" });
    
    // Salva os dados do usuário na requisição para as próximas camadas
    req.user = decoded; 
    next();
  });
};