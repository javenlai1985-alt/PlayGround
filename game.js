import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas=document.querySelector('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();scene.background=new THREE.Color('#a9d8d6');scene.fog=new THREE.Fog('#a9d8d6',35,105);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,180);
scene.add(new THREE.HemisphereLight('#e9ffff','#637a72',2.05));
const sun=new THREE.DirectionalLight('#fff0d3',3.2);sun.position.set(-15,25,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;sun.shadow.bias=-.0002;scene.add(sun);
const mat=(color,roughness=.83)=>new THREE.MeshStandardMaterial({color,roughness});
const mats={grass:mat('#77aa83'),path:mat('#d6d1bc'),road:mat('#555f67'),white:mat('#f3eee1'),blue:mat('#4385de'),navy:mat('#34415e'),skin:mat('#f3c7a6'),dark:mat('#343345'),red:mat('#e8897a'),mint:mat('#8dc9b3'),wood:mat('#a8754d'),yellow:mat('#f2ca75'),glass:mat('#89b9c3',.28)};
function mesh(geo,material,parent=scene,pos=[0,0,0],cast=true){const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function box(parent,pos,size,material,cast=true){return mesh(new THREE.BoxGeometry(...size),material,parent,pos,cast)}
function sphere(parent,pos,scale,material){const o=mesh(new THREE.SphereGeometry(1,16,12),material,parent,pos);o.scale.set(...scale);return o}
function cylinder(parent,pos,r1,r2,h,material,seg=12){return mesh(new THREE.CylinderGeometry(r1,r2,h,seg),material,parent,pos)}
function group(parent=scene,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g}
const floor=mesh(new THREE.PlaneGeometry(220,220),mats.grass,scene,[0,-.08,0],false);floor.rotation.x=-Math.PI/2;
// A friendly little block: a broad plaza framed by pastel storefronts and pocket greenery.
box(scene,[0,-.035,0],[34,.1,28],mats.path,false);box(scene,[0,-.01,13.4],[36,.08,4],mats.road,false);
for(let i=-1;i<=1;i++){box(scene,[i*3,.035,13.4],[.12,.03,1.5],mats.yellow,false)}
function building(x,z,w,d,h,color,label){const g=group(scene,[x,0,z]);box(g,[0,h/2,0],[w,h,d],mat(color),false);box(g,[0,h+.25,0],[w+.35,.5,d+.3],mat('#f4e3c9'),false);for(let xx=-w/2+1;xx<w/2;xx+=2.25){box(g,[xx,1.7,d/2+.025],[1.2,1.45,.08],mats.glass,false);box(g,[xx,1.7,d/2+.08],[.06,1.5,.04],mats.white,false)}box(g,[0,3.8,d/2+.08],[w*.66,.45,.12],mat('#fff4df'),false);const sign=box(g,[0,3.8,d/2+.16],[w*.55,.27,.04],mat(color==='#e9a98e'?'#d77d67':'#739a9b'),false);return g}
building(-14,-7,8,7,8,'#e7a98f','BAKERY');building(-4,-10,8,6,6,'#7da9a0','');building(11,-8,10,8,9,'#d7b777','');building(19,2,7,8,7,'#89a4c6','');
// Doors, awnings, apartment blocks in the distant skyline
for(const x of [-14,-4,11,19]){const z=x===19?6:-3;box(scene,[x,1.1,z],[1.35,2.2,.12],mat('#725d55'),false);box(scene,[x,2.25,z+.08],[1.55,.14,.16],mat('#fff0d8'),false)}
for(let i=0;i<8;i++){const x=-30+i*8;const h=10+(i*7%13);box(scene,[x,h/2,-28],[5,h,5],mat(['#aab9bd','#d3c7b1','#91adb0'][i%3]),false);for(let y=2;y<h-1;y+=2)for(let xx=-1.5;xx<=1.5;xx+=1.5)box(scene,[x+xx,y,-25.45],[.65,.85,.07],mat('#97c7cb'),false)}
function tree(x,z,s=1){const g=group(scene,[x,0,z]);cylinder(g,[0,.9*s,0],.22*s,.32*s,1.8*s,mat('#87654c'));sphere(g,[0,2.4*s,0],[1.2*s,1.35*s,1.1*s],mat('#65a77b'));sphere(g,[-.65*s,2.1*s,.1*s],[.75*s,.85*s,.8*s],mat('#78b989'));sphere(g,[.62*s,2.25*s,-.08*s],[.8*s,.9*s,.76*s],mat('#71b184'));return g}
for(const p of [[-16,3],[-10,7],[-8,9],[7,7],[16,10],[24,-4],[-23,-8],[-22,10],[4,-17]])tree(...p,.9+Math.random()*.25);
function benchAt(x,z){const g=group(scene,[x,0,z]);box(g,[0,.65,0],[2.5,.18,.72],mats.wood);box(g,[0,1.13,-.28],[2.5,.85,.16],mats.wood);for(const xx of [-.9,.9]){box(g,[xx,.32,0],[.12,.65,.12],mats.dark);box(g,[xx,.82,-.25],[.12,.85,.12],mats.dark)}return g}benchAt(-7,1);benchAt(7,2);benchAt(15,4);
// Character creator: custom low-poly body, expressive faces, signature hair, and animated joints.
const actorMaterial=(hex)=>new THREE.MeshStandardMaterial({color:hex,roughness:.72});
const game={actors:[],props:[],effects:[],keys:{},active:'konata',tool:'blaster',accent:'#397ee8',hair:'#4385de',cameraYaw:0,cameraPitch:.22,moveSpeed:0,joyX:0,joyY:0,aimPoint:new THREE.Vector3(),velocityY:0,onGround:true,health:100,ammo:12,maxAmmo:12,reload:0,grabbed:null,startedAt:performance.now(),muted:false};
function makeCharacter(type,player=false){
 const root=group(scene);const rig=group(root);const c={type,root,rig,player,health:100,panic:0,action:0,phase:Math.random()*6,goal:new THREE.Vector3((Math.random()-.5)*18,0,(Math.random()-.5)*12),speed:type==='niko'?1.5:1.75,expression:0};
 const niko=type==='niko',hairColor=player?game.hair:(niko?'#3b343b':'#4385de'),skin=actorMaterial('#f1c6a5'),hair=actorMaterial(hairColor),shirt=actorMaterial(player?game.accent:(niko?'#f3d37d':'#4e78c8')),pants=actorMaterial(niko?'#657d86':'#39405e'),white=actorMaterial('#fff9ec'),iris=actorMaterial(niko?'#6a9c92':'#5686dc'),dark=actorMaterial('#39313b');
 c.materials={hair,shirt,pants,skin};c.body=group(rig,[0,0,0]);
 // torso + neck + oversized expressive head
 const torso=mesh(new THREE.CapsuleGeometry(.39,.55,4,8),shirt,c.body,[0,1.05,0]);torso.rotation.z=Math.PI;
 cylinder(c.body,[0,1.53,0],.14,.16,.22,skin);
 sphere(c.body,[0,1.95,0],[.57,.61,.49],skin);
 // Face on the front (+z)
 for(const x of [-.19,.19]){sphere(c.body,[x,2.02,.428],[.09,.135,.045],white);sphere(c.body,[x,2.015,.468],[.052,.09,.028],iris);sphere(c.body,[x,2.015,.491],[.025,.055,.014],dark);sphere(c.body,[x-.014,2.05,.505],[.015,.022,.01],white)}
 sphere(c.body,[0,1.84,.475],[.035,.024,.022],actorMaterial('#d79078'));
 // Hair cap and framing locks, plus Konata's recognizable ahoge
 sphere(c.body,[0,2.36,-.03],[.61,.37,.53],hair);
 for(const x of [-1,1]){const lock=sphere(c.body,[x*.48,2.01,.12],[.19,.55,.2],hair);lock.rotation.z=-x*.22;const tail=sphere(c.body,[x*.54,1.34,-.08],[.16,.65,.16],hair);tail.rotation.z=-x*.16}
 if(!niko){const fringe=sphere(c.body,[0,2.24,.39],[.44,.2,.17],hair);fringe.rotation.x=-.14;const ahoge=mesh(new THREE.TorusGeometry(.24,.055,7,14,Math.PI*1.35),hair,c.body,[.03,2.67,-.01]);ahoge.rotation.set(.3,0,-.35)}
 else { // Niko's soft cap with unmistakable tall cat-like ears
  const hat=mesh(new THREE.CylinderGeometry(.56,.59,.22,12),actorMaterial('#dfb866'),c.body,[0,2.5,-.02]);sphere(c.body,[0,2.6,-.04],[.48,.2,.48],actorMaterial('#e6c876'));
  for(const x of [-1,1]){const ear=mesh(new THREE.ConeGeometry(.19,.67,7),hair,c.body,[x*.39,2.91,-.02]);ear.rotation.z=-x*.24;const inner=sphere(c.body,[x*.39,2.89,.116],[.085,.25,.035],actorMaterial('#d98f86'));inner.rotation.z=-x*.24}
  // side tufts peek out beneath the hat brim
  for(const x of [-1,1])sphere(c.body,[x*.49,2.18,.06],[.16,.33,.15],hair);
 }
 // Sleeves and articulated legs/arms for walk and run cycles
 c.limbs=[];
 for(const x of [-1,1]){const arm=group(c.body,[x*.49,1.29,0]);const upper=cylinder(arm,[0,-.24,0],.13,.16,.5,shirt);upper.rotation.z=x*.12;const hand=sphere(arm,[0,-.56,.02],[.13,.13,.13],skin);c.limbs.push({pivot:arm,kind:'arm',side:x});
  const leg=group(c.body,[x*.2,.62,0]);const thigh=cylinder(leg,[0,-.29,0],.16,.19,.59,pants);const boot=mesh(new THREE.BoxGeometry(.31,.18,.46),actorMaterial(niko?'#e7e2d3':'#f1ece0'),leg,[0,-.63,.11]);c.limbs.push({pivot:leg,kind:'leg',side:x});}
 // Konata's sailor collar and Niko's little scarf
 if(!niko){const collar=mesh(new THREE.ConeGeometry(.42,.24,4),actorMaterial('#f4eee1'),c.body,[0,1.47,.12]);collar.rotation.x=Math.PI;const tie=mesh(new THREE.ConeGeometry(.08,.38,4),actorMaterial('#c86e73'),c.body,[0,1.27,.36]);tie.rotation.x=Math.PI}
 else {const scarf=mesh(new THREE.TorusGeometry(.2,.07,6,12),actorMaterial('#d98772'),c.body,[0,1.48,.02]);scarf.rotation.x=Math.PI/2}
 c.root.userData.actor=c;game.actors.push(c);return c;
}
const player=makeCharacter('konata',true);player.root.position.set(0,0,4);player.player=true;game.player=player;
const niko=makeCharacter('niko');niko.root.position.set(-3,0,-1);const konataNpc=makeCharacter('konata');konataNpc.root.position.set(3,0,-2);const friend=makeCharacter('niko');friend.type='friend';friend.root.position.set(5,0,3);friend.materials.shirt.color.set('#e5a1a1');

const propMaterials={crate:mat('#c89968'),barrel:mat('#e28a63'),bench:mat('#bd9569'),ball:mat('#f18c91'),wall:mat('#9ab7bf'),cone:mat('#f08d5b'),vehicle:mat('#6a8da4'),building:mat('#d1b894'),npc:mat('#d59e8e')};
function spawnProp(kind,at,impulse=true){const root=group(scene,[at.x,0,at.z]);const material=propMaterials[kind]||mat('#c6ad88');let main;
 if(kind==='crate'){main=box(root,[0,.55,0],[1.05,1.05,1.05],material);for(const s of [-1,1]){box(root,[s*.22,.55,.536],[.09,.94,.03],mat('#e2bd8c'));box(root,[0,.55+s*.22,.538],[.94,.09,.03],mat('#e2bd8c'))}}
 else if(kind==='barrel'){main=cylinder(root,[0,.62,0],.46,.46,1.22,material,12);for(const y of [.23,1]){const band=mesh(new THREE.TorusGeometry(.46,.045,5,14),mat('#e8c486'),root,[0,y,0]);band.rotation.x=Math.PI/2}main.userData.explosive=true}
 else if(kind==='bench'){box(root,[0,.56,0],[2.25,.18,.72],material);box(root,[0,1.05,-.27],[2.25,.78,.15],material);for(const x of [-.85,.85])box(root,[x,.28,0],[.14,.55,.14],mats.dark);main=root.children[0]}
 else if(kind==='ball'){main=sphere(root,[0,.55,0],[.56,.56,.56],material);main.userData.bouncy=true}
 else if(kind==='wall'){main=box(root,[0,1.15,0],[2.5,2.3,.42],material);for(let y=.45;y<2.2;y+=.7)box(root,[0,y,.225],[2.3,.045,.02],mat('#e0d9c8'));main.userData.breakable=true}
 else if(kind==='cone'){main=mesh(new THREE.ConeGeometry(.38,1.1,10),material,root,[0,.58,0]);box(root,[0,.08,0],[.82,.16,.82],mat('#efe4cf'));main.userData.breakable=true}
 else if(kind==='vehicle'){main=box(root,[0,.68,0],[2.35,.76,1.2],material);box(root,[0,1.16,-.05],[1.25,.55,1],mat('#9fc7ca'));for(const x of [-.72,.72])for(const z of [-.56,.56]){const wheel=cylinder(root,[x,.32,z],.27,.27,.15,mat('#3f454a'),12);wheel.rotation.z=Math.PI/2}}
 else if(kind==='building'){main=box(root,[0,1.5,0],[3,3,3],material);for(const x of [-.7,.7])for(const y of [1,2])box(root,[x,y,1.51],[.55,.55,.04],mats.glass)}
 else {main=box(root,[0,.5,0],[1,1,1],material)}
 const p={kind,root,main,velocity:new THREE.Vector3(impulse?(Math.random()-.5)*1.5:0,impulse?2.3:0,impulse?(Math.random()-.5)*1.5:0),spin:new THREE.Vector3(Math.random()*.8,Math.random()*.8,Math.random()*.8),grounded:false,health:kind==='wall'||kind==='building'?2:1,life:Infinity};root.userData.prop=p;game.props.push(p);toast(`${kind==='barrel'?'Pop barrel':kind==='ball'?'Bouncy ball':kind[0].toUpperCase()+kind.slice(1)} spawned`);updateCounts();return p}
function updateCounts(){document.querySelector('#prop-count').textContent=`${String(game.props.length).padStart(2,'0')} PROPS`;document.querySelector('#npc-count').textContent=String(Math.max(3,game.actors.length-1)).padStart(2,'0')}
let toastTimer;function toast(text){const e=document.querySelector('#toast');e.textContent=text;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),1900)}
let audioContext=null;function tone(frequency=440,duration=.08,type='sine',volume=.035){if(game.muted)return;try{audioContext??=new AudioContext();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration)}catch{}}
function burst(position,color='#f4c578',count=10,power=3){for(let i=0;i<count;i++){const dot=sphere(scene,[position.x,position.y,position.z],[.055,.055,.055],mat(color));game.effects.push({mesh:dot,velocity:new THREE.Vector3((Math.random()-.5)*power,Math.random()*power,(Math.random()-.5)*power),life:.55+Math.random()*.35})}}
function explode(at){tone(110,.28,'sawtooth',.09);burst(at,'#ffd184',22,6);burst(at,'#f19579',14,4);for(const p of game.props){const d=p.root.position.distanceTo(at);if(d<7){const dir=p.root.position.clone().sub(at).normalize();p.velocity.addScaledVector(dir,(7-d)*2.1);p.velocity.y+=2;}}
 for(const a of game.actors){if(a.player)continue;const d=a.root.position.distanceTo(at);if(d<8){a.panic=Math.max(a.panic,4);a.goal.copy(a.root.position.clone().sub(at).normalize().multiplyScalar(7).add(a.root.position));a.health=Math.max(0,a.health-(8-d)*5)}}toast('POP! Everyone felt that.');}
