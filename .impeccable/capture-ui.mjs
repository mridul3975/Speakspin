import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve('.impeccable/review');
await fs.mkdir(out,{recursive:true});
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--hide-scrollbars','--remote-debugging-port=9223','--remote-debugging-address=127.0.0.1','--user-data-dir='+path.resolve('.impeccable/ui-review-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
const fixPass = process.argv.includes('--fix-pass');
const autoMatch = process.argv.includes('--auto-match');
let socket;
try {
 let endpoints;
 for(let i=0;i<100;i++){try{endpoints=await (await fetch('http://127.0.0.1:9223/json')).json();break;}catch{await pause(100);}}
 const target=endpoints?.find(item=>item.type==='page');if(!target)throw new Error('No isolated browser page');
 socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let id=0;const calls=new Map();const exceptions=[];
 socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const call=calls.get(message.id);if(call){calls.delete(message.id);message.error?call.reject(new Error(JSON.stringify(message.error))):call.resolve(message.result);}}if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.text+': '+JSON.stringify(message.params.exceptionDetails.exception?.description));});
 const rpc=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;calls.set(callId,{resolve,reject});socket.send(JSON.stringify({id:callId,method,params}));});
 const evaluate=async expression=>{const value=await rpc('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(value.exceptionDetails)throw new Error(value.exceptionDetails.text);return value.result?.value;};
 await rpc('Page.enable');await rpc('Runtime.enable');
 await rpc('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const viewport=async(width,height)=>rpc('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
 const ready=async()=>{for(let i=0;i<100;i++){if(await evaluate("document.querySelector('#root')?.children.length > 0"))break;await pause(100);}await evaluate('document.fonts.ready.then(()=>true)');await pause(300);};
 const goto=async url=>{await rpc('Page.navigate',{url});await pause(350);await ready();};
 const click=async text=>{const found=await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)return false;button.click();return true;})()`);if(!found)throw new Error('Button absent: '+text);await pause(200);};
 const metrics=[];
 const shot=async(name)=>{await ready();const size=await evaluate('({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight})');const image=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:size.width,height:size.scrollHeight,scale:1}});await fs.writeFile(path.join(out,name+'.png'),Buffer.from(image.data,'base64'));metrics.push({name,...size,overflow:size.scrollWidth>size.width});};
 if(autoMatch){
  await viewport(390,844);
  await goto('http://127.0.0.1:5173/');
  await evaluate('localStorage.clear()');
  await goto('http://127.0.0.1:5173/');
  const startedAt=Date.now();
  await click('Play a 1v1');
  await pause(3000);
  const searching=await evaluate('document.querySelector("h1")?.textContent');
  if(searching!=='Finding your challenger')throw new Error('Expected connected matchmaking before five seconds: '+searching);
  await shot('auto-match-search');
  for(let i=0;i<80;i++){
   if(await evaluate('document.querySelector("h1")?.textContent === "Meet your challenger"'))break;
   await pause(100);
  }
  const body=await evaluate('document.body.innerText');
  if(!body.includes('Meet your challenger'))throw new Error('Automatic matching did not complete');
  if(body.includes('Practice bot')||body.includes('Practice with a bot'))throw new Error('Unexpected bot choice or announcement');
  console.log(JSON.stringify({automaticMatchMs:Date.now()-startedAt,botPrompt:false,botAnnouncement:false}));
  await shot('auto-match-opponent');
  await click('Leave match');
 }
 for(const [width,height,label] of (fixPass || autoMatch ? [] : [[1440,1000,'desktop'],[390,844,'mobile'],[768,1024,'tablet'],[360,800,'compact']])){
  await viewport(width,height);await goto('http://127.0.0.1:5173/');await evaluate('localStorage.clear()');await goto('http://127.0.0.1:5173/');await shot(label);
  if(label==='tablet')continue;
  await click('Training');await shot(label+'-setup');await click('Spin for a topic');await click('Spin the wheel');await shot(label+'-wheel');await click('Take the mic');await shot(label+'-recorder');
  await goto('http://127.0.0.1:5173/');await click('Progress');await shot(label+'-progress');await click('Arena');await click('Player profile');await shot(label+'-profile');
 }
 // Dedicated sample fixtures are isolated from the real app and clearly labeled.
 for(const [width,height,label] of (autoMatch ? [] : fixPass ? [[390,844,'mobile'],[360,800,'compact']] : [[1440,1000,'desktop'],[390,844,'mobile'],[360,800,'compact']])){
  await viewport(width,height);
  for(const screen of (fixPass ? ['battle-results','opponent','lobby'] : ['solo-results','battle-results','opponent','topic','judging','signup','lobby'])){
   await goto('http://127.0.0.1:5173/.visual-review.html?screen='+screen);await shot(label+'-'+screen);
   if(screen==='solo-results'||screen==='battle-results'){
    await evaluate('document.querySelectorAll("details").forEach(detail=>detail.open=true)');
    await shot(label+'-'+screen+'-expanded');
   }
  }
 }
 await fs.writeFile(path.join(out,autoMatch ? 'auto-match-report.json' : fixPass ? 'fix-report.json' : 'capture-report.json'),JSON.stringify({metrics,exceptions},null,2));
 console.log(JSON.stringify({screenshots:metrics.length,overflow:metrics.filter(row=>row.overflow),exceptions},null,2));
 await rpc('Browser.close');
}finally{socket?.close();browser.kill();}
