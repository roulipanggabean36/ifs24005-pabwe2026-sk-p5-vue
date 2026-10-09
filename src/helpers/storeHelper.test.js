import { describe, it, expect, vi } from "vitest";
import { execute } from "./storeHelper";
import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

vi.mock("./toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const ok = { success: true, message: "Berhasil" };
const fail = { success: false, message: "Gagal" };

describe("storeHelper - execute", () => {
  it("berhasil tanpa opsi: mengembalikan true tanpa dialog", async () => {
    const store = { loading: false };

    const result = await execute(store, "loading", async () => ok);

    expect(result).toBe(true);
    expect(store.loading).toBe(false);
    expect(showErrorDialog).not.toHaveBeenCalled();
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("memanggil onSuccess dengan response", async () => {
    const store = { loading: false };
    const onSuccess = vi.fn();

    await execute(store, "loading", async () => ok, { onSuccess });

    expect(onSuccess).toHaveBeenCalledWith(ok);
  });

  it("menampilkan dialog sukses jika showSuccess = true", async () => {
    const store = { loading: false };

    await execute(store, "loading", async () => ok, { showSuccess: true });

    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
  });

  it("gagal: dialog error, onSuccess tidak dipanggil, mengembalikan false", async () => {
    const store = { loading: false };
    const onSuccess = vi.fn();

    const result = await execute(store, "loading", async () => fail, {
      onSuccess,
      showSuccess: true,
    });

    expect(result).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("flag loading aktif selama request dan mati setelahnya", async () => {
    const store = { loading: false };
    let resolveRequest;

    const promise = execute(
      store,
      "loading",
      () => new Promise((resolve) => (resolveRequest = resolve))
    );
    expect(store.loading).toBe(true);

    resolveRequest(ok);
    await promise;
    expect(store.loading).toBe(false);
  });

  it("mematikan flag loading walau request melempar error", async () => {
    const store = { loading: false };

    await expect(
      execute(store, "loading", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");

    expect(store.loading).toBe(false);
  });
});