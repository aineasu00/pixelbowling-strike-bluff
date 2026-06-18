(function(){
  const game=new LiarBar(),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const screens={home:$("#home-screen"),setup:$("#setup-screen"),game:$("#game-screen")};
  const roman=v=>(PB_CARDS.ranks.find(r=>r.v===v)||{r:v}).r;
  const show=name=>{Object.values(screens).forEach(s=>s.classList.remove("active"));screens[name].classList.add("active");PB_EFFECTS.transition()};
  function cardHTML(c,selectable=false){
    return `<button class="card ${c.suit} ${c.type!=="standard"?"special":""}" data-card="${c.uid||""}" ${selectable?"":"tabindex='-1'"} aria-label="${c.family} ${c.rank}">
      <span class="rank">${c.roman}</span><span class="suit">${c.symbol}</span><span class="art">${c.art}</span><span class="maker">PB · ${c.family}</span></button>`
  }
  function setupInputs(names=["VINCENT","ALBA"]){
    $("#player-inputs").innerHTML=names.map((n,i)=>`<div class="player-entry"><label>${String(i+1).padStart(2,"0")}</label><input maxlength="12" value="${n}" aria-label="Nom joueur ${i+1}">${i>1?'<button class="remove-player" data-remove="'+i+'">×</button>':""}</div>`).join("");
    $("#player-count").textContent=names.length;
  }
  function openSetup(){setupInputs();show("setup")}
  function render(){
    const s=game.state;if(!s)return;
    const active=game.activePlayer();
    $("#scoreboard").innerHTML=s.players.map(p=>`<div class="score-chip"><b>${p.name}</b><span>${"♛".repeat(p.wins)||"·"}</span></div>`).join("");
    $("#active-name").textContent=active.name;$("#hand-owner").textContent=active.name;
    $("#target-value").textContent=s.target?roman(s.target):"—";
    $("#turn-instruction").textContent=s.status==="target"?"LE MENEUR CHOISIT LA CIBLE":s.status==="roundPending"?"DERNIÈRE CHANCE : BLUFF OU VALIDEZ":"1 À 3 CARTES · DÉCLARATION ORALE";
    const seats=s.players.filter(p=>p.id!==active.id).map(p=>`<div class="player-seat ${p.id===s.leader?"leader":""}"><b>${p.name}</b><span>${p.hand.length} CARTES ${p.id===s.leader?"· MENEUR":""}</span></div>`);
    const cut=Math.ceil(seats.length/2);$("#players-left").innerHTML=seats.slice(0,cut).join("");$("#players-right").innerHTML=seats.slice(cut).join("");
    $("#hand-cards").innerHTML=active.hand.map(c=>cardHTML(c,true)).join("");
    s.selected.forEach(uid=>document.querySelector(`[data-card="${uid}"]`)?.classList.add("selected"));
    $("#selection-count").textContent=s.selected.length;$("#play-btn").disabled=!s.selected.length||s.status!=="playing";
    $("#bluff-btn").disabled=!s.lastPlay||!["playing","roundPending"].includes(s.status);
    $(".pass-btn").textContent=s.status==="roundPending"?"VALIDER":"PASSER";
    $("#pile-empty").hidden=!!s.pile.length;
    $("#played-pile").querySelectorAll(".card").forEach(c=>c.remove());
    s.pile.slice(-5).forEach((c,i)=>$("#played-pile").insertAdjacentHTML("beforeend",cardHTML(c).replace('class="card',`style="--rot:${(i-2)*4}deg;--offset:${(i-2)*26}px" class="card`)));
    $("#last-play").textContent=s.lastPlay?`${s.players[s.lastPlay.playerId].name} A POSÉ ${s.lastPlay.cards.length} CARTE${s.lastPlay.cards.length>1?"S":""} COMME ${roman(s.lastPlay.claimed)}`:"AUCUN COUP";
    const hasKingpin=active.hand.some(c=>c.type==="kingpin");$("#change-target-btn").hidden=!hasKingpin||s.status!=="playing";
    show("game");if(s.status==="target")openTarget();
  }
  function openTarget(change=false){
    $("#target-modal").hidden=false;
    $("#target-grid").innerHTML=PB_CARDS.ranks.map(r=>`<button data-target="${r.v}" data-change="${change}">${r.r}</button>`).join("");
  }
  function info(type){
    const options=type==="options";
    $("#info-title").textContent=options?"OPTIONS":"CRÉDITS";
    $("#info-copy").innerHTML=options?`<p>Le jeu est muet par défaut et fonctionne sans compte. La partie est sauvegardée automatiquement sur cette tablette.</p><button class="metal-btn" data-action="clear-save">EFFACER LA SAUVEGARDE</button>`:`<p><b>Strike & Bluff</b><br>Une création Pixel Bowling.</p><p>Direction : old money industriel × low-poly fin 90s.<br>Jeu local collectif, sans données privées.</p>`;
    $("#info-overlay").hidden=false;
  }
  document.addEventListener("click",e=>{
    const a=e.target.closest("[data-action]"),card=e.target.closest("[data-card]"),target=e.target.closest("[data-target]"),acc=e.target.closest("[data-accuser]"),remove=e.target.closest("[data-remove]");
    if(card&&game.state?.status==="playing"){game.toggle(card.dataset.card);render();return}
    if(target){const isChange=target.dataset.change==="true";isChange?game.useKingpin(target.dataset.target):game.setTarget(target.dataset.target);$("#target-modal").hidden=true;render();return}
    if(acc){const result=game.accuse(Number(acc.dataset.accuser));$("#accuser-modal").hidden=true;showReveal(result);return}
    if(remove){const values=$$("#player-inputs input").map(i=>i.value);values.splice(Number(remove.dataset.remove),1);setupInputs(values);return}
    if(!a)return;
    const action=a.dataset.action;
    if(action==="new-game")openSetup();
    if(action==="resume"){game.load();render()}
    if(action==="home")show("home");
    if(action==="add-player"){const values=$$("#player-inputs input").map(i=>i.value);if(values.length<9){values.push(`JOUEUR ${values.length+1}`);setupInputs(values)}}
    if(action==="start-game"){const names=$$("#player-inputs input").map((i,n)=>i.value.trim()||`JOUEUR ${n+1}`);if(names.length>=2){game.newGame(names);render()}}
    if(action==="play"){game.play();render()}
    if(action==="pass"){if(game.state.status==="roundPending"){const winner=game.finishUnchallenged();showRound(winner)}else{game.pass();render()}}
    if(action==="bluff"){const s=game.state;$("#accuser-grid").innerHTML=s.players.filter(p=>p.id!==s.lastPlay.playerId).map(p=>`<button data-accuser="${p.id}">${p.name}</button>`).join("");$("#accuser-modal").hidden=false}
    if(action==="close-accuser")$("#accuser-modal").hidden=true;
    if(action==="change-target")openTarget(true);
    if(action==="penalty-done"){const winner=game.finishPenalty();$("#penalty-overlay").hidden=true;if(winner)showRound(winner);else render()}
    if(action==="next-round"){if(game.state.status==="gameOver"){game.clear();show("home")}else{game.nextRound();$("#round-overlay").hidden=true;render()}}
    if(action==="pause")show("home");
    if(action==="options"||action==="credits")info(action);
    if(action==="close-info")$("#info-overlay").hidden=true;
    if(action==="clear-save"){game.clear();$("#resume-btn").hidden=true;$("#info-overlay").hidden=true}
  });
  function showReveal(result){
    const s=game.state,lp=s.lastPlay;
    $("#reveal-verdict").textContent=result.lied?`${s.players[lp.playerId].name} A MENTI.`:`${s.players[lp.playerId].name} DISAIT VRAI.`;
    $("#reveal-cards").innerHTML=lp.cards.map(c=>cardHTML(c)).join("");
    $("#reveal-overlay").hidden=false;PB_EFFECTS.reveal(result.lied);
    setTimeout(()=>{$("#reveal-overlay").hidden=true;const p=result.penalty;$("#penalty-icon").textContent=p[0];$("#penalty-player").textContent=s.players[result.playerId].name;$("#penalty-text").textContent=p[1];$("#penalty-overlay").hidden=false},1900);
  }
  function showRound(winner){
    const over=game.state.status==="gameOver";$("#round-winner").textContent=over?`${winner.name} RÈGNE SUR LE SALON`:`${winner.name} GAGNE LA MANCHE`;
    $("#round-score").textContent=`${winner.wins} MANCHE${winner.wins>1?"S":""} GAGNÉE${winner.wins>1?"S":""}`;$("#round-overlay").hidden=false;
    $("#round-overlay .primary-btn").textContent=over?"RETOUR AU SALON":"MANCHE SUIVANTE";
  }
  if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
  $("#resume-btn").hidden=!localStorage.getItem("pb-strike-bluff");setupInputs();
})();
