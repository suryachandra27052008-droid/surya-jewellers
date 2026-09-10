/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS maintenance script. */
const {loadEnvConfig}=require('@next/env');
const {createClient}=require('@sanity/client');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
loadEnvConfig(process.cwd());
const client=createClient({projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID||'sd28lfuz',dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',apiVersion:'2024-01-01',useCdn:false,token:process.env.SANITY_API_TOKEN});
(async()=>{
  if(!process.env.SANITY_API_TOKEN)throw new Error('SANITY_API_TOKEN is required');
  const docs=(await client.fetch('*[_type == "order"]')).filter(doc=>!doc._id.includes('.'));
  console.log(JSON.stringify({publicOrders:docs.length,apply:process.argv.includes('--apply')}));
  if(!process.argv.includes('--apply')||!docs.length)return;
  const dir=path.join(os.homedir(),'.codex','private-backups','surya-orders');
  fs.mkdirSync(dir,{recursive:true});
  const backup=path.join(dir,`${Date.now()}.json`);
  fs.writeFileSync(backup,JSON.stringify(docs),{flag:'wx',mode:0o600});
  for(const doc of docs){
    const references=await client.fetch('count(*[references($id)])',{id:doc._id});
    if(references)throw new Error('Order references require a reviewed migration; no deletion performed for this order');
    const id=`orders.legacy-${doc._id}`;
    if(await client.getDocument(id))throw new Error('Destination already exists; inspect before retrying');
    const {_id,_rev,_createdAt,...body}=doc;
    delete body._updatedAt;
    await client.transaction().patch(_id,p=>p.ifRevisionId(_rev).set({privacyMigration:true}))
      .create({...body,_id:id,originalCreatedAt:_createdAt}).delete(_id).commit();
  }
  const anonymous=client.withConfig({token:undefined});
  const visible=await anonymous.fetch('count(*[_type == "order"])');
  console.log(JSON.stringify({migrated:docs.length,anonymousVisibleOrders:visible,backup}));
  if(visible!==0)throw new Error('Anonymous order visibility check failed');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
