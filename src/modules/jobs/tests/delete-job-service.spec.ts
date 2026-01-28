import { describe, it, expect, vi, beforeEach } from "vitest";
import { Database } from "sqlite";
import { DeleteJobService } from "../services/delete-job-service";
import { NotFoundError } from "../../../errors/not-found-error";

const dbMock = {
  get: vi.fn(),
  run: vi.fn(),
} as unknown as Database;

describe("DeleteJobService", () => {
  let deleteJobService: DeleteJobService;

  beforeEach(() => {
    deleteJobService = new DeleteJobService(dbMock);
    vi.clearAllMocks();
  });

  it("deve excluir um serviço existente", async () => {
    vi.spyOn(dbMock, "get").mockResolvedValueOnce({ id: "job-123" });

    await deleteJobService.execute("job-123");

    expect(dbMock.run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM jobs"),
      ["job-123"],
    );
  });

  it("deve lançar erro se o serviço não existir", async () => {
    vi.spyOn(dbMock, "get").mockResolvedValueOnce(undefined);

    await expect(
      deleteJobService.execute("non-existent"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
