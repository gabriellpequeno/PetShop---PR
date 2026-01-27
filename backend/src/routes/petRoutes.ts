import { Router } from "express";
import { petController } from "../controllers/petController.js";

const router = Router();

// Define que quando alguém enviar dados via POST para o caminho "/" 
// a função 'create' do petController será executada.
router.post("/create", petController.create);

router.get("/user/:userId", petController.listByUser);

router.put("/:petId", petController.update);

router.delete("/:petId", petController.deletePet);

export default router;