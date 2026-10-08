"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const state = { shows: [], filter: "all", city: "all", tickets: "all", q: "", sort: "score", visible: 20 };
  const norm = text => String(text ?? "").toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
  const e = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const url = raw => {try {const u=new URL(String(raw));return u.protocol==="https:" ? u.href : "";}catch{return "";}};
  const num = v => Number(v ?? 0).toLocaleString("en-US");
  const hours = v => Number(v ?? 0).toLocaleString("en-US",{maximumFractionDigits:1,minimumFractionDigits:1});
  const field = (s,name) => s?.[name] ?? null;
  const dateLabel = raw => {
    if(!raw)return "Date to be confirmed";
    const match=String(raw).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if(!match)return String(raw);
    const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]),h=Number(match[4]),min=Number(match[5]);
    const weekday=new Date(y,m-1,d,12).toLocaleDateString("en-US",{weekday:"short"});
    const month=new Date(y,m-1,d,12).toLocaleDateString("en-US",{month:"short"});
    return weekday+", "+month+" "+d+" · "+((h+11)%12+1)+":"+String(min).padStart(2,"0")+" "+(h>=12?"PM":"AM")+" ET";
  };
  const metric=(label,rank,value,kind) =>
    '<div class="metric"><label>'+e(label)+'</label><strong>#'+(rank===null?"—":num(rank))+'</strong><span>'+(value===null?"No data":(kind==="hour"?hours(value):num(value))+" "+(kind==="hour"?"hrs":"plays"))+'</span></div>';
  function details(s){
    const acts=s.artists||[];
    const artistSections=acts.map(a => '<div class="artist-detail">'
      +'<div class="artist-head"><strong>'+e(a.name)+(a.curated?' <span class="artist-fav" aria-label="Explicit favorite">★</span>':'')+'</strong><small>'+e(a.role || "performer")+'</small></div>'
      +'<div class="metrics">'
      +metric("Lifetime plays",a.lp_rank,a.lp,"play")
      +metric("Lifetime hours",a.lh_rank,a.lh,"hour")
      +metric("12-month plays",a.rp_rank,a.rp,"play")
      +metric("12-month hours",a.rh_rank,a.rh,"hour")
      +'</div></div>').join("");
    const all=(s.all_performers||[]).map(x=>x.name).filter(Boolean).join(" · ");
    const link=s.url ? url(s.url):"";
    const lookup=url("https://www.google.com/search?q="+encodeURIComponent([s.name,s.venue,s.city,String(s.date||"").slice(0,10),"concert tickets"].filter(Boolean).join(" ")));
    const drive=s.drive_quality==="city_estimate"&&s.drive_minutes!=null
      ? "~"+num(s.drive_minutes)+" min city-level estimate; venue route NOT checked"
      :s.drive_quality==="venue_route_recorded"&&s.drive_minutes!=null
      ? num(s.drive_minutes)+" min venue route on record; recheck before travel"
      :"Driving time not verified";
    return '<div class="card-details" id="detail-'+e(s.id)+'" hidden>'
      +artistSections
      +'<div class="details-foot">'
      +(all?'<p><strong>Full listed bill:</strong> '+e(all)+'</p>':'')
      +'<p><strong>Drive:</strong> '+e(drive)+'</p>'
      +'<p><strong>Tickets:</strong> '+(s.ticket_status==="SOLD_OUT"?"Official source reported sold out.":"Availability not checked.")+'</p>'
      +'<p><strong>Source:</strong> '+(s.source_quality==="official_listed"?"Official event information located":"Regional listing; check official details")+(link?' · <a href="'+e(link)+'" target="_blank" rel="noopener noreferrer">Source details ↗</a>':' · <a href="'+e(lookup)+'" target="_blank" rel="noopener noreferrer">Search for show details ↗</a>')+'</p>'
      +'</div></div>';
  }
  function card(s){
    const badges=[];
    if(s.curated_count>0)badges.push('<span class="badge favorite">★ '+s.curated_count+' favorite'+(s.curated_count===1?'':'s')+'</span>');
    if(s.matched_count>1)badges.push('<span class="badge pair">'+s.matched_count+' matching artists</span>');
    if(s.top100_count>0)badges.push('<span class="badge">Top 100 × '+s.top100_count+'</span>');
    if(s.ticket_status==="SOLD_OUT")badges.push('<span class="badge soldout">Reported sold out</span>');
    if(s.source_quality!=="official_listed")badges.push('<span class="badge source">Discovery candidate</span>');
    if(s.drive_quality!=="venue_route_recorded")badges.push('<span class="badge route">Drive unverified</span>');
    const link=url(s.url);
    const lookup=url("https://www.google.com/search?q="+encodeURIComponent([s.name,s.venue,s.city,String(s.date||"").slice(0,10),"concert tickets"].filter(Boolean).join(" ")));
    return '<article class="show">'
      +'<div class="card-top"><span class="datebadge">'+e(dateLabel(s.date))+'</span><div class="score" title="Relative matching score; not a probability"><strong>'+Number(s.score||0).toFixed(0)+'</strong><span>match pts</span></div></div>'
      +'<div class="show-body"><h3>'+e(s.name)+'</h3><p class="venue">'+e(s.venue||"Venue to be confirmed")+' · '+e(s.city)+(s.region?', '+e(s.region):'')+'</p>'
      +'<p class="lineup-preview">'+e((s.artists||[]).map(a=>a.name).join(" · "))+'</p>'
      +'<div class="badge-row">'+badges.join("")+'</div></div>'
      +'<div class="card-actions"><button class="details-button" type="button" data-open="'+e(s.id)+'" aria-expanded="false" aria-controls="detail-'+e(s.id)+'">▸ Spotify rankings <span aria-hidden="true">↓</span></button>'
      +(link?'<a class="event-link" href="'+e(link)+'" target="_blank" rel="noopener noreferrer">View source ↗</a>':'<a class="event-link" href="'+e(lookup)+'" target="_blank" rel="noopener noreferrer">Search this show ↗</a>')
      +'</div>'+details(s)+'</article>';
  }
  function bestRank(s,key){const vals=(s.artists||[]).map(a=>Number(a[key])).filter(n=>n>0);return vals.length?Math.min(...vals):1e6;}
  function selectShows(){
    const selected=state.shows.filter(s=>{
      if(state.filter==="favorites"&&!s.curated_count)return false;
      if(state.filter==="headliners"&&!s.matched_headliners)return false;
      if(state.filter==="multi"&&s.matched_count<2)return false;
      if(state.filter==="top100"&&!s.top100_count)return false;
      if(state.city!=="all"&&s.city!==state.city)return false;
      if(state.tickets==="not-sold-out"&&s.ticket_status==="SOLD_OUT")return false;
      if(state.tickets==="sold-out"&&s.ticket_status!=="SOLD_OUT")return false;
      if(state.q){
        const names=(s.all_performers||[]).map(x=>x.name).join(" ");
        if(!norm([s.name,s.city,s.venue,s.region,names].join(" ")).includes(state.q))return false;
      }
      return true;
    });
    selected.sort((x,y)=>{
      if(state.sort==="date")return x.date.localeCompare(y.date)||y.score-x.score;
      if(state.sort==="lineup")return y.matched_count-x.matched_count||y.score-x.score;
      if(state.sort==="recent")return bestRank(x,"rp_rank")-bestRank(y,"rp_rank")||y.score-x.score;
      if(state.sort==="lifetime")return bestRank(x,"lp_rank")-bestRank(y,"lp_rank")||y.score-x.score;
      return y.score-x.score||x.date.localeCompare(y.date);
    });
    return selected;
  }
  function render(){
    const shows=selectShows();
    const displayed=shows.slice(0,state.visible);
    $("results").innerHTML=displayed.map(card).join("");
    $("empty").hidden=shows.length>0;
    $("more").hidden=shows.length<=state.visible;
    $("result-count").textContent=shows.length+" show"+(shows.length===1?"":"s")+" · "+displayed.length+" displayed";
    $("results").querySelectorAll("[data-open]").forEach(button=>{
      button.addEventListener("click",()=>{
        const detail=$("detail-"+button.dataset.open);
        if(!detail)return;
        detail.hidden=!detail.hidden;
        button.setAttribute("aria-expanded",String(!detail.hidden));
        button.firstChild.textContent=detail.hidden?"▸ Spotify rankings ":"▾ Hide rankings ";
      });
    });
  }
  function update(reset=true){if(reset)state.visible=20;render();}
  function reset(){
    state.filter="all";state.city="all";state.tickets="all";state.q="";state.sort="score";
    $("search").value="";$("city").value="all";$("tickets").value="all";$("sort").value="score";
    document.querySelectorAll(".chip").forEach(b=>{b.classList.toggle("active",b.dataset.filter==="all");b.setAttribute("aria-pressed",String(b.dataset.filter==="all"));});
    update();
  }
  function wire(){
    $("search").addEventListener("input",ev=>{state.q=norm(ev.target.value.trim());update();});
    $("sort").addEventListener("change",ev=>{state.sort=ev.target.value;update();});
    $("city").addEventListener("change",ev=>{state.city=ev.target.value;update();});
    $("tickets").addEventListener("change",ev=>{state.tickets=ev.target.value;update();});
    document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{
      state.filter=b.dataset.filter;
      document.querySelectorAll(".chip").forEach(c=>{const active=c===b;c.classList.toggle("active",active);c.setAttribute("aria-pressed",String(active));});
      update();
    }));
    $("reset").addEventListener("click",reset);
    $("more").addEventListener("click",()=>{state.visible+=20;render();});
  }
  async function init(){
    wire();
    try{
      const response=await fetch("./data.json",{cache:"no-store"});
      if(!response.ok)throw new Error("Data file could not be loaded ("+response.status+")");
      const data=await response.json();
      if(!Array.isArray(data.shows))throw new Error("Concert data has an invalid format.");
      state.shows=data.shows;
      $("stat-shows").textContent=num(data.shows.length);
      $("stat-artists").textContent=num(data.artist_appearances);
      $("stat-pairings").textContent=num(data.shows.filter(s=>s.matched_count>=2).length);
      $("stat-favorites").textContent=num(data.shows.filter(s=>s.curated_count>0).length);
      $("artist-total").textContent=num(data.ranking_population||3715);
      $("snapshot-date").textContent="Snapshot · "+String(data.snapshot_date||"date unknown");
      $("footer-asof").textContent="Snapshot: "+String(data.snapshot_date||"unknown");
      [...new Set(state.shows.map(s=>s.city).filter(Boolean))].sort().forEach(c=>{
        const option=document.createElement("option");option.value=c;option.textContent=c;$("city").appendChild(option);
      });
      render();
    }catch(error){
      $("results").innerHTML='<div class="empty"><h3>Concert data unavailable</h3><p>Please try refreshing this page later.</p></div>';
      $("result-count").textContent="Unable to load snapshot";
      console.error("Gerald concert radar:",error);
    }
  }
  init();
})();