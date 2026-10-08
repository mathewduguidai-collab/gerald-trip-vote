const vm=require('node:vm'); const fs=require('node:fs'); const assert=require('node:assert/strict');
class E { constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.listeners={};this.value='';} append(...x){this.children.push(...x)} replaceChildren(...x){this.children=[...x]} setAttribute(k,v){this[k]=v} addEventListener(k,v){this.listeners[k]=v} get childElementCount(){return this.children.length} }
const elements=new Map(); const document={createElement:t=>new E(t),getElementById:id=>{if(!elements.has(id))elements.set(id,new E('div'));return elements.get(id)},querySelector:q=>{if(!elements.has(q))elements.set(q,new E('div'));return elements.get(q)}};
const context={document,location:{hash:'',pathname:'/'},sessionStorage:{getItem:()=>null},history:{replaceState:()=>{}},URLSearchParams,console,Map,window:{scrollTo:()=>{}}};vm.createContext(context);
vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/load\(\);\s*$/, ''),context);
vm.runInContext(`applyPresentation({trip_title:'Private test',presentation:{heading:'Family survey',collect_attendance:true,feedback_title:'When will you be here?',feedback_help:'Arrival, departure and nights',feedback_placeholder:'Arriving: ...'}}); ballots=[{poll_id:101,title:'Choice',options:[{id:900,title:'Test'}]}]; committed.set(101,900); showDone();`,context);
assert.equal(elements.get('header h1').textContent,'Family survey');
const done=elements.get('ballots').children[0]; assert(done.children.some(x=>x.textContent==='Preferences saved. Now add your dates below.'));
const panel=done.children[done.children.length-1]; assert.equal(panel.children[0].textContent,'When will you be here?'); assert.equal(panel.children[2].placeholder,'Arriving: ...'); assert.equal(panel.children[2].value,'');
vm.runInContext(`globalResult=lookupLinks(900,{maps_query:'West Baden Springs Hotel',official_url:'https://www.frenchlick.com/history.htm'});`,context);
assert.equal(context.globalResult.children.length,2); assert.match(context.globalResult.children[0].href,/West%20Baden/);
assert.equal(context.globalResult.children[0].target,'_blank');
vm.runInContext(`globalResult=lookupLinks(901,{official_url:'javascript:alert(1)'}); applyPresentation({trip_title:'Other trip'});`,context); assert.equal(context.globalResult.children.length,0);assert.equal(elements.get('header h1').textContent,'Other trip');
console.log('PASS: attendance prompts, neutral answers, dynamic trip/count, separate safe research links, generic fallback');