function damageProp(p){if(!p)return;if(p.main.userData.explosive){const pos=p.root.position.clone();pos.y+=.6;scene.remove(p.root);game.props.splice(game.props.indexOf(p),1);burst(pos,'#ffd184',8,2);explode(pos);updateCounts();return}p.health--;if(p.health<=0){const pos=p.root.position.clone();pos.y+=.6;burst(pos,p.kind==='wall'?'#d8c8a9':'#f3c08c',12,3);tone(220,.11,'triangle');scene.remove(p.root);game.props.splice(game.props.indexOf(p),1);updateCounts()}else{p.velocity.y=2.4;p.velocity.x+=(Math.random()-.5)*2;toast('Crack! One more pop to break it.') }}
function forward(){return new THREE.Vector3(-Math.sin(game.cameraYaw),0,-Math.cos(game.cameraYaw))}
function spawnPosition(){const target=game.aimPoint.clone();target.y=0;const offset=target.sub(game.player.root.position);if(offset.lengthSq()<.01)offset.copy(forward());return game.player.root.position.clone().addScaledVector(offset.normalize(),3.4)}
function switchCharacter(type){if(type===game.active)return;const old=game.player,pos=old.root.position.clone();scene.remove(old.root);game.actors=game.actors.filter(a=>a!==old);game.player=makeCharacter(type,true);game.player.root.position.copy(pos);game.player.health=old.health;game.active=type;const label=type==='niko'?'Niko':'Konata',icon=type==='niko'?'N':'K';document.querySelector('#player-name').textContent=label;document.querySelector('#avatar-icon').textContent=icon;document.querySelector('#status-portrait').textContent=icon;document.querySelectorAll('.character-pick').forEach(e=>e.classList.toggle('active',e.dataset.character===type));toast(`Now playing as ${label}`);tone(type==='niko'?540:660,.12,'sine')}
function setAccent(color){game.accent=color;game.player.materials.shirt.color.set(color);document.querySelector('#custom-color').value=color}
function setHair(color){game.hair=color;game.player.materials.hair.color.set(color)}

