import { petRepository } from "../repositories/petRepository.js";
import { IPetCreate, IPetUpdate } from "../types/Pets.js";
import { validatePetName, validatePetType, validatePetAge } from "../utils/validators.js";

export const petService = {
    /**
     * Cria um novo pet após validar os dados
     * @param petData - Dados do pet a ser criado
     * @returns ID do pet criado
     * @throws Error se a validação falhar
     */
    create: async (petData: IPetCreate): Promise<number> => {
        const { name, species, breed, age, userId } = petData;

        // Validação dos dados
        if (!validatePetName(name)) {
            throw new Error("Nome do pet inválido (mínimo 2 letras).");
        }
        if (!validatePetType(species) || !validatePetType(breed)) {
            throw new Error("Espécie ou Raça inválida.");
        }
        if (!validatePetAge(age)) {
            throw new Error("Idade deve estar entre 0 e 30 anos.");
        }

        // Chama o repository para salvar no banco
        const petId = await petRepository.create({ name, species, breed, age, userId });
        return petId;
    },

    /**
     * Lista todos os pets de um usuário específico
     * @param userId - ID do usuário
     * @returns Array de pets do usuário
     */
    listByUser: async (userId: number) => {
        if (isNaN(userId) || userId <= 0) {
            throw new Error("ID de usuário inválido.");
        }

        const pets = await petRepository.findByUserId(userId);
        return pets;
    },

    /**
     * Atualiza informações de um pet
     * @param petData - Dados do pet a serem atualizados
     * @throws Error se a validação falhar
     */
    update: async (petData: IPetUpdate): Promise<void> => {
        const { id, name, species, breed, age } = petData;

        // Validar ID
        if (!id || id <= 0) {
            throw new Error("ID do pet inválido.");
        }

        // Validar campos fornecidos
        if (name !== undefined && !validatePetName(name)) {
            throw new Error("Nome do pet inválido (mínimo 2 letras).");
        }
        if (species !== undefined && !validatePetType(species)) {
            throw new Error("Espécie inválida.");
        }
        if (breed !== undefined && !validatePetType(breed)) {
            throw new Error("Raça inválida.");
        }
        if (age !== undefined && !validatePetAge(age)) {
            throw new Error("Idade deve estar entre 0 e 30 anos.");
        }

        await petRepository.update(petData);
    },

    /**
     * Deleta um pet pelo ID
     * @param petId - ID do pet a ser deletado
     * @throws Error se o ID for inválido
     */
    deletePet: async (petId: number): Promise<void> => {
        if (isNaN(petId) || petId <= 0) {
            throw new Error("ID de pet inválido.");
        }

        await petRepository.deletePet(petId);
    }
};

export const deletePet = async (petId: number) => {
    if (isNaN(petId) || petId <= 0) {
        throw new Error("ID de pet inválido.");
    }

    const pet = await petRepository.delete(petId);
    return pet;
}