(function(){
"use strict";
var KEY="flipping-app-v1",ST=["Comprado","En tránsito","En aduana","En taller","Listo para venta","Vendido"];
var OR=["Subasta EE. UU.","Dealer","Particular","Trade-in"];
var CATS=["Grúa","Flete marítimo","Aranceles DGA","Placa y marbete","Mecánica","Chapa y pintura","Repuestos","Detailing","Papeles y traspaso","Otros"];
var DOCS=["Título (clean/salvage)","Bill of Sale","Matrícula","Otro"];
var db={rate:60,v:[]},tab=0,q="",fe="",fo="",cur=null,kind="f",rep="";
try{var r=localStorage.getItem(KEY);if(r)db=JSON.parse(r)}catch(e){}
var $=function(i){return document.getElementById(i)};
var nf=new Intl.NumberFormat("es",{maximumFractionDigits:0});
var today=function(){return new Date().toISOString().slice(0,10)};
function R(n){return (n<0?"−":"")+"RD$"+nf.format(Math.abs(Math.round(n||0)))}
function U(n){return "US$"+nf.format(n||0)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){alert("No hay espacio en el navegador. Elimina fotos o exporta un respaldo.");return false}}
function num(i){var n=parseFloat(String($(i).value).replace(",","."));return isNaN(n)?0:n}
function find(id){return db.v.filter(function(v){return v.id===id})[0]}
function gd(g){return g.mon==="USD"?g.m*g.t:g.m}
function comp(v){return (v.precio+v.fees)*(v.mon==="USD"?v.tasa:1)}
function gastos(v){return v.gastos.reduce(function(a,g){return a+gd(g)},0)}
function costo(v){return comp(v)+gastos(v)}
function dias(v){var e=v.venta?new Date(v.venta.f):new Date();return Math.max(0,Math.round((e-new Date(v.fecha))/864e5))}
function pct(a,b){return b?(a/b*100).toFixed(1).replace(/\.0$/,"")+"%":"—"}
function sg(n){return n<0?"loss":"gain"}
function mg(v){return v.venta?v.venta.p-costo(v):(v.obj?v.obj-costo(v):null)}
function opts(a,s){return a.map(function(o,i){return '<option value="'+i+'"'+(i===s?" selected":"")+'>'+esc(o)+'</option>'}).join("")}
function thumb(v){return '<div class="th">'+(v.fotos[0]?'<img src="'+v.fotos[0]+'" alt="">':"🚗")+'</div>'}

function render(){
  $("rate").value=db.rate;
  [].forEach.call(document.querySelectorAll(".tabs button"),function(b){b.className=+b.dataset.t===tab?"on":""});
  $("main").innerHTML=[panel,inv,board,report,backup][tab]();
}
function summary(){
  var a=db.v.filter(function(v){return !v.venta}),s=db.v.filter(function(v){return v.venta});
  var g=s.reduce(function(t,v){return t+v.venta.p-costo(v)},0);
  return '<div class="sum"><div class="box"><div class="lbl">Invertido en stock</div><div class="mid">'+R(a.reduce(function(t,v){return t+costo(v)},0))+'</div></div><div class="box"><div class="lbl">Ganancia realizada</div><div class="mid '+sg(g)+'">'+R(g)+'</div></div><div class="box"><div class="lbl">En stock</div><div class="mid">'+a.length+'</div></div></div>';
}

var MN=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
function sh(n){var a=Math.abs(n),s=a>=1e6?(a/1e6).toFixed(1).replace(/\.0$/,"")+"M":a>=1e3?Math.round(a/1e3)+"k":String(Math.round(a));return (n<0?"−":"")+s}
function chip(v){if(v.venta)return dias(v)+" días";var d=dias(v),c=d>=90?"b":d>=45?"w":"ok";return '<span class="chip c-'+c+'">'+d+' días</span>'}
function bars(L){
  var mx=Math.max.apply(null,L.map(function(x){return Math.abs(x.v)}).concat([1])),w=320/L.length;
  return '<svg viewBox="0 0 320 160" width="100%" role="img" aria-label="Ganancia neta por mes"><line x1="0" x2="320" y1="100" y2="100" style="stroke:var(--line)"/>'+L.map(function(x,i){
    var h=Math.abs(x.v)/mx*70,y=x.v>=0?100-h:100,cx=i*w+w/2;
    return '<rect x="'+(cx-14)+'" y="'+y+'" width="28" height="'+(x.v?Math.max(h,2):0)+'" rx="4" style="fill:var(--'+(x.v<0?"loss":"gain")+')"/><text x="'+cx+'" y="'+(x.v>=0?y-5:y+h+12)+'" text-anchor="middle" font-size="10" style="fill:var(--ink)">'+(x.v?sh(x.v):"")+'</text><text x="'+cx+'" y="152" text-anchor="middle" font-size="11" style="fill:var(--mute)">'+x.l+'</text>'}).join("")+'</svg>';
}
function hbars(L,f){
  var mx=Math.max.apply(null,L.map(function(x){return x.v}).concat([1]));
  return L.map(function(x){return '<div class="row"><span>'+esc(x.l)+'</span><span class="num">'+f(x.v)+'</span></div><div class="bar"><i style="width:'+Math.max(2,x.v/mx*100)+'%"></i></div>'}).join("");
}
function panel(){
  if(!db.v.length)return '<div class="empty">Tu panel aparecerá aquí cuando registres tu primer vehículo.<br>Toca “+ Vehículo” para empezar.</div>';
  var st=db.v.filter(function(v){return !v.venta}),sd=db.v.filter(function(v){return v.venta}),now=new Date(),mes=today().slice(0,7),ms=[];
  var net=function(v){return v.venta.p-costo(v)};
  for(var i=5;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth()-i,1),k=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2);
    ms.push({l:MN[d.getMonth()],v:sd.filter(function(v){return v.venta.f.slice(0,7)===k}).reduce(function(t,v){return t+net(v)},0)})}
  var gan=sd.reduce(function(t,v){return t+net(v)},0),gMes=ms[5].v,inv$=st.reduce(function(t,v){return t+costo(v)},0);
  var roi=sd.length?sd.reduce(function(t,v){return t+net(v)/costo(v)*100},0)/sd.length:null;
  var dp=sd.length?Math.round(sd.reduce(function(t,v){return t+dias(v)},0)/sd.length):null;
  var proy=st.reduce(function(t,v){var m=mg(v);return t+(m||0)},0);
  var fun=ST.slice(0,5).map(function(s,i){return {l:s,v:st.filter(function(v){return v.estado===i}).length}});
  var by={};db.v.forEach(function(v){v.gastos.forEach(function(g){by[g.k]=(by[g.k]||0)+gd(g)})});
  var cats=Object.keys(by).map(function(k){return {l:k,v:by[k]}}).sort(function(a,b){return b.v-a.v}).slice(0,6);
  var slow=st.slice().sort(function(a,b){return dias(b)-dias(a)}).slice(0,4);
  var best=sd.slice().sort(function(a,b){return net(b)/costo(b)-net(a)/costo(a)}).slice(0,3);
  var kp=function(l,v,c){return '<div class="box kpi"><div class="lbl">'+l+'</div><div class="mid '+(c||"")+'">'+v+'</div></div>'};
  return '<div class="hero"><div class="lbl">Ganancia neta acumulada</div><div class="hbig">'+R(gan)+'</div><div class="hs"><div><span>Este mes</span><b>'+R(gMes)+'</b></div><div><span>Invertido en stock</span><b>'+R(inv$)+'</b></div></div></div>'+
  '<div class="kg">'+kp("Vehículos en stock",st.length)+kp("Margen proyectado del stock",R(proy),sg(proy))+kp("ROI promedio (vendidos)",roi==null?"—":roi.toFixed(1)+"%")+kp("Días promedio en vender",dp==null?"—":dp+" días")+'</div>'+
  '<div class="box"><h2>Ganancia neta por mes</h2>'+bars(ms)+'</div>'+
  '<div class="box"><h2>Inventario por etapa</h2>'+hbars(fun,function(n){return n+(n===1?" vehículo":" vehículos")})+'</div>'+
  '<div class="box"><h2>En qué se va el dinero</h2>'+(cats.length?hbars(cats,R):'<div class="sub">Aún no hay gastos registrados.</div>')+'</div>'+
  '<div class="box"><h2>Atención: vehículos más lentos</h2>'+(slow.length?slow.map(function(v){return '<div class="ln"><span class="nm" data-a="open" data-id="'+v.id+'">'+esc(v.nombre)+' '+esc(v.anio)+'<div class="sub">'+ST[v.estado]+' · '+R(costo(v))+'</div></span>'+chip(v)+'</div>'}).join(""):'<div class="sub">No tienes vehículos en stock.</div>')+'<div class="sub" style="margin-top:6px">Verde: menos de 45 días · Ámbar: 45 a 89 · Rojo: 90 o más.</div></div>'+
  (best.length?'<div class="box"><h2>Mejores ventas por ROI</h2>'+best.map(function(v){return '<div class="ln"><span>'+esc(v.nombre)+' '+esc(v.anio)+'<div class="sub">'+dias(v)+' días</div></span><span class="num gain">'+pct(net(v),costo(v))+' · '+R(net(v))+'</span></div>'}).join("")+'</div>':"");
}
function inv(){
  var L=db.v.filter(function(v){
    var t=(v.nombre+" "+v.placa+" "+v.anio+" "+v.color).toLowerCase();
    return (!q||t.indexOf(q.toLowerCase())>-1)&&(fe===""||v.estado===+fe)&&(fo===""||v.origen===+fo);
  });
  return summary()+'<div class="filters"><input id="q" placeholder="Buscar marca, modelo, placa, año…" value="'+esc(q)+'"><select id="fe"><option value="">Todos los estados</option>'+opts(ST,fe===""?-1:+fe)+'</select><select id="fo"><option value="">Todos los orígenes</option>'+opts(OR,fo===""?-1:+fo)+'</select></div>'+
  (L.length?L.map(function(v){var m=mg(v);
    return '<button class="car" data-a="open" data-id="'+v.id+'">'+thumb(v)+'<div class="info"><div class="row"><span class="name">'+esc(v.nombre)+' '+esc(v.anio)+'</span><span class="num">'+R(costo(v))+'</span></div><div class="sub">'+OR[v.origen]+' · '+ST[v.estado]+' · '+chip(v)+'</div><div class="sub">'+(m==null?"Sin precio objetivo":(v.venta?"Ganancia ":"Margen proy. ")+'<span class="num '+sg(m)+'">'+R(m)+'</span> · ROI '+pct(m,costo(v)))+'</div></div></button>'}).join(""):'<div class="empty">'+(db.v.length?"Ningún vehículo coincide con los filtros.":"Aún no tienes vehículos. Toca “+ Vehículo”.")+'</div>');
}
function board(){
  return '<div class="board">'+ST.map(function(s,i){
    var L=db.v.filter(function(v){return v.estado===i});
    return '<div class="col"><h3><span>'+s+'</span><span class="sub">'+L.length+'</span></h3>'+L.map(function(v){var m=mg(v);
      return '<div class="card"><div class="nm" data-a="open" data-id="'+v.id+'">'+esc(v.nombre)+' '+esc(v.anio)+'</div><div class="sub">'+OR[v.origen]+'</div><div class="row"><span class="sub">Costo</span><span class="num">'+R(costo(v))+'</span></div><div class="row"><span class="sub">'+(v.venta?"Ganancia":"Margen proy.")+'</span><span class="num '+(m==null?"":sg(m))+'">'+(m==null?"—":R(m))+'</span></div><div class="row"><span class="sub">Días</span><span class="num">'+dias(v)+'</span></div><div class="mv"><button data-a="mv" data-d="-1" data-id="'+v.id+'"'+(i===0?" disabled":"")+'>◀</button><button data-a="mv" data-d="1" data-id="'+v.id+'"'+(i===5?" disabled":"")+'>▶</button></div></div>'}).join("")+'</div>'}).join("")+'</div>';
}
function report(){
  var mes=rep||today().slice(0,7),s=db.v.filter(function(v){return v.venta&&v.venta.f.slice(0,7)===mes});
  var ven=s.reduce(function(t,v){return t+v.venta.p},0),cos=s.reduce(function(t,v){return t+costo(v)},0);
  var cm=db.v.filter(function(v){return v.fecha.slice(0,7)===mes}).reduce(function(t,v){return t+comp(v)},0),by={};
  db.v.forEach(function(v){v.gastos.forEach(function(g){if(g.f.slice(0,7)===mes)by[g.k]=(by[g.k]||0)+gd(g)})});
  var ks=Object.keys(by);
  return '<label>Mes</label><input type="month" id="rm" value="'+mes+'"><div class="box" style="margin-top:12px">'+
  [["Vehículos vendidos",s.length],["Total vendido",R(ven)],["Costo de lo vendido",R(cos)],["Compras del mes",R(cm)]].map(function(x){return '<div class="ln"><span>'+x[0]+'</span><span class="num">'+x[1]+'</span></div>'}).join("")+
  '<div class="ln"><b>Ganancia neta</b><b class="num '+sg(ven-cos)+'">'+R(ven-cos)+'</b></div><div class="lbl" style="margin-top:10px">Gastos del mes por categoría</div>'+
  (ks.length?ks.map(function(k){return '<div class="ln"><span>'+esc(k)+'</span><span class="num">'+R(by[k])+'</span></div>'}).join(""):'<div class="sub">Sin gastos este mes.</div>')+'</div>';
}
function backup(){
  return '<div class="box"><b>Respaldo</b><p class="sub">Tus datos viven solo en este navegador. Exporta un respaldo con frecuencia y guárdalo en tu nube o correo.</p><div class="acts"><button class="btn pri" data-a="exp">Exportar respaldo</button><button class="btn" data-a="imp">Importar respaldo</button></div></div>';
}