const raycaster=new THREE.Raycaster();const clock=new THREE.Clock();let lastShot=0,goalIndex=0,lookDrag=null;
const goals=['Make the block yours','Give the neighbors a wave','Try the pop blaster','Build something silly'];
function cameraAim(){const direction=new THREE.Vector3();camera.getWorldDirection(direction);return direction}
function nearestProp(maxDistance=8){let result=null,best=maxDistance;for(const p of game.props){const d=p.root.position.distanceTo(game.player.root.position);if(d<best){best=d;result=p}}return result}
function shoot(){const now=performance.now();if(game.reload>0||now-lastShot<210)return;lastShot=now;if(game.ammo<=0){game.reload=1.1;toast('Reloading your foam darts…');tone(280,.14,'triangle');return}game.ammo--;tone(540,.07,'square',.025);const dir=cameraAim(),origin=camera.position.clone();raycaster.set(origin,dir);raycaster.far=38;const candidates=[];for(const p of game.props)candidates.push(p.root);for(const a of game.actors)if(a!==game.player)candidates.push(a.root);const hits=raycaster.intersectObjects(candidates,true);let hit=null;if(hits.length){let node=hits[0].object;while(node&&!node.userData.prop&&!node.userData.actor)node=node.parent;if(node?.userData.prop)hit={type:'prop',value:node.userData.prop,point:hits[0].point};else if(node?.userData.actor&&node.userData.actor!==game.player)hit={type:'actor',value:node.userData.actor,point:hits[0].point}}
 const start=origin.clone().addScaledVector(dir,1.1);const end=hit?hit.point:origin.clone().addScaledVector(dir,25);const dart=mesh(new THREE.SphereGeometry(.11,8,6),mat('#fff0ad'),scene,start.toArray());game.effects.push({mesh:dart,life:.13,velocity:new THREE.Vector3(),end});if(hit){burst(hit.point,'#f2a4a0',7,1.5);if(hit.type==='prop'){const p=hit.value;p.velocity.addScaledVector(dir,5);damageProp(p)}else{hit.value.panic=2.5;hit.value.goal.copy(hit.value.root.position.clone().addScaledVector(dir,2));tone(370,.11,'sine');toast('Friendly foam dart!') }}else burst(end,'#ffecb1',4,1);}
