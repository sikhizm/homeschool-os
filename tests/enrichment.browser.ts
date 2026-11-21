import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {test} from 'node:test';
import {chromium} from 'playwright';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import EnrichmentView from '../src/app/library/enrichment/enrichment-view';

test('Supplementary book directory keeps all source links and responsive class groupings', async () => {
 const css=readFileSync(resolve(process.cwd(),'src/app/library/enrichment/enrichment.css'),'utf8');
 const server=createServer((_request,response)=>{
  response.setHeader('Content-Type','text/html; charset=utf-8');
  response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/><style>*{box-sizing:border-box}body{margin:0}'+css+'</style></head><body>'+
   renderToStaticMarkup(createElement(EnrichmentView))+'</body></html>');
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();
 assert.ok(address&&typeof address==='object');
 let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto('http://127.0.0.1:'+address.port+'/library/enrichment');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'fits '+width);
   assert.equal(await page.getByRole('heading',{name:'Supplementary books & study materials'}).count(),1);
   assert.equal(await page.locator('.enrichment-book-card').count(),10);
   assert.equal(await page.locator('.enrichment-book-group').count(),3);
   assert.equal(await page.locator('.enrichment-open-book').count(),10);
   assert.ok(await page.locator('.enrichment-open-book').evaluateAll(nodes=>nodes.every(node=>
    node.getAttribute('href')?.startsWith('https://drive.google.com/file/d/')&&
    node.getAttribute('target')==='_blank'&&
    node.getAttribute('rel')?.includes('noopener'))));
   const first=page.locator('.enrichment-book-card').first();
   assert.equal(await first.getByText('Class 1 · Punjabi').count(),1);
   assert.equal(await first.getByText('Basant Punjabi').count(),1);
   assert.equal(await page.getByRole('link',{name:'Classes 4–6'}).getAttribute('href'),'#enrichment-middle');
   await page.getByRole('link',{name:'Classes 4–6'}).click();
   assert.equal(new URL(page.url()).hash,'#enrichment-middle');
  }
 }finally{await browser?.close();server.close()}
});