function open(h){$("sheet").innerHTML=h;$("ov").hidden=false}
function close(){$("ov").hidden=true;render()}
function form(v){
  var e=!!v;v=v||{origen:0,mon:"USD",tasa:db.rate,fecha:today(),estado:0};
  open('<h2 style="margin-top:0">'+(e?"Editar":"Nuevo")+' vehículo</h2><label>Marca y modelo</label><input id="f_n" value="'+esc(v.nombre)+'"><div class="g2">'+
  '<div><label>Año</label><input id="f_a" inputmode="numeric" value="'+esc(v.anio)+'"></div><div><label>Color</label><input id="f_c" value="'+esc(v.color)+'"></div>'+
  '<div><label>Placa / VIN</label><input id="f_p" value="'+esc(v.placa)+'"></div><div><label>Kilometraje</label><input id="f_k" inputmode="numeric" value="'+esc(v.km)+'"></div>'+
  '<div><label>Origen de la compra</label><select id="f_o">'+opts(OR,v.origen)+'</select></div><div><label>Lote / referencia</label><input id="f_l" value="'+esc(v.lote)+'"></div>'+
  '<div><label>Moneda de compra</label><select id="f_u"><option'+(v.mon==="USD"?" selected":"")+'>USD</option><option'+(v.mon==="DOP"?" selected":"")+'>DOP</option></select></div><div><label>Tasa de cambio</label><input id="f_t" inputmode="decimal" value="'+v.tasa+'"></div>'+
  '<div><label>Precio de compra</label><input id="f_m" inputmode="decimal" value="'+(v.precio||"")+'"></div><div><label>Fees de subasta / comisión</label><input id="f_f" inputmode="decimal" value="'+(v.fees||"")+'"></div>'+
  '<div><label>Fecha de compra</label><input id="f_d" type="date" value="'+esc(v.fecha)+'"></div><div><label>Precio de venta objetivo (RD$)</label><input id="f_g" inputmode="decimal" value="'+(v.obj||"")+'"></div></div>'+
  '<label>Notas</label><textarea id="f_x" rows="2">'+esc(v.notas)+'</textarea><div class="acts"><button class="btn" data-a="close">Cancelar</button><button class="btn pri" data-a="save" data-id="'+(e?v.id:"")+'">Guardar</button></div>');
}
function detail(id){
  var v=find(id);if(!v){close();return}var m=mg(v),c=costo(v);
  var h='<div class="row"><h2 style="margin:0;font-size:20px">'+esc(v.nombre)+' '+esc(v.anio)+'</h2><button class="x" data-a="close">✕</button></div><div class="sub">'+OR[v.origen]+(v.lote?" · "+esc(v.lote):"")+[v.color,v.placa,v.km?nf.format(v.km)+" km":""].filter(Boolean).map(function(x){return " · "+esc(x)}).join("")+'</div>'+(v.notas?'<p class="sub">'+esc(v.notas)+'</p>':"")+
  '<label>Estado</label><select id="d_e" data-id="'+id+'">'+opts(ST,v.estado)+'</select>'+
  '<h2>Fotos</h2><div class="ph">'+v.fotos.map(function(f,i){return '<div><img src="'+f+'" alt="Foto '+(i+1)+'"><button class="x" data-a="delf" data-id="'+id+'" data-i="'+i+'">✕</button></div>'}).join("")+'</div><div class="acts"><button class="btn" data-a="photo" data-id="'+id+'">+ Fotos</button></div>'+
  '<h2>Documentos</h2><div class="ph">'+v.docs.map(function(d,i){return '<div><img src="'+d.img+'" alt="'+esc(d.t)+'"><span class="tg">'+esc(d.t.split(" ")[0])+'</span><button class="x" data-a="deld" data-id="'+id+'" data-i="'+i+'">✕</button></div>'}).join("")+'</div><div class="g2" style="margin-top:8px"><select id="d_t">'+opts(DOCS,0)+'</select><button class="btn" data-a="doc" data-id="'+id+'">+ Documento</button></div>'+
  '<h2>Costo base total real</h2><div class="ln"><span>Compra'+(v.mon==="USD"?'<div class="sub">'+U(v.precio+v.fees)+" a tasa "+v.tasa+'</div>':"")+'</span><span class="num">'+R(comp(v))+'</span></div>'+
  v.gastos.map(function(g,i){return '<div class="ln"><span>'+esc(g.k)+(g.c?" · "+esc(g.c):"")+'<div class="sub">'+(g.mon==="USD"?U(g.m)+" a tasa "+g.t:"RD$")+" · "+esc(g.f)+'</div></span><span><span class="num">'+R(gd(g))+'</span><button class="x" data-a="delg" data-id="'+id+'" data-i="'+i+'">✕</button></span></div>'}).join("")+
  '<div class="ln"><b>Total</b><b class="num">'+R(c)+'</b></div><div class="box" style="margin-top:12px"><div class="lbl">'+(v.venta?"Ganancia neta real (vendido en "+R(v.venta.p)+")":"Margen neto proyectado")+'</div><div class="big '+(m==null?"":sg(m))+'">'+(m==null?"—":R(m))+'</div><div class="g3"><div><div class="lbl">ROI</div><div class="mid">'+(m==null?"—":pct(m,c))+'</div></div><div><div class="lbl">Días en stock</div><div class="mid">'+dias(v)+'</div></div><div><div class="lbl">Objetivo</div><div class="mid">'+(v.obj?R(v.obj):"—")+'</div></div></div></div>'+
  '<h2>Agregar gasto</h2><div class="g2"><select id="g_k">'+opts(CATS,0)+'</select><select id="g_o"><option>DOP</option><option>USD</option></select><input id="g_m" inputmode="decimal" placeholder="Monto"><input id="g_c" placeholder="Proveedor / taller"></div><div class="acts"><button class="btn pri" data-a="addg" data-id="'+id+'">Agregar gasto</button></div>'+
  '<div class="acts"><button class="btn" data-a="ficha" data-id="'+id+'">Ficha PDF</button><button class="btn" data-a="edit" data-id="'+id+'">Editar</button><button class="btn del" data-a="del" data-id="'+id+'">Eliminar</button></div>';
  open(h);
}
function move(v,to){
  if(to===5&&!v.venta){var p=parseFloat(String(prompt("Precio de venta en RD$:",v.obj||"")||"").replace(/,/g,""));if(!p)return false;v.venta={p:p,f:today()}}
  if(to!==5)v.venta=null;v.estado=to;return save();
}
function ficha(v){
  $("ficha").innerHTML='<h1>'+esc(v.nombre)+' '+esc(v.anio)+'</h1><p>'+[v.color,v.placa&&"Placa/VIN: "+v.placa,v.km&&nf.format(v.km)+" km"].filter(Boolean).map(esc).join(" · ")+'</p>'+
  (v.obj?'<h2>Precio: '+R(v.obj)+'</h2>':"")+(v.notas?'<p>'+esc(v.notas)+'</p>':"")+(v.docs.length?'<p>Documentos disponibles: '+v.docs.map(function(d){return esc(d.t)}).join(", ")+'</p>':"")+v.fotos.map(function(f){return '<img src="'+f+'" alt="">'}).join("");
  setTimeout(function(){window.print()},150);
}
function shrink(file,max,qual,cb){
  var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",qual))};im.src=r.result};r.readAsDataURL(file);
}
$("file").onchange=function(){
  var v=find(cur),fs=[].slice.call(this.files),n=fs.length,t=kind==="d"?DOCS[+$("d_t").value]:"";this.value="";if(!v)return;
  fs.forEach(function(f){shrink(f,kind==="d"?1100:720,kind==="d"?.7:.65,function(d){
    if(kind==="d")v.docs.push({t:t,img:d});else v.fotos.push(d);
    if(--n===0){if(!save()){if(kind==="d")v.docs.pop();else v.fotos.pop()}detail(v.id)}})});
};
$("imp").onchange=function(){
  var f=this.files[0];this.value="";if(!f)return;var r=new FileReader();
  r.onload=function(){try{var d=JSON.parse(r.result);if(!d.v)throw 0;if(confirm("Esto reemplaza los datos actuales. ¿Continuar?")){db=d;save();render()}}catch(e){alert("Archivo de respaldo no válido.")}};r.readAsText(f);
};
document.addEventListener("input",function(e){
  if(e.target.id==="q"){q=e.target.value;var p=e.target.selectionStart;render();var n=$("q");n.focus();n.setSelectionRange(p,p)}
});
document.addEventListener("change",function(e){
  var i=e.target.id;
  if(i==="fe"){fe=e.target.value;render()}else if(i==="fo"){fo=e.target.value;render()}else if(i==="rm"){rep=e.target.value;render()}
  else if(i==="d_e"){var v=find(e.target.dataset.id);move(v,+e.target.value);detail(v.id)}
});
$("rate").onchange=function(){var n=parseFloat(this.value.replace(",","."));if(n>0){db.rate=n;save()}render()};
document.addEventListener("click",function(e){
  var t=e.target.closest(".tabs button");if(t){tab=+t.dataset.t;render();return}
  if(e.target===$("ov")){close();return}
  var b=e.target.closest("[data-a]");if(!b)return;
  var a=b.dataset.a,id=b.dataset.id,v=id&&find(id);
  if(a==="open")detail(id);else if(a==="close")close();
  else if(a==="mv"){move(v,v.estado+ +b.dataset.d);render()}
  else if(a==="edit")form(v);
  else if(a==="save"){var n=$("f_n").value.trim();if(!n){$("f_n").focus();return}
    var d={nombre:n,anio:$("f_a").value.trim(),color:$("f_c").value.trim(),placa:$("f_p").value.trim(),km:num("f_k")||"",origen:+$("f_o").value,lote:$("f_l").value.trim(),mon:$("f_u").value,tasa:num("f_t")||db.rate,precio:num("f_m"),fees:num("f_f"),fecha:$("f_d").value||today(),obj:num("f_g"),notas:$("f_x").value.trim()};
    if(v){for(var k in d)v[k]=d[k]}else{d.id="v"+Date.now();d.estado=0;d.gastos=[];d.fotos=[];d.docs=[];d.venta=null;db.v.unshift(d);v=d}
    save();detail(v.id)}
  else if(a==="addg"){var m=num("g_m");if(!m){$("g_m").focus();return}var o=$("g_o").value;
    v.gastos.push({k:CATS[+$("g_k").value],c:$("g_c").value.trim(),mon:o,m:m,t:o==="USD"?db.rate:1,f:today()});save();detail(id)}
  else if(a==="delg"){v.gastos.splice(+b.dataset.i,1);save();detail(id)}
  else if(a==="photo"){cur=id;kind="f";$("file").click()}
  else if(a==="doc"){cur=id;kind="d";$("file").click()}
  else if(a==="delf"){v.fotos.splice(+b.dataset.i,1);save();detail(id)}
  else if(a==="deld"){v.docs.splice(+b.dataset.i,1);save();detail(id)}
  else if(a==="ficha")ficha(v);
  else if(a==="del"){if(confirm("¿Eliminar este vehículo y todos sus datos?")){db.v=db.v.filter(function(x){return x.id!==id});save();close()}}
  else if(a==="exp"){var l=document.createElement("a");l.href=URL.createObjectURL(new Blob([JSON.stringify(db)],{type:"application/json"}));l.download="respaldo-flipping-"+today()+".json";l.click()}
  else if(a==="imp")$("imp").click();
});
$("add").onclick=function(){form()};
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
render();
})();