function useTool(){if(game.tool==='blaster'){shoot();return}if(game.grabbed){const p=game.grabbed;p.held=false;p.velocity.copy(cameraAim().multiplyScalar(9));p.velocity.y+=2;game.grabbed=null;toast('Toss!');tone(330,.12,'triangle');return}const p=nearestProp(10);if(p){game.grabbed=p;p.held=true;toast('Picked up — tap again to toss');tone(480,.08,'sine')}else toast('No props close enough to grab')}
function wave(){let target=null,best=5;for(const a of game.actors){if(a===game.player)continue;const d=a.root.position.distanceTo(game.player.root.position);if(d<best){best=d;target=a}}if(target){target.action=1.4;target.expression=1;target.root.rotation.y=Math.atan2(game.player.root.position.x-target.root.position.x,game.player.root.position.z-target.root.position.z);toast(`${target.type==='niko'?'Niko':'Konata'} waves back!`);tone(740,.12,'sine')}else toast('No neighbor close enough — wander over and say hi!')}
function spawnNeighbor(){const type=Math.random()>.5?'niko':'konata';const a=makeCharacter(type);a.root.position.copy(game.player.root.position).add(new THREE.Vector3((Math.random()-.5)*5,0,(Math.random()-.5)*5));a.goal.set((Math.random()-.5)*15,0,(Math.random()-.5)*12);toast(`${type==='niko'?'Niko':'Konata'} joined the block!`);updateCounts()}
function clearProps(){for(const p of game.props)scene.remove(p.root);game.props=[];for(const e of game.effects)scene.remove(e.mesh);game.effects=[];game.grabbed=null;updateCounts();toast('The block is tidy again')}
function setTool(tool){game.tool=tool;document.querySelectorAll('.tool-option').forEach(e=>e.classList.toggle('selected',e.dataset.tool===tool));document.querySelector('#crosshair').style.display=tool==='blaster'?'block':'none';toast(tool==='blaster'?'Pop blaster ready':'Gravity glove ready')}
function setTab(tab){document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e.dataset.tab===tab));document.querySelectorAll('.tab-content').forEach(e=>e.classList.toggle('hidden',e.id!==`tab-${tab}`))}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))}
function onKey(e,down){game.keys[e.code]=down;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!down||e.repeat)return;switch(e.code){case 'Digit1':setTool('blaster');break;case 'Digit2':setTool('grab');break;case 'KeyE':wave();break;case 'KeyF':shoot();break;case 'KeyQ':switchCharacter(game.active==='konata'?'niko':'konata');break;case 'KeyR':game.reload=1.1;toast('Reloading…');break;case 'Space':if(game.onGround){game.velocityY=6.5;game.onGround=false;tone(250,.06,'sine')}break;case 'Escape':document.exitPointerLock?.();break}}
window.addEventListener('keydown',e=>onKey(e,true));window.addEventListener('keyup',e=>onKey(e,false));window.addEventListener('blur',()=>game.keys={});
canvas.addEventListener('click',()=>{if(document.pointerLockElement!==canvas&&innerWidth>700)canvas.requestPointerLock?.();if(game.tool==='blaster')shoot()});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){game.cameraYaw-=e.movementX*.0025;game.cameraPitch=THREE.MathUtils.clamp(game.cameraPitch+e.movementY*.0018,-.25,.78)}else if(lookDrag){game.cameraYaw-=e.movementX*.004;game.cameraPitch=THREE.MathUtils.clamp(game.cameraPitch+e.movementY*.003,-.2,.72)}});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||innerWidth<=700){lookDrag=true;canvas.setPointerCapture?.(e.pointerId);canvas.dataset.lastX=e.clientX;canvas.dataset.lastY=e.clientY}});canvas.addEventListener('pointermove',e=>{if(lookDrag){const dx=e.clientX-Number(canvas.dataset.lastX||e.clientX),dy=e.clientY-Number(canvas.dataset.lastY||e.clientY);const sensitivity=Number(document.querySelector('#sensitivity').value)/5;game.cameraYaw-=dx*.006*sensitivity;game.cameraPitch=THREE.MathUtils.clamp(game.cameraPitch+dy*.004*sensitivity,-.2,.72);canvas.dataset.lastX=e.clientX;canvas.dataset.lastY=e.clientY}});canvas.addEventListener('pointerup',()=>lookDrag=false);
document.querySelectorAll('[data-spawn]').forEach(button=>button.addEventListener('click',()=>spawnProp(button.dataset.spawn,spawnPosition())));
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.tab)));
document.querySelectorAll('.tool-option').forEach(button=>button.addEventListener('click',()=>setTool(button.dataset.tool)));
document.querySelectorAll('.character-pick').forEach(button=>button.addEventListener('click',()=>switchCharacter(button.dataset.character)));
document.querySelectorAll('.swatch[data-color]').forEach(button=>button.addEventListener('click',()=>{setAccent(button.dataset.color);document.querySelectorAll('.swatch[data-color]').forEach(b=>b.classList.toggle('selected',b===button))}));
document.querySelectorAll('.swatch[data-hair]').forEach(button=>button.addEventListener('click',()=>{setHair(button.dataset.hair);document.querySelectorAll('.swatch[data-hair]').forEach(b=>b.classList.toggle('selected',b===button))}));
document.querySelector('#custom-color').addEventListener('input',e=>setAccent(e.target.value));
function switchButton(){switchCharacter(game.active==='konata'?'niko':'konata')}document.querySelector('#character-switch').addEventListener('click',switchButton);document.querySelector('#switch-small').addEventListener('click',switchButton);document.querySelector('#style-switch').addEventListener('click',switchButton);
document.querySelector('#clear-world').addEventListener('click',clearProps);document.querySelector('#spawn-neighbor').addEventListener('click',spawnNeighbor);
document.querySelector('#settings-btn').addEventListener('click',()=>document.querySelector('#settings-modal').classList.remove('hidden'));document.querySelector('#settings-close').addEventListener('click',()=>document.querySelector('#settings-modal').classList.add('hidden'));document.querySelector('#settings-done').addEventListener('click',()=>document.querySelector('#settings-modal').classList.add('hidden'));
document.querySelector('#sound-toggle').addEventListener('click',e=>{game.muted=!game.muted;e.currentTarget.textContent=game.muted?'♪':'♫';toast(game.muted?'Sound off':'Sound on')});document.querySelector('#ambience-toggle').addEventListener('change',e=>{game.muted=!e.target.checked;document.querySelector('#sound-toggle').textContent=game.muted?'♪':'♫'});
document.querySelector('#goal-next').addEventListener('click',()=>{goalIndex=(goalIndex+1)%goals.length;document.querySelector('#goal-text').textContent=goals[goalIndex]});
document.querySelector('#mobile-jump').addEventListener('pointerdown',e=>{e.preventDefault();game.velocityY=6.5;game.onGround=false});document.querySelector('#mobile-use').addEventListener('pointerdown',e=>{e.preventDefault();useTool()});
const joy=document.querySelector('#joystick');let joyPointer=null;joy.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);updateJoy(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updateJoy(e)});joy.addEventListener('pointerup',()=>{joyPointer=null;game.joyX=0;game.joyY=0;joy.querySelector('span').style.transform='translate(0,0)'});function updateJoy(e){const r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),limit=31,len=Math.hypot(dx,dy)||1,m=Math.min(limit/len,1);game.joyX=dx/limit*m;game.joyY=dy/limit*m;joy.querySelector('span').style.transform=`translate(${game.joyX*25}px,${game.joyY*25}px)`}
const mobileToggle=document.querySelector('#mobile-toggle');if(innerWidth<=700){mobileToggle.checked=true;document.querySelector('.mobile-controls').style.display='flex'}mobileToggle.addEventListener('change',e=>document.querySelector('.mobile-controls').style.display=e.target.checked?'flex':'none');

