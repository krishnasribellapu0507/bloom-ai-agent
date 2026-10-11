import { createServerFnf } from './fnf.server';
import { bindings } from './bindings.server';

type Kind = 'url' | 'image' | 'html';
export type LearningItem = { id:string; kind:Kind; title:string; url:string | null; notes:string; analysis:string; createdAt:string; hasAsset:boolean };
export type LearningFeedback = { id:string; rating:number; prompt:string; correction:string; createdAt:string };
export type LearningRun = { id:string; prompt:string; score:number; critique:string; createdAt:string };
type ItemRow = {id:string;kind:Kind;title:string;url:string|null;notes:string;analysis:string;asset_key:string|null;created_at:string};
type FeedbackRow = {id:string;rating:number;prompt:string;correction:string;created_at:string};
type RunRow = {id:string;prompt:string;score:number;critique:string;created_at:string};
async function scope(){
  const user=await createServerFnf().profile.getUser();
  if(!user) throw new Error('Sign in to Higgsfield to save and load private Learning Studio data.');
  const workspace=await createServerFnf().profile.getCurrentWorkspace().catch(()=>null);
  return `user:${user.id}:workspace:${workspace?.id ?? user.workspaceId ?? 'personal'}`;
}
function db(){const db=bindings().DB; if(!db) throw new Error('Cloud learning database unavailable'); return db;}
const item=(r:ItemRow):LearningItem=>({id:r.id,kind:r.kind,title:r.title,url:r.url,notes:r.notes,analysis:r.analysis,createdAt:r.created_at,hasAsset:!!r.asset_key});
const feedback=(r:FeedbackRow):LearningFeedback=>({id:r.id,rating:r.rating,prompt:r.prompt,correction:r.correction,createdAt:r.created_at});
const run=(r:RunRow):LearningRun=>({id:r.id,prompt:r.prompt,score:r.score,critique:r.critique,createdAt:r.created_at});

export async function loadLearning() {

  const owner=await scope();const database=db();
  const [items,prefs,feedbacks,runs]=await Promise.all([
    database.prepare('SELECT * FROM forma_learning_items WHERE owner_key=? ORDER BY created_at DESC LIMIT 50').bind(owner).all<ItemRow>(),
    database.prepare('SELECT preferences FROM forma_learning_preferences WHERE owner_key=?').bind(owner).first<{preferences:string}>(),
    database.prepare('SELECT * FROM forma_learning_feedback WHERE owner_key=? ORDER BY created_at DESC LIMIT 40').bind(owner).all<FeedbackRow>(),
    database.prepare('SELECT * FROM forma_learning_runs WHERE owner_key=? ORDER BY created_at DESC LIMIT 20').bind(owner).all<RunRow>(),
  ]);
  return {items:items.results.map(item),preferences:prefs?.preferences||'',feedback:feedbacks.results.map(feedback),runs:runs.results.map(run)};
}

export async function savePreferences(data:{preferences:string}) {

  const owner=await scope();await db().prepare("INSERT INTO forma_learning_preferences (owner_key,preferences) VALUES (?,?) ON CONFLICT(owner_key) DO UPDATE SET preferences=excluded.preferences,updated_at=datetime('now')").bind(owner,data.preferences).run();return {ok:true};
}

export async function saveLearningItem(data:{kind:Kind;title:string;url?:string;notes:string;analysis:string;base64?:string;mime?:'image/png'|'image/jpeg'|'image/webp'|'text/html'}) {

  const owner=await scope(),id=crypto.randomUUID();let assetKey:string|null=null;
  if(data.kind==='url' && (!data.url || !/^https?:\/\//i.test(data.url))) throw new Error('Use a public HTTP(S) reference URL');
  if(data.base64){
    if(!data.mime)throw new Error('Missing upload MIME type');
    if((data.kind==='image'&&!data.mime.startsWith('image/'))||(data.kind==='html'&&data.mime!=='text/html'))throw new Error('Upload type does not match file');
    const bucket=bindings().STORAGE;if(!bucket)throw new Error('Upload storage unavailable');
    const bytes=Uint8Array.from(atob(data.base64),c=>c.charCodeAt(0));
    if(bytes.byteLength>2200000)throw new Error('Upload exceeds 2.2 MB');
    assetKey=`forma-learning/${encodeURIComponent(owner)}/${id}`;
    await bucket.put(assetKey,bytes,{httpMetadata:{contentType:data.mime}});
  }
  await db().prepare('INSERT INTO forma_learning_items (id,owner_key,kind,title,url,notes,analysis,asset_key) VALUES (?,?,?,?,?,?,?,?)').bind(id,owner,data.kind,data.title,data.url??null,data.notes,data.analysis,assetKey).run();
  return {id};
}

export async function removeLearningItem(data:{id:string}) {

 const owner=await scope();const record=await db().prepare('SELECT asset_key FROM forma_learning_items WHERE id=? AND owner_key=?').bind(data.id,owner).first<{asset_key:string|null}>();
 if(!record)throw new Error('Item not found');
 await db().prepare('DELETE FROM forma_learning_items WHERE id=? AND owner_key=?').bind(data.id,owner).run();
 if(record.asset_key)await bindings().STORAGE?.delete(record.asset_key);return {ok:true};
}

export async function saveFeedback(data:{rating:1|-1;prompt:string;correction:string}) {

 const owner=await scope();const id=crypto.randomUUID();await db().prepare('INSERT INTO forma_learning_feedback (id,owner_key,rating,prompt,correction) VALUES (?,?,?,?,?)').bind(id,owner,data.rating,data.prompt,data.correction).run();return {id};
}

export async function saveLearningRun(data:{prompt:string;score:number;critique:string}) {

 const owner=await scope();const id=crypto.randomUUID();await db().prepare('INSERT INTO forma_learning_runs (id,owner_key,prompt,score,critique) VALUES (?,?,?,?,?)').bind(id,owner,data.prompt,data.score,data.critique).run();return {id};
}

export async function loadAsset(data:{id:string}) {

 const owner=await scope();const record=await db().prepare('SELECT asset_key FROM forma_learning_items WHERE id=? AND owner_key=?').bind(data.id,owner).first<{asset_key:string|null}>();
 if(!record?.asset_key)throw new Error('Asset not found');const obj=await bindings().STORAGE?.get(record.asset_key);if(!obj)throw new Error('Asset missing');
 const bytes=new Uint8Array(await obj.arrayBuffer());if(bytes.length>2200000)throw new Error('Stored asset too large');
 let output='';for(let i=0;i<bytes.length;i+=8192)output+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return {base64:btoa(output),mime:obj.httpMetadata?.contentType||'application/octet-stream'};
}
