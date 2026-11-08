import { describe, expect, it } from "vitest";
import { evaluateEquiparacion, type EquiparacionEvaluationInput } from "./equiparacion";

describe("evaluateEquiparacion", () => {
  it("evaluates Formal to EDAD pathway and marks recognized vs remaining", () => {
    const input: EquiparacionEvaluationInput = {
      pathway: "formal_to_abierta",
      targetProgram: "edad",
      originSystem: "colegio_academico",
      chosenLanguage: "ingles",
      chosenScience: "biologia",
      recognizedRecords: [
        { subject: "matematica", level: "10", recognized: true },
        { subject: "espanol", level: "10", recognized: true },
        { subject: "espanol", level: "11", recognized: true },
      ],
    };

    const result = evaluateEquiparacion(input);

    expect(result.pathway).toBe("formal_to_abierta");
    expect(result.targetProgram).toBe("edad");
    expect(result.recognizedItems.length).toBe(3);
    // EDAD has 6 subjects (5 base + 1 science) * 2 levels = 12 total items
    // With 3 recognized, remaining should be 9
    expect(result.remainingItems.length).toBe(9);
    expect(result.totalRemainingTests).toBe(9);
    expect(result.estimatedFee).toBe(9 * 8000);
    expect(result.guidelines.requiredDocuments.length).toBeGreaterThanOrEqual(3);
    expect(result.guidelines.requiredDocuments.some((d) => d.code === "DOC-FA-01")).toBe(true);
  });

  it("warns about EDAD Parte 2 gate when Parte 2 is approved without Parte 1", () => {
    const input: EquiparacionEvaluationInput = {
      pathway: "formal_to_abierta",
      targetProgram: "edad",
      originSystem: "colegio_academico",
      chosenLanguage: "ingles",
      chosenScience: "biologia",
      recognizedRecords: [
        { subject: "matematica", level: "11", recognized: true }, // 11 without 10
      ],
    };

    const result = evaluateEquiparacion(input);
    expect(result.warnings.some((w) => w.includes("Parte 2 (11°) sin haber aprobado"))).toBe(true);
  });

  it("evaluates Abierta to Abierta transfer (EDAD to BXM)", () => {
    const input: EquiparacionEvaluationInput = {
      pathway: "abierta_to_abierta",
      targetProgram: "bxm",
      originSystem: "edad",
      chosenLanguage: "ingles",
      chosenScience: "quimica",
      recognizedRecords: [
        { subject: "matematica", recognized: true },
        { subject: "estudios-sociales", recognized: true },
        { subject: "ciencias", recognized: true, science: "quimica" },
      ],
    };

    const result = evaluateEquiparacion(input);
    expect(result.pathway).toBe("abierta_to_abierta");
    expect(result.targetProgram).toBe("bxm");
    // BXM has 6 subjects (5 base + 1 science). 3 recognized, 3 remaining.
    expect(result.recognizedItems.length).toBe(3);
    expect(result.remainingItems.length).toBe(3);
    expect(result.totalRemainingTests).toBe(3);
    expect(result.estimatedFee).toBe(3 * 8000);
    expect(result.guidelines.channel).toBe("dgec_consultas");
    expect(result.guidelines.portalUrl).toContain("dgec.mep.go.cr/consultas");
  });

  it("evaluates Foreign homologation pathway and warns if resolution is missing", () => {
    const input: EquiparacionEvaluationInput = {
      pathway: "foreign_homologation",
      targetProgram: "bxm",
      originSystem: "extranjero",
      chosenLanguage: "ingles",
      chosenScience: "fisica",
      hasForeignResolution: false,
      recognizedRecords: [],
    };

    const result = evaluateEquiparacion(input);
    expect(result.warnings.some((w) => w.includes("estudios cursados en el exterior requieren de previo acuerdo"))).toBe(true);
    expect(result.guidelines.channel).toBe("foreign_resolution");
    expect(result.guidelines.emailTarget).toBe("dgec.reconocimientos@mep.go.cr");
    expect(result.guidelines.leadTimeWeeks).toBe(6);
  });

  it("evaluates III Ciclo recognition for 7° and 8° from formal system", () => {
    const input: EquiparacionEvaluationInput = {
      pathway: "formal_to_abierta",
      targetProgram: "iii",
      originSystem: "colegio_academico",
      recognizedRecords: [
        { subject: "matematica", level: "7", recognized: true },
        { subject: "ciencias", level: "7", recognized: true },
        { subject: "espanol", level: "7", recognized: true },
        { subject: "estudios-sociales", level: "7", recognized: true },
        { subject: "formacion-ciudadana", level: "7", recognized: true },
        { subject: "idioma", level: "7", recognized: true },
      ],
    };

    const result = evaluateEquiparacion(input);
    expect(result.recognizedItems.length).toBe(6);
    // III Ciclo has 6 subjects * 3 levels = 18 total items
    // With 6 recognized (all of 7°), 12 remain (all of 8° and 9°)
    expect(result.remainingItems.length).toBe(12);
    expect(result.totalRemainingTests).toBe(12);
    expect(result.estimatedFee).toBe(12 * 8000);
  });
});


