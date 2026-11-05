
import { assert, describe, it } from "vitest";
import { buildReport, examPlan } from "./evaluate.ts";
import type { PlanScope, Profile } from "./types.ts";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    age: "18-plus",
    adolescentMother: false,
    formalBachillerato: false,
    schooling: "primary",
    literacy: "solid",
    numeracy: "solid",
    foreignStudies: false,
    studyStyle: "unsure",
    enrolled: "not-yet",
    firstEnrollment: true,
    knowsWindow: false,
    hasId: false,
    certificates: "missing",
    recognition: false,
    hours: "3-5",
    materials: false,
    confidence: "mid",
    ...overrides,
  };
}

const readyScope: PlanScope = {
  subjects: ["espanol"],
  levels: [],
  includeScience: false,
  science: null,
};

describe("program fit", () => {
  it("opens primaria for a literate 15-year-old without sixth grade", () => {
    const report = buildReport({
      profile: profile({ age: "14-15", schooling: "no-primary" }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(report.fits["i-ii"].fit, "eligible");
    assert.equal(report.fits.iii.fit, "blocked");
    assert.ok(report.fits.iii.reasons.includes("needs-primary"));
    assert.equal(report.fits.edad.fit, "blocked");
    assert.equal(report.fits.bxm.fit, "blocked");
    assert.equal(report.recommended, "i-ii");
    assert.equal(report.focus, "i-ii");
  });

  it("blocks primaria under 14 even with solid skills", () => {
    const report = buildReport({
      profile: profile({ age: "under-14", schooling: "no-primary" }),
      chosen: "i-ii",
      scope: readyScope,
    });
    assert.equal(report.fits["i-ii"].fit, "blocked");
    assert.ok(report.fits["i-ii"].reasons.includes("age-min-14"));
    assert.equal(report.recommended, null);
    assert.ok(report.actions.includes("wait-age"));
  });

  it("blocks primaria when literacy or numeracy is missing", () => {
    const report = buildReport({
      profile: profile({
        age: "18-plus",
        schooling: "no-primary",
        literacy: "not-yet",
        numeracy: "basic",
      }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(report.fits["i-ii"].fit, "blocked");
    assert.ok(report.fits["i-ii"].reasons.includes("literacy-gap"));
    assert.ok(!report.fits["i-ii"].reasons.includes("numeracy-gap"));
    assert.ok(report.actions.includes("build-literacy"));
  });

  it("sends a primary graduate to III Ciclo", () => {
    const report = buildReport({
      profile: profile({ age: "18-plus", schooling: "primary" }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(report.fits["i-ii"].fit, "surpassed");
    assert.equal(report.fits.iii.fit, "eligible");
    assert.equal(report.fits.edad.fit, "blocked");
    assert.equal(report.recommended, "iii");
    assert.equal(report.plan?.totalTests, 18);
    assert.equal(report.plan?.pass, 65);
  });

  it("marks partial III Ciclo as conditional", () => {
    const report = buildReport({
      profile: profile({ schooling: "partial-iii", recognition: true, foreignStudies: true }),
      chosen: "iii",
      scope: {
        subjects: ["matematica", "espanol"],
        levels: ["7", "8"],
        includeScience: false,
        science: null,
      },
    });
    assert.equal(report.fits.iii.fit, "conditional");
    assert.ok(report.fits.iii.reasons.includes("partial-iii"));
    assert.equal(report.plan?.totalTests, 4);
    assert.ok(report.actions.includes("recognition"));
    assert.ok(report.actions.includes("foreign-dgec"));
  });

  it("keeps EDAD closed until 16 and opens BXM early only for a formal-bachillerato student", () => {
    const tooYoung = buildReport({
      profile: profile({ age: "14-15", schooling: "ninth" }),
      chosen: "edad",
      scope: null,
    });
    assert.equal(tooYoung.fits.edad.fit, "blocked");
    assert.ok(tooYoung.fits.edad.reasons.includes("age-min-16"));
    assert.equal(tooYoung.recommended, null);
    assert.ok(tooYoung.actions.includes("wait-age"));

    const fromSchool = buildReport({
      profile: profile({
        age: "16-17",
        schooling: "partial-div",
        formalBachillerato: true,
        studyStyle: "self",
      }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(fromSchool.fits.bxm.fit, "conditional");
    assert.ok(fromSchool.fits.bxm.reasons.includes("bxm-formal"));
    assert.equal(fromSchool.fits.edad.fit, "conditional");
    assert.equal(fromSchool.recommended, "bxm");
  });

  it("opens EDAD and not BXM for a 17-year-old with ninth grade", () => {
    const report = buildReport({
      profile: profile({ age: "16-17", schooling: "ninth", adolescentMother: false, studyStyle: "supported" }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(report.fits.edad.fit, "eligible");
    assert.ok(report.fits.edad.reasons.includes("age-ok"));
    assert.equal(report.fits.bxm.fit, "blocked");
    assert.ok(report.fits.bxm.reasons.includes("age-min-18"));
    assert.equal(report.recommended, "edad");
    assert.equal(report.fits.iii.fit, "surpassed");
  });

  it("lets an adolescent parent into BXM only as a confirmed exception", () => {
    const selfDirected = buildReport({
      profile: profile({
        age: "16-17",
        schooling: "ninth",
        adolescentMother: true,
        studyStyle: "self",
      }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(selfDirected.fits.bxm.fit, "conditional");
    assert.ok(selfDirected.fits.bxm.reasons.includes("bxm-mother"));
    assert.equal(selfDirected.recommended, "bxm");
    assert.ok(selfDirected.actions.includes("confirm-exception"));

    const supported = buildReport({
      profile: profile({
        age: "16-17",
        schooling: "ninth",
        adolescentMother: true,
        studyStyle: "supported",
      }),
      chosen: "bxm",
      scope: {
        subjects: ["espanol"],
        levels: [],
        includeScience: true,
        science: "quimica",
      },
    });
    assert.equal(supported.recommended, "edad");
    assert.equal(supported.focus, "bxm");
    assert.equal(supported.chosenFit, "conditional");
    assert.equal(supported.plan?.totalTests, 2);
  });

  it("prefers EDAD when both bachillerato routes are open and the style is undecided", () => {
    const report = buildReport({
      profile: profile({ age: "18-plus", schooling: "partial-div", studyStyle: "unsure" }),
      chosen: "unsure",
      scope: null,
    });
    assert.equal(report.fits.edad.fit, "conditional");
    assert.equal(report.fits.bxm.fit, "conditional");
    assert.equal(report.recommended, "edad");
    assert.equal(report.plan?.sciencePending, true);
    assert.equal(report.plan?.totalTests, 12);
  });

  it("finds nothing left to sit once the bachillerato is done", () => {
    const report = buildReport({
      profile: profile({ schooling: "bachiller" }),
      chosen: "bxm",
      scope: readyScope,
    });
    assert.equal(report.fits["i-ii"].fit, "surpassed");
    assert.equal(report.fits.iii.fit, "surpassed");
    assert.equal(report.fits.edad.fit, "surpassed");
    assert.equal(report.fits.bxm.fit, "surpassed");
    assert.equal(report.recommended, null);
    assert.equal(report.focus, null);
  });
});

describe("enrollment checklist", () => {
  it("names the enrollment gap when the person is not signed up", () => {
    const report = buildReport({
      profile: profile({ schooling: "primary", enrolled: "unsure" }),
      chosen: "iii",
      scope: {
        subjects: ["ciencias"],
        levels: ["9"],
        includeScience: false,
        science: null,
      },
    });
    assert.ok(report.actions.includes("enroll"));
    assert.ok(!report.actions.includes("track-window"));
    assert.equal(report.plan?.totalTests, 1);
    assert.equal(report.plan?.fee, 8000);
  });
});

describe("exam plan", () => {
  it("counts two EDAD parts and one chosen science", () => {
    const plan = examPlan(
      "edad",
      {
        subjects: ["espanol", "matematica"],
        levels: ["10", "11"],
        includeScience: true,
        science: "fisica",
      },
      false,
    );
    assert.equal(plan.totalTests, 6);
    assert.equal(plan.pass, 70);
    assert.equal(plan.fee, 48000);
    assert.equal(plan.sciencePending, false);
    assert.equal(plan.items[0]?.label, "Español");
    assert.equal(plan.items[2]?.label, "Ciencias · Física");
  });
});




describe("existing enrollment paperwork", () => {
  it("does not ask for entry certification again with an accepted expediente", () => {
    const report = buildReport({ profile: profile({ schooling: "ninth", firstEnrollment: false, recordOnFile: true }), chosen: "bxm", scope: readyScope });
    assert.ok(!report.actions.includes("certificates"));
    assert.ok(!report.actions.includes("regional-signature"));
    assert.ok(!report.actions.includes("photo-new"));
    assert.ok(report.actions.includes("grade-record"));
  });
  it("does not direct an in-process candidate to pay and enroll again", () => {
    const report = buildReport({ profile: profile({ enrolled: "in-process" }), chosen: "iii", scope: readyScope });
    assert.ok(!report.actions.includes("yo-aplico"));
    assert.ok(!report.actions.includes("payment"));
    assert.ok(report.actions.includes("track-window"));
  });
});
