import { cn } from "@/lib/utils";

describe("cn — fusion de classes Tailwind", () => {
  it("concatène plusieurs classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("déduplique les classes Tailwind conflictuelles (dernière gagne)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignore les valeurs conditionnelles falsy", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("gère un tableau de classes", () => {
    expect(cn(["flex", "items-center"])).toBe("flex items-center");
  });
});
