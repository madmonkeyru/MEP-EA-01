import { chromium } from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
fs.mkdirSync('artifacts/ui-feedback', {recursive:true});
const base = process.env.FLOW_BASE_URL || 'http://127.0.0.1:5180';
const browser=await chromium.launch({headless:true, executablePath: process.env.FLOW_CHROME_PATH});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [name,route] of [['entry','#/'],['programs','#/programas'],['calendar','#/calendario'],['helper','#/ayuda'],['subject','#/programas/bxm'],['practice','#/programas/bxm/matematicas?convocatoria=2026-c2']]) {
 await page.goto(base+'/'+route);await page.waitForTimeout(600);await page.screenshot({path:`artifacts/ui-feedback/${name}-desktop.png`,fullPage:true});
 if(name==='programs'){await page.getByRole('button',{name:'Explorar fechas · BXM',exact:true}).click();await page.getByRole('button',{name:'← Comparar programas'}).waitFor();}
 if(name==='helper'){for(const name of ['Trámites y formularios','Conoce tus opciones','Matrícula y apoyos','Materiales de estudio'])await page.getByRole('tab',{name,exact:true}).click();}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`artifacts/ui-feedback/${name}-mobile.png`,fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Page overflow: '+name);
 await page.setViewportSize({width:1600,height:1000});
}
await page.goto(base+'/#/calendario');
await page.getByLabel('Tipo de evento').selectOption('exam');
await page.getByLabel('Estado',{exact:true}).selectOption('upcoming');
assert.ok(await page.locator('.calendar-event-card').count()>0);
for(const card of await page.locator('.calendar-event-card').all()) assert.match(await card.innerText(), /Próximo/);
await page.locator('.calendar-event-card summary').first().click();
await page.getByRole('link',{name:'Fuente DGEC',exact:true}).first().waitFor();
await page.goto(base+'/#/programas/bxm/matematicas?convocatoria=2026-c2');
await page.evaluate(()=>{
 const attempt={id:'delete-me',userId:'guest',timestamp:new Date().toISOString(),mode:'area',scopeText:'Práctica',scorePercentage:50,correctCount:5,totalItems:10,durationSeconds:60,responses:{},programId:'bxm',subjectId:'matematicas',convocatoriaId:'2026-c2'};
 localStorage.setItem('mep_ea_attempts',JSON.stringify([attempt,{...attempt,id:'preserve-me',userId:'other-profile'}]));
});
await page.reload();await page.getByRole('tab',{name:'Mi progreso',exact:true}).click();
await page.getByRole('button',{name:'Eliminar todo el historial',exact:true}).click();
await page.getByRole('button',{name:'Cancelar',exact:true}).click();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mep_ea_attempts')).length),2);
await page.getByRole('button',{name:'Eliminar todo el historial',exact:true}).click();
await page.getByRole('button',{name:'Sí, eliminar todos',exact:true}).click();
assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mep_ea_attempts')).map(a=>a.id)),['preserve-me']);
await page.emulateMedia({colorScheme:'dark'});await page.reload();
await page.getByRole('heading',{name:'Historial de este perfil',exact:true}).waitFor();
await page.screenshot({path:'artifacts/ui-feedback/progress-dark.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('Desktop, mobile, calendar filters, history deletion and dark theme checks passed.');await browser.close();