describe("approval safety and selected scope", () => {
  it("does not count an isolated EDAD part as a complete BXM subject", () => {
    const result = evaluateEquiparacion({ pathway: "abierta_to_abierta", targetProgram: "bxm", originSystem: "edad", recognizedRecords: [{ subject: "matematica", level: "10", recognized: true }] });
    expect(result.recognizedItems).toHaveLength(0);
    expect(result.totalRemainingTests).toBe(6);
  });
  it("recognizes both EDAD parts together and limits the estimate to selected subjects", () => {
    const result = evaluateEquiparacion({ pathway: "abierta_to_abierta", targetProgram: "bxm", originSystem: "edad", recognizedRecords: [{ subject: "matematica", level: "10", recognized: true }, { subject: "matematica", level: "11", recognized: true }], scope: { subjects: ["matematica"], levels: [], includeScience: false } });
    expect(result.recognizedItems).toHaveLength(1);
    expect(result.totalRemainingTests).toBe(0);
    expect(result.estimatedFee).toBe(0);
  });
  it("does not deduct unresolved foreign credits or credits for a different science", () => {
    const foreign = evaluateEquiparacion({ pathway: "foreign_homologation", targetProgram: "bxm", originSystem: "extranjero", hasForeignResolution: false, recognizedRecords: [{ subject: "matematica", recognized: true }] });
    expect(foreign.recognizedItems).toHaveLength(0);
    const science = evaluateEquiparacion({ pathway: "same_program", targetProgram: "bxm", originSystem: "bxm", chosenScience: "fisica", recognizedRecords: [{ subject: "ciencias", science: "biologia", recognized: true }] });
    expect(science.recognizedItems).toHaveLength(0);
  });
  it("retains primary program approvals without requiring new paperwork", () => {
    const result = evaluateEquiparacion({ pathway: "same_program", targetProgram: "i-ii", originSystem: "bxm", recognizedRecords: [{ subject: "matematica", recognized: true }], scope: { subjects: ["matematica", "espanol"], levels: [], includeScience: false } });
    expect(result.totalRemainingTests).toBe(1);
    expect(result.guidelines.requiredDocuments).toEqual([]);
  });
});


it("transfers a complete BXM subject to both EDAD parts", () => {
  const result = evaluateEquiparacion({ pathway: "abierta_to_abierta", targetProgram: "edad", originSystem: "bxm", recognizedRecords: [{ subject: "matematica", recognized: true }], scope: { subjects: ["matematica"], levels: ["10", "11"], includeScience: false } });
  expect(result.recognizedItems.map(item => item.level)).toEqual(["10", "11"]);
  expect(result.totalRemainingTests).toBe(0);
});