// Simulation and third-person camera
const cameraOffset=new THREE.Vector3();
function animateActor(actor,dt,moving,time){
 actor.phase+=dt*(moving?9:2.2);const swing=moving?Math.sin(actor.phase)*.58:Math.sin(time*1.5+actor.phase)*.035;
 for(const limb of actor.limbs){limb.pivot.rotation.x=limb.kind==='leg'?swing*limb.side:-swing*limb.side*.72;if(limb.kind==='arm'&&actor.action>0&&limb.side===1)limb.pivot.rotation.x=-1.9+Math.sin(time*12)*.18}
 actor.rig.position.y=actor.player&& !game.onGround?Math.sin(Math.min(1,Math.max(0,actor.root.position.y)) * Math.PI)*.08:Math.abs(swing)*.035;
 actor.rig.rotation.z=moving?Math.sin(actor.phase)*.035:0;
 if(actor.action>0)actor.action=Math.max(0,actor.action-dt);
}
function updatePlayer(dt,time){
 const keys=game.keys,forwardInput=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-game.joyY,rightInput=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+game.joyX;
 const input=new THREE.Vector3(rightInput,0,forwardInput);if(input.lengthSq()>1)input.normalize();const running=keys.ShiftLeft||keys.ShiftRight;const speed=running?7.2:4.5;
 const f=forward(),right=new THREE.Vector3(-f.z,0,f.x),desired=right.multiplyScalar(input.x).addScaledVector(f,input.z);if(desired.lengthSq()>.001){desired.normalize();game.player.root.rotation.y=Math.atan2(desired.x,desired.z)}
 const blend=1-Math.exp(-dt*12);game.player.root.position.x+=desired.x*speed*dt;game.player.root.position.z+=desired.z*speed*dt;game.moveSpeed+=(input.length()*speed-game.moveSpeed)*blend;
 game.player.root.position.x=THREE.MathUtils.clamp(game.player.root.position.x,-25,25);game.player.root.position.z=THREE.MathUtils.clamp(game.player.root.position.z,-20,12);
 if(!game.onGround){game.velocityY-=17*dt;game.player.root.position.y+=game.velocityY*dt;if(game.player.root.position.y<=0){game.player.root.position.y=0;game.velocityY=0;game.onGround=true}}
 animateActor(game.player,dt,desired.lengthSq()>.01,time);
}
function updateActors(dt,time){
 for(const a of game.actors){if(a===game.player)continue;a.panic=Math.max(0,a.panic-dt);const distance=a.root.position.distanceTo(game.player.root.position);
  if(distance>24){a.goal.set((Math.random()-.5)*18,0,(Math.random()-.5)*12);a.panic=0}
  if(a.panic<=0&&a.root.position.distanceTo(a.goal)<1.1){a.goal.set(THREE.MathUtils.clamp((Math.random()-.5)*25,-12,12),0,THREE.MathUtils.clamp((Math.random()-.5)*18,-8,8));a.action=Math.random()>.8?.65:0}
  const delta=a.goal.clone().sub(a.root.position);delta.y=0;let moving=delta.length()>1.1;if(moving){delta.normalize();const pace=a.panic>0?3.4:a.speed;a.root.position.addScaledVector(delta,pace*dt);a.root.rotation.y=Math.atan2(delta.x,delta.z)}
  if(distance<1.1){a.root.position.x+=Math.sign(a.root.position.x-game.player.root.position.x||1)*dt*.6;a.root.position.z+=Math.sign(a.root.position.z-game.player.root.position.z||1)*dt*.6}
  animateActor(a,dt,moving,time);
 }
}
function updateProps(dt){
 for(const p of game.props){if(p===game.grabbed&&p.held){const target=game.player.root.position.clone().addScaledVector(cameraAim(),2.3);target.y+=1.35;p.root.position.lerp(target,1-Math.exp(-dt*10));p.velocity.set(0,0,0);continue}
  p.velocity.y-=14*dt;p.root.position.addScaledVector(p.velocity,dt);p.root.rotation.x+=p.spin.x*dt;p.root.rotation.y+=p.spin.y*dt;p.root.rotation.z+=p.spin.z*dt;
  if(p.root.position.y<0){const impact=Math.abs(p.velocity.y);p.root.position.y=0;const bounce=p.main.userData.bouncy?.72:.22;p.velocity.y=impact>1.3?impact*bounce:0;if(impact>3.5&&p.health>0&&p.kind==='wall')damageProp(p);p.velocity.x*=p.main.userData.bouncy?.91:.78;p.velocity.z*=p.main.userData.bouncy?.91:.78;p.spin.multiplyScalar(.82);if(Math.abs(p.velocity.y)<.35)p.velocity.y=0}
  p.root.position.x=THREE.MathUtils.clamp(p.root.position.x,-28,28);p.root.position.z=THREE.MathUtils.clamp(p.root.position.z,-22,14);
  if(p.root.position.distanceTo(game.player.root.position)<.85&&p.root.position.y<1.3){const away=p.root.position.clone().sub(game.player.root.position);away.y=0;if(away.lengthSq()<.01)away.set(1,0,0);p.velocity.addScaledVector(away.normalize(),dt*2)}
 }
}
function updateEffects(dt){for(let i=game.effects.length-1;i>=0;i--){const e=game.effects[i];if(e.end){e.mesh.position.lerp(e.end,Math.min(1,dt*38))}else{e.velocity.y-=7*dt;e.mesh.position.addScaledVector(e.velocity,dt)}e.life-=dt;e.mesh.scale.multiplyScalar(e.end?Math.max(.01,1-dt*7):1);if(e.life<=0){scene.remove(e.mesh);game.effects.splice(i,1)}}}
function updateCamera(dt){const p=game.player.root.position;const pitch=game.cameraPitch;cameraOffset.set(Math.sin(game.cameraYaw)*6.8,2.1+pitch*4,Math.cos(game.cameraYaw)*6.8);const distance=6.8;const groundY=2.1+pitch*4,vertical=THREE.MathUtils.clamp(groundY,1.5,distance-1),horizontal=Math.sqrt(distance*distance-vertical*vertical);cameraOffset.set(Math.sin(game.cameraYaw)*horizontal,vertical,Math.cos(game.cameraYaw)*horizontal);const desired=new THREE.Vector3(p.x+cameraOffset.x,p.y+cameraOffset.y,p.z+cameraOffset.z);camera.position.lerp(desired,1-Math.exp(-dt*7));camera.lookAt(p.x,p.y+1.45,p.z);const direction=new THREE.Vector3();camera.getWorldDirection(direction);game.aimPoint.copy(camera.position).addScaledVector(direction,18);game.player.root.rotation.y=Math.atan2(game.aimPoint.x-p.x,game.aimPoint.z-p.z)}
function updateHud(){const pct=Math.max(0,Math.min(100,game.player.health));document.querySelector('.energy-bar i').style.width=`${pct}%`;const mp=document.querySelector('.map-player');const pos=game.player.root.position;mp.style.left=`${THREE.MathUtils.mapLinear(pos.x,-25,25,12,88)}%`;mp.style.top=`${THREE.MathUtils.mapLinear(pos.z,-18,12,12,78)}%`;const neighbors=[...game.actors].filter(a=>a!==game.player);document.querySelectorAll('.map-npc').forEach((el,i)=>{const a=neighbors[i];if(a){el.style.display='block';el.style.left=`${THREE.MathUtils.mapLinear(a.root.position.x,-25,25,12,88)}%`;el.style.top=`${THREE.MathUtils.mapLinear(a.root.position.z,-18,12,12,78)}%`}else el.style.display='none'});}
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;if(game.reload>0){game.reload=Math.max(0,game.reload-dt);if(game.reload===0)game.ammo=game.maxAmmo}updatePlayer(dt,time);updateActors(dt,time);updateProps(dt);updateEffects(dt);updateCamera(dt);updateHud();renderer.render(scene,camera)}
window.addEventListener('resize',resize);updateCounts();
// A few starter toys make the block immediately playable without crowding the plaza.
spawnProp('crate',new THREE.Vector3(-2,0,2),false);spawnProp('ball',new THREE.Vector3(2,0,1),false);spawnProp('barrel',new THREE.Vector3(4,0,-1),false);spawnProp('cone',new THREE.Vector3(-4,0,0),false);spawnProp('wall',new THREE.Vector3(6,0,4),false);spawnProp('bench',new THREE.Vector3(-8,0,4),false);updateCounts();frame();

