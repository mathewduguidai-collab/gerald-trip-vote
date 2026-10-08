import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const server=createServer((req,res)=>{
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
 res.end(html);
});
await new Promise(done=>server.listen(9187,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const polls=[
 {poll_id:3,title:'Hotel',selected_option_id:null,options:[
  {id:7,title:'LeVeque',description:'Pet-friendly',estimated_cost:948.07},
  {id:8,title:'The Joseph',description:'Pet-friendly',estimated_cost:1177.07},
  {id:26,title:'Drury Plaza',description:'Value',estimated_cost:null},
  {id:27,title:'Short North 3BR/2BA Airbnb',description:'Shared',estimated_cost:null}
 ]},
 {poll_id:7,title:'Friday',selected_option_id:null,options:[{id:13,title:'Pins',description:'Games',estimated_cost:null},{id:14,title:'Drinks',description:'Cocktails',estimated_cost:null}]},
 {poll_id:8,title:'Saturday anchor',selected_option_id:null,options:[{id:18,title:'Steak dinner',description:'Dinner',estimated_cost:null},{id:16,title:'Concert',description:'Music',estimated_cost:null}]},
 {poll_id:9,title:'Saturday late',selected_option_id:null,options:[{id:20,title:'Cabaret',description:'Evening',estimated_cost:null},{id:21,title:'Drinks',description:'Bar',estimated_cost:null}]},
 {poll_id:10,title:'Sunday',selected_option_id:null,options:[{id:25,title:'Brunch',description:'Rest',estimated_cost:null},{id:23,title:'Museum',description:'Visit',estimated_cost:null}]}
];
let saved=Object.create(null), writes=0, failAfter=-1;
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
await page.route('https://splsniqrunknnwhccrxo.supabase.co/functions/v1/gerald-trip-vote/**',async route=>{
 const path=new URL(route.request().url()).pathname;
 let reply={},status=200;
 if(path.endsWith('/ballot')){
  reply={ballots:polls.map(p=>({...p,selected_option_id:saved[p.poll_id]??null}))};
 }else if(path.endsWith('/vote')){
  writes++;
  if(writes===failAfter){status=503;reply={error:'temporary_test_failure'};}
  else {
   const body=JSON.parse(route.request().postData());
   saved[body.poll_id]=body.option_id;
   reply={accepted:true,poll_id:body.poll_id,option_id:body.option_id,request_id:body.request_id};
  }
 }else{status=404;reply={error:'unknown'};}
 await route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(reply)});
});
try{
 const token='a'.repeat(64);
 await page.goto('http://127.0.0.1:9187/#token='+token);
 await page.getByText('0 of 5 choices selected').waitFor({timeout:15000});
 assert.equal(await page.locator('#submit-all').count(),1,'single bottom submit');
 assert.equal(await page.locator('.card button').count(),0,'no per-card buttons');
 assert.equal(await page.locator('.research a').count()>0,true,'research links exist');
 await page.locator('input[name="vote-3"][value="26"]').check();
 await page.locator('input[name="vote-7"][value="13"]').check();
 await page.locator('input[name="vote-8"][value="18"]').check();
 await page.locator('input[name="vote-9"][value="20"]').check();
 await page.locator('input[name="vote-10"][value="25"]').check();
 await page.getByText('5 of 5 choices selected').waitFor();
 await page.locator('#submit-all').click();
 await page.getByRole('heading',{name:'All done. Your votes are saved!'}).waitFor({timeout:20000});
 assert.equal(writes,5,'five unique updates');
 assert.equal(Object.keys(saved).length,5,'five saved ballots');
 assert.equal(await page.getByText('You can safely close this browser tab.',{exact:false}).count(),1,'clear closing message');
 await page.reload();
 await page.getByRole('heading',{name:'All done. Your votes are saved!'}).waitFor();
 await page.getByRole('button',{name:'Review or change my votes'}).click();
 await page.locator('input[name="vote-3"][value="27"]').check();
 await page.locator('#submit-all').click();
 await page.getByRole('heading',{name:'All done. Your votes are saved!'}).waitFor();
 assert.equal(saved[3],27,'Airbnb switch persisted');
 assert.equal(writes,6,'only changed vote re-written');

 await page.getByRole('button',{name:'Review or change my votes'}).click();
 await page.locator('input[name="vote-7"][value="14"]').check();
 failAfter=writes+1;
 await page.locator('#submit-all').click();
 await page.getByText('Not all votes could be confirmed',{exact:false}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'All done. Your votes are saved!'}).count(),0,'no false success on failed write');
 console.log('PASS: mobile first-time 5-vote flow, one submit, durable confirmation, returning summary, edit-only resubmission, graceful failure, venue research links');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
