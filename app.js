(function(){
"use strict";
var KEY="flip2-v1",ST=["En inventario","En taller","Listo para venta","Vendido"],OR=["Subasta EE. UU.","Dealer","Particular","Trade-in"];
var CATS=["Mecánica","Chapa y pintura","Repuestos","Detailing","Papeles y traspaso","Grúa y transporte","Otros"],DOCS=["Matrícula","Título","Bill of Sale","Otro"],TR=["Automática","Manual"],CB=["Gasolina","Diésel","Híbrido","Eléctrico","GLP"];
var db={cfg:{nombre:"Mi negocio",rate:60,m:{fin:false,comp:false},o:{roi:true,mar:true,dia:true,sub:true}},v:[]};
try{var s0=JSON.parse(localStorage.getItem(KEY));if(s0&&s0.v)db=s0}catch(e){}
var view="inicio",tab=0,cur=null,kind="f",F={q:"",e:"",m:"",a:"",o:"",s:"rec"};
var $=function(i){return document.getElementById(i)},nf=new Intl.NumberFormat("es",{maximumFractionDigits:0}),today=function(){return new Date().toISOString().slice(0,10)};
function R(n){return (n<0?"−":"")+"RD$"+nf.format(Math.abs(Math.round(n||0)))}
function U(n){return "US$"+nf.format(n||0)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){alert("No hay espacio en el navegador. Elimina fotos o exporta un respaldo.");return false}}
function num(i){var n=parseFloat(String($(i).value).replace(",","."));return isNaN(n)?0:n}
function find(id){return db.v.filter(function(v){return v.id===id})[0]}
var M=function(k){return db.cfg.m[k]},O=function(k){return db.cfg.m.fin&&db.cfg.o[k]};
function nm(v){return (v.marca+" "+v.modelo).trim()}
function gd(g){return g.mon==="USD"?g.m*g.t:g.m}
function cpra(v){return (v.precio+(v.fees||0))*(v.mon==="USD"?v.tasa:1)}
function gts(v){return v.gastos.reduce(function(a,g){return a+gd(g)},0)}
function costo(v){return cpra(v)+gts(v)}
function dias(v){var e=v.venta?new Date(v.venta.f):new Date();return Math.max(0,Math.round((e-new Date(v.fecha))/864e5))}
function pct(a,b){return b?(a/b*100).toFixed(1).replace(/\.0$/,"")+"%":"—"}
function mg(v){return v.venta?v.venta.p-costo(v):(v.obj?v.obj-costo(v):null)}
function sg(n){return n<0?"loss":"gain"}
function opts(a,s){return a.map(function(o,i){return '<option value="'+i+'"'+(i===s?" selected":"")+'>'+esc(o)+'</option>'}).join("")}
function sel(id,all,arr,c){return '<select id="'+id+'"><option value="">'+all+'</option>'+arr.map(function(x){return '<option value="'+esc(x[0])+'"'+(String(c)===String(x[0])?" selected":"")+'>'+esc(x[1])+'</option>'}).join("")+'</select>'}
function thumb(v){return '<div class="th">'+(v.fotos[0]?'<img src="'+v.fotos[0]+'" alt="">':"Sin foto")+'</div>'}
function money(m,mon,t){return mon==="USD"?U(m)+' <span class="sub">× '+t+'</span>':R(m)}
function kv(l,v){return v?'<div><div class="lbl">'+l+'</div><b>'+esc(v)+'</b></div>':""}

function render(){
  $("brand").textContent=db.cfg.nombre;
  [].forEach.call(document.querySelectorAll("nav button"),function(b){b.className=b.dataset.go===view||(view==="ficha"&&b.dataset.go==="inventario")?"on":""});
  $("main").innerHTML=({inicio:inicio,inventario:inventario,ficha:ficha,config:config})[view]();
}
function go(x,id){if(x==="nuevo"){form();return}view=x;if(id)cur=id;tab=0;render();window.scrollTo(0,0)}

function row(v){
  var m=mg(v);
  return '<button class="vr" data-a="open" data-id="'+v.id+'">'+thumb(v)+'<div class="m"><b>'+esc(nm(v))+' '+esc(v.anio)+'</b><span class="sub">'+esc([v.color,v.chasis&&"Chasis "+v.chasis].filter(Boolean).join(" · "))+'</span><span class="sub mb"> '+ST[v.estado]+'</span></div>'+
  '<div class="dk st">'+ST[v.estado]+'</div><div class="num" style="text-align:right">'+R(costo(v))+'</div>'+
  (O("dia")?'<div class="dk num">'+dias(v)+' d</div>':"")+(O("mar")?'<div class="dk num '+(m==null?"":sg(m))+'">'+(m==null?"—":R(m))+'</div>':"")+'</button>';
}
function inicio(){
  var a=db.v.filter(function(v){return !v.venta}),s=db.v.filter(function(v){return v.venta}),g=s.reduce(function(t,v){return t+v.venta.p-costo(v)},0);
  var st=function(l,v,c){return '<div class="stat"><span class="lbl">'+l+'</span><b class="'+(c||"")+'">'+v+'</b></div>'};
  var tile=function(k,t,d){return '<button class="tile" data-go="'+k+'"><b>'+t+'</b><span class="sub">'+d+'</span></button>'};
  return '<p class="eyebrow">'+new Date().toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"})+'</p><h1>'+esc(db.cfg.nombre)+'</h1>'+
  '<div class="stats">'+st("En inventario",a.length)+st("Capital invertido",R(a.reduce(function(t,v){return t+costo(v)},0)))+(M("fin")?st("Ganancia realizada",R(g),sg(g)):st("Vendidos",s.length))+'</div>'+
  '<div class="sec">Módulos</div><div class="tiles">'+tile("inventario","Inventario","Busca, filtra y abre la ficha de cada vehículo")+tile("nuevo","Nuevo vehículo","Registrar una compra")+tile("config","Configuración","Módulos, tasa de cambio y respaldo")+'</div>'+
  (db.v.length?'<div class="sec">Agregados recientemente</div><div class="list">'+db.v.slice(0,4).map(row).join("")+'</div>':"");
}
function lista(){
  var L=db.v.filter(function(v){
    var t=(nm(v)+" "+v.chasis+" "+v.placa+" "+v.anio+" "+v.color).toLowerCase();
    return (!F.q||t.indexOf(F.q.toLowerCase())>-1)&&(F.e===""||v.estado===+F.e)&&(F.m===""||v.marca===F.m)&&(F.a===""||v.anio===F.a)&&(F.o===""||v.origen===+F.o);
  });
  if(F.s==="ant")L.sort(function(a,b){return dias(b)-dias(a)});
  if(F.s==="may")L.sort(function(a,b){return costo(b)-costo(a)});
  if(F.s==="men")L.sort(function(a,b){return costo(a)-costo(b)});
  if(!L.length)return '<div class="empty">'+(db.v.length?"Ningún vehículo coincide con la búsqueda.":"Aún no hay vehículos. Registra el primero.")+'</div>';
  return '<div class="vr hd"><div style="width:52px"></div><div class="m">Vehículo</div><div class="dk">Estado</div><div style="text-align:right">Costo</div>'+(O("dia")?'<div class="dk">Días</div>':"")+(O("mar")?'<div class="dk">Margen</div>':"")+'</div>'+L.map(row).join("")+'<div class="vr hd" style="border-top:1px solid var(--line)">'+L.length+' de '+db.v.length+' vehículos</div>';
}
function uniq(k){var o={};db.v.forEach(function(v){if(v[k])o[v[k]]=1});return Object.keys(o).sort()}
function inventario(){
  var mk=uniq("marca").map(function(x){return [x,x]}),ys=uniq("anio").reverse().map(function(x){return [x,x]});
  var ch=[["e",F.e!==""&&ST[F.e]],["m",F.m],["a",F.a],["o",F.o!==""&&OR[F.o]]].filter(function(x){return x[1]});
  return '<div class="bar"><div><p class="eyebrow">Gestión</p><h1>Inventario</h1></div><button class="btn pri" data-go="nuevo">+ Nuevo vehículo</button></div>'+
  '<input id="q" class="search" placeholder="Buscar por marca, modelo, chasis, placa o año" value="'+esc(F.q)+'"><div class="fl">'+
  sel("fe","Todos los estados",ST.map(function(s,i){return [i,s]}),F.e)+sel("fm","Todas las marcas",mk,F.m)+sel("fa","Todos los años",ys,F.a)+(M("comp")?sel("fo","Todos los orígenes",OR.map(function(s,i){return [i,s]}),F.o):"")+
  sel("fs","",[["ant","Más tiempo en patio"],["may","Mayor costo"],["men","Menor costo"]],F.s==="rec"?"":F.s).replace('<option value="">','<option value="rec">Más recientes')+'</div>'+
  (ch.length?'<div class="chips">'+ch.map(function(c){return '<button class="chip" data-a="clr" data-k="'+c[0]+'">'+esc(c[1])+' ✕</button>'}).join("")+'</div>':"")+'<div class="list" id="lst">'+lista()+'</div>';
}

function ficha(){
  var v=find(cur);if(!v){view="inventario";return inventario()}
  var c=costo(v),m=mg(v),T=["Resumen","Gastos","Fotos","Documentos"],h=
  '<button class="back" data-go="inventario">← Inventario</button><div class="bar"><div><p class="eyebrow">'+esc([v.anio,v.color].filter(Boolean).join(" · "))+'</p><h1>'+esc(nm(v))+'</h1></div><div style="width:170px"><select id="d_e">'+opts(ST,v.estado)+'</select></div></div>'+
  '<div class="tabs">'+T.map(function(t,i){return '<button data-a="tab" data-i="'+i+'"'+(i===tab?' class="on"':"")+'>'+t+'</button>'}).join("")+'</div>';
  if(tab===0){
    h+='<div class="card"><div class="kv">'+kv("Chasis",v.chasis)+kv("Placa",v.placa)+kv("Kilometraje",v.km&&nf.format(v.km)+" km")+kv("Transmisión",v.trans)+kv("Combustible",v.comb)+kv("Fecha de entrada",v.fecha)+(M("comp")?kv("Origen",OR[v.origen])+kv("Lote",v.lote):"")+'</div>'+(v.notas?'<p class="sub" style="margin-bottom:0">'+esc(v.notas)+'</p>':"")+'</div>'+
    '<div class="card"><h2>Costos</h2><div class="ln"><span>Compra<div class="sub">'+(v.mon==="USD"?U(v.precio+(v.fees||0))+" × "+v.tasa:"En pesos")+'</div></span><span class="num">'+R(cpra(v))+'</span></div><div class="ln"><span>Gastos<div class="sub">'+v.gastos.length+' registrados</div></span><span class="num">'+R(gts(v))+'</span></div><div class="ln"><b>Costo total</b><b class="num">'+R(c)+'</b></div>'+
    (v.venta?'<div class="ln"><span>Vendido el '+esc(v.venta.f)+'</span><span class="num">'+R(v.venta.p)+'</span></div>':"")+
    (O("mar")?'<div class="ln"><span>'+(v.venta?"Ganancia neta":"Margen proyectado"+(v.obj?" (objetivo "+R(v.obj)+")":""))+'</span><b class="num '+(m==null?"":sg(m))+'">'+(m==null?"—":R(m))+'</b></div>':"")+(O("roi")?'<div class="ln"><span>ROI</span><span class="num">'+(m==null?"—":pct(m,c))+'</span></div>':"")+(O("dia")?'<div class="ln"><span>Días en inventario</span><span class="num">'+dias(v)+'</span></div>':"")+'</div>'+
    '<div class="acts"><button class="btn" data-a="edit">Editar datos</button><button class="btn del" data-a="del">Eliminar</button></div>';
  }else if(tab===1){
    h+='<div class="card"><h2>Gastos del vehículo</h2>'+(v.gastos.length?v.gastos.map(function(g,i){return '<div class="ln"><span>'+esc(g.k)+(g.p?" · "+esc(g.p):"")+'<div class="sub">'+esc(g.d)+(g.d?" · ":"")+esc(g.f)+'</div></span><span><span class="num">'+R(gd(g))+'</span>'+(g.mon==="USD"?'<div class="sub" style="text-align:right">'+money(g.m,"USD",g.t)+'</div>':"")+'</span><button class="x" data-a="delg" data-i="'+i+'">✕</button></div>'}).join("")+'<div class="ln"><b>Total gastos</b><b class="num">'+R(gts(v))+'</b></div>':'<p class="sub">Todavía no hay gastos registrados.</p>')+'</div>'+
    '<div class="card"><h2>Agregar gasto</h2><div class="g2"><div><label>Categoría</label><select id="g_k">'+opts(CATS,0)+'</select></div><div><label>Proveedor o taller</label><input id="g_p"></div><div><label>Moneda</label><select id="g_o"><option>DOP</option><option>USD</option></select></div><div><label>Monto</label><input id="g_m" inputmode="decimal"></div><div><label>Detalle</label><input id="g_d"></div><div><label>Fecha</label><input id="g_f" type="date" value="'+today()+'"></div></div><div class="acts"><button class="btn pri" data-a="addg">Agregar gasto</button></div></div>';
  }else if(tab===2){
    h+='<div class="gal">'+v.fotos.map(function(f,i){return '<div><img src="'+f+'" alt="Foto '+(i+1)+'"><button class="x" data-a="delf" data-i="'+i+'">✕</button></div>'}).join("")+'</div>'+(v.fotos.length?"":'<p class="sub">Sin fotos todavía.</p>')+'<button class="btn" data-a="photo">+ Agregar fotos</button>';
  }else{
    h+='<div class="gal">'+v.docs.map(function(d,i){return '<div><img src="'+d.img+'" alt="'+esc(d.t)+'"><i>'+esc(d.t)+'</i><button class="x" data-a="deld" data-i="'+i+'">✕</button></div>'}).join("")+'</div>'+(v.docs.length?"":'<p class="sub">Sin documentos todavía.</p>')+'<div class="g2"><select id="d_t">'+opts(DOCS,0)+'</select><button class="btn" data-a="doc">+ Agregar documento</button></div>';
  }
  return h;
}

function config(){
  var c=db.cfg,sw=function(k,on){return '<label class="sw"><input type="checkbox" data-c="'+k+'"'+(on?" checked":"")+'><i></i></label>'};
  var mod=function(k,t,d,sub){return '<div class="mod"><div class="row"><div><b>'+t+'</b><div class="sub">'+d+'</div></div>'+sw("m."+k,c.m[k])+'</div>'+(c.m[k]&&sub?sub:"")+'</div>'};
  var op=function(k,t){return '<div class="opt"><span>'+t+'</span>'+sw("o."+k,c.o[k])+'</div>'};
  return '<p class="eyebrow">Sistema</p><h1>Configuración</h1><div class="sec">Negocio</div><div class="card"><label style="margin-top:0">Nombre</label><input id="c_n" value="'+esc(c.nombre)+'"></div>'+
  '<div class="sec">Tasa de cambio</div><div class="card"><label style="margin-top:0">1 US$ equivale a (RD$)</label><input id="c_r" inputmode="decimal" value="'+c.rate+'"><p class="sub" style="margin:8px 0 0">Se usa al registrar compras y gastos en dólares. Cada registro guarda la tasa de ese momento, así que cambiarla aquí no altera los costos anteriores.</p></div>'+
  '<div class="sec">Módulos</div><div class="card" style="padding-top:4px;padding-bottom:4px">'+
  mod("fin","Finanzas","Margen, ROI y días en inventario en la lista y en la ficha",op("mar","Margen")+op("roi","ROI")+op("dia","Días en inventario"))+
  mod("comp","Compras","Origen de la compra (subasta, dealer, particular, trade-in)",op("sub","Fees y datos de subasta"))+
  ["Importación y logística","Ventas y clientes","Reportes y panel","Tablero por estados","Usuarios y roles"].map(function(t){return '<div class="soon"><span>'+t+'</span><span class="sub">Próximamente</span></div>'}).join("")+'</div>'+
  '<div class="sec">Respaldo</div><div class="card"><p class="sub" style="margin-top:0">Los datos viven en este navegador. Exporta un respaldo con frecuencia.</p><div class="acts" style="margin-top:0"><button class="btn" data-a="exp">Exportar respaldo</button><button class="btn" data-a="imp">Importar respaldo</button></div></div>';
}

function open(h){$("sheet").innerHTML=h;$("ov").hidden=false}
function close(){$("ov").hidden=true;render()}
function form(v){
  var e=!!v;v=v||{origen:0,mon:"USD",tasa:db.cfg.rate,fecha:today()};
  var i=function(id,l,val,x){return '<div><label>'+l+'</label><input id="'+id+'" value="'+esc(val)+'" '+(x||"")+'></div>'};
  open('<h2>'+(e?"Editar":"Nuevo")+' vehículo</h2><div class="g2">'+i("f_a","Marca",v.marca)+i("f_b","Modelo",v.modelo)+i("f_y","Año",v.anio,'inputmode="numeric"')+i("f_c","Color",v.color)+i("f_s","Chasis",v.chasis)+i("f_p","Placa",v.placa)+i("f_k","Kilometraje",v.km,'inputmode="numeric"')+
  '<div><label>Transmisión</label><select id="f_t"><option value="">—</option>'+TR.map(function(x){return '<option'+(v.trans===x?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div><div><label>Combustible</label><select id="f_u"><option value="">—</option>'+CB.map(function(x){return '<option'+(v.comb===x?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div>'+i("f_d","Fecha de entrada",v.fecha,'type="date"')+
  '<div><label>Moneda de compra</label><select id="f_o"><option'+(v.mon==="USD"?" selected":"")+'>USD</option><option'+(v.mon==="DOP"?" selected":"")+'>DOP</option></select></div>'+i("f_r","Tasa de cambio",v.tasa,'inputmode="decimal"')+i("f_m","Precio de compra",v.precio||"",'inputmode="decimal"')+(M("comp")&&db.cfg.o.sub?i("f_f","Fees de subasta",v.fees||"",'inputmode="decimal"'):"")+i("f_g","Precio de venta objetivo (RD$)",v.obj||"",'inputmode="decimal"')+
  (M("comp")?'<div><label>Origen</label><select id="f_i">'+opts(OR,v.origen)+'</select></div>'+i("f_l","Lote o referencia",v.lote):"")+'</div><label>Notas</label><textarea id="f_x" rows="2">'+esc(v.notas)+'</textarea><div class="acts"><button class="btn" data-a="close">Cancelar</button><button class="btn pri" data-a="save" data-e="'+(e?1:"")+'">Guardar</button></div>');
}
function move(v,to){
  if(to===3&&!v.venta){var p=parseFloat(String(prompt("Precio de venta en RD$:",v.obj||"")||"").replace(/,/g,""));if(!p)return;v.venta={p:p,f:today()}}
  if(to!==3)v.venta=null;v.estado=to;save();
}
function shrink(f,max,q,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",q))};im.src=r.result};r.readAsDataURL(f)}
$("file").onchange=function(){
  var v=find(cur),fs=[].slice.call(this.files),n=fs.length,t=kind==="d"?DOCS[+$("d_t").value]:"";this.value="";if(!v)return;
  fs.forEach(function(f){shrink(f,kind==="d"?1100:720,kind==="d"?.7:.65,function(d){if(kind==="d")v.docs.push({t:t,img:d});else v.fotos.push(d);
    if(--n===0){if(!save()){if(kind==="d")v.docs.pop();else v.fotos.pop()}render()}})});
};
$("imp").onchange=function(){var f=this.files[0];this.value="";if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d.v)throw 0;if(confirm("Esto reemplaza los datos actuales. ¿Continuar?")){db=d;save();render()}}catch(e){alert("Archivo de respaldo no válido.")}};r.readAsText(f)};

document.addEventListener("input",function(e){if(e.target.id==="q"){F.q=e.target.value;$("lst").innerHTML=lista()}});
document.addEventListener("change",function(e){
  var t=e.target,i=t.id,k={fe:"e",fm:"m",fa:"a",fo:"o",fs:"s"}[i];
  if(k){F[k]=t.value;render();return}
  if(i==="d_e"){move(find(cur),+t.value);render()}
  else if(i==="c_n"){db.cfg.nombre=t.value.trim()||"Mi negocio";save();render()}
  else if(i==="c_r"){var n=parseFloat(t.value.replace(",","."));if(n>0){db.cfg.rate=n;save()}render()}
  else if(t.dataset.c){var p=t.dataset.c.split(".");db.cfg[p[0]][p[1]]=t.checked;save();render()}
});
document.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]");if(g){go(g.dataset.go);return}
  if(e.target===$("ov")){close();return}
  var b=e.target.closest("[data-a]");if(!b)return;
  var a=b.dataset.a,v=find(cur),i=+b.dataset.i;
  if(a==="open")go("ficha",b.dataset.id);
  else if(a==="close")close();
  else if(a==="clr"){F[b.dataset.k]="";render()}
  else if(a==="tab"){tab=i;render()}
  else if(a==="edit")form(v);
  else if(a==="save"){var n=$("f_a").value.trim();if(!n){$("f_a").focus();return}
    var d={marca:n,modelo:$("f_b").value.trim(),anio:$("f_y").value.trim(),color:$("f_c").value.trim(),chasis:$("f_s").value.trim(),placa:$("f_p").value.trim(),km:num("f_k")||"",trans:$("f_t").value,comb:$("f_u").value,fecha:$("f_d").value||today(),mon:$("f_o").value,tasa:num("f_r")||db.cfg.rate,precio:num("f_m"),fees:$("f_f")?num("f_f"):0,obj:num("f_g"),origen:$("f_i")?+$("f_i").value:0,lote:$("f_l")?$("f_l").value.trim():"",notas:$("f_x").value.trim()};
    if(b.dataset.e){for(var k in d)v[k]=d[k]}else{d.id="v"+Date.now();d.estado=0;d.gastos=[];d.fotos=[];d.docs=[];d.venta=null;db.v.unshift(d);cur=d.id;view="ficha";tab=0}
    save();close()}
  else if(a==="addg"){var m=num("g_m");if(!m){$("g_m").focus();return}var o=$("g_o").value;v.gastos.unshift({k:CATS[+$("g_k").value],p:$("g_p").value.trim(),d:$("g_d").value.trim(),mon:o,m:m,t:o==="USD"?db.cfg.rate:1,f:$("g_f").value||today()});save();render()}
  else if(a==="delg"){v.gastos.splice(i,1);save();render()}
  else if(a==="photo"){kind="f";$("file").click()}
  else if(a==="doc"){kind="d";$("file").click()}
  else if(a==="delf"){v.fotos.splice(i,1);save();render()}
  else if(a==="deld"){v.docs.splice(i,1);save();render()}
  else if(a==="del"){if(confirm("¿Eliminar este vehículo y todos sus datos?")){db.v=db.v.filter(function(x){return x.id!==cur});save();go("inventario")}}
  else if(a==="exp"){var l=document.createElement("a");l.href=URL.createObjectURL(new Blob([JSON.stringify(db)],{type:"application/json"}));l.download="respaldo-"+today()+".json";l.click()}
  else if(a==="imp")$("imp").click();
});
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
render();
})();
