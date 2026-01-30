import { db } from "@/database/db";

export interface PetWithOwner {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  size: "P" | "M" | "G";
  userId: string;
  ownerName: string;
  ownerEmail: string;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface FilterOptions {
  search?: string | undefined;
  userId?: string | undefined;
}

// Translation map for bilingual search (English <-> Portuguese)
const translationGroups: string[][] = [
  ["dog", "cão", "cao", "cachorro", "canino"],
  ["cat", "gato", "felino"],
  ["bird", "pássaro", "passaro", "ave"],
  ["fish", "peixe"],
  ["rabbit", "coelho"],
  ["hamster", "hamster"],
  ["turtle", "tartaruga"],
  ["snake", "cobra", "serpente"],
  ["small", "pequeno", "p"],
  ["medium", "médio", "medio", "m"],
  ["large", "grande", "g"],
];

function expandSearchTerms(search: string): string[] {
  const searchLower = search.toLowerCase().trim();
  const terms: Set<string> = new Set([searchLower]);

  // Find matching translation groups and add all equivalents
  for (const group of translationGroups) {
    if (
      group.some(
        (term) => searchLower.includes(term) || term.includes(searchLower),
      )
    ) {
      group.forEach((term) => terms.add(term));
    }
  }

  return Array.from(terms);
}

export class AdminPetsRepository {
  async getAllPetsWithOwner(filters?: FilterOptions): Promise<PetWithOwner[]> {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.species,
        p.breed,
        p.age,
        p.weight,
        p.size,
        p.userId,
        u.name as ownerName,
        u.email as ownerEmail
      FROM pets p
      JOIN users u ON p.userId = u.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (filters?.search) {
      // Expand search terms to include translations
      const searchTerms = expandSearchTerms(filters.search);

      // Build OR conditions for each search term
      const conditions: string[] = [];
      for (const term of searchTerms) {
        conditions.push(
          `(p.name LIKE ? OR p.species LIKE ? OR p.breed LIKE ?)`,
        );
        const searchPattern = `%${term}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ` AND (${conditions.join(" OR ")})`;
    }

    if (filters?.userId) {
      query += ` AND p.userId = ?`;
      params.push(filters.userId);
    }

    query += ` ORDER BY p.name ASC`;

    const pets = await db.all<PetWithOwner[]>(query, params);
    return pets;
  }

  async getAllUsers(): Promise<UserOption[]> {
    const users = await db.all<UserOption[]>(`
      SELECT id, name, email
      FROM users
      WHERE role = 'customer'
      ORDER BY name ASC
    `);
    return users;
  }
}
