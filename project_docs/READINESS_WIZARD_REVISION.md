# Readiness wizard revision

The guide uses session-only, self-reported answers. It does not verify admission, academic records, payment, or DGEC recognition. Existing uncommitted changes outside onboarding were preserved.

## Revised flows

- Ask about previous approvals once, before the approval step. Returning to the expediente no longer inserts a missed recognition step behind the user.
- Separate approvals already recorded in the same program from external recognition. Primary-program approvals are supported without offering formal primary-school subject convalidation.
- Distinguish an accepted expediente from first enrollment. Accepted records suppress prompts to obtain entry certificates again; a new convocatoria still requires its own registration. An application in progress does not prompt a second payment or registration.
- Changing programs clears the previous program's enrollment, recognition, and checklist state. Changing recognition pathways or origins clears incompatible approvals. Changing language or science removes approvals for that choice.
- Subtract approvals from the selected subjects and levels in the final plan and fee estimate. A zero balance describes the selection, not automatic completion of the entire program.
- A complete BXM subject covers both EDAD parts. A lone EDAD part does not clear a BXM subject. Unresolved foreign studies and a different selected science do not clear tests. External selections are deducted only when recognition is explicitly reported as approved. Pending recognition remains in the exam count, and an approved recognition does not prompt another recognition request. This is not an automatic equivalency decision.
- Provide a recommendation-to-selection action for users starting without a program.
- Provide a session-only checklist and a download containing remaining exams, estimated fees, dates, warnings, task status, and official channels.

## Dates and forms

`content/calendar/*.json` remains the date source. The wizard selects future/current events using the Costa Rica calendar day and filters EDAD parts. It explicitly identifies the absence of upcoming dates in incorporated data; it does not infer another year's schedule or claim that DGEC has not published one. Source links and recorded verification dates remain visible.

The form helper searches the actual PDFs in `project_docs/program_official_process_pdfs`, with process filters for recognition, grades, completion, and replacement. A duplicate recognition PDF under the III Ciclo conclusion folder is excluded. Foreign studies route to the dedicated official requirements page. The helper is available from the resource guide, approval step, and result. It does not submit applications or invent a transfer form.

Official pages consulted for this revision:

- [DGEC forms and submission channels](https://dgec.mep.go.cr/tramites/)
- [BXM requirements and documentation with/without an expediente](https://dgec.mep.go.cr/bachillerato-por-madurez-suficiente/)
- [DGEC annual calendar](https://dgec.mep.go.cr/calendario-anual/)

## Verification

Regression coverage includes date boundaries, Costa Rica midnight, past BXM dates, EDAD module filtering, partial/full transfers, foreign resolution, science mismatch, primary approvals, selected-scope totals, repeated paperwork, origin changes, checklist revisits, and real form discovery. The production build includes the process PDFs through Vite's asset pipeline.

- Final targeted run: 42 tests passed across five files.
- Production build and whitespace checks passed. Lint reports an existing unused `Calendar` import in `ProgramSchedulesOverview.tsx`, which was already modified before this revision.
- Broader run: 253 tests passed; three failed in `Header`, `EntryLandingPage`, and `WelcomePage`. Those failures expect text removed by the pre-existing edits (`Preparación independiente`, `Prepárate para tu próximo paso`, and `Practicar Matemáticas BXM`). Those files were not changed by this revision.

Browser visual verification could not be completed because the browser tool timed out reaching the local development server. Component and service tests provide functional coverage; a visual review remains outstanding.
