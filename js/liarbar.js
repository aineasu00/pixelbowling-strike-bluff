(function(){
  const penalties=[
    ["◆","Lance la prochaine boule de la main non dominante."],
    ["♟","Fais ta prochaine approche au ralenti, façon film noir."],
    ["●","Joue une boule sans prendre d’élan."],
    ["♛","Salue la piste comme un monarque avant ton lancer."],
    ["♦","Annonce un score précis avant ton prochain lancer. Raté : révérence au groupe."],
    ["♣","Fais trois pas de danse old money avant de jouer."],
    ["☠","Le groupe choisit ta posture de départ au prochain lancer."],
    ["✦","Commente ton prochain lancer avec une voix de présentateur dramatique."],
    ["◒","Garde une main dans le dos pendant ta prochaine approche."],
    ["⚜","Donne un titre aristocratique à chaque joueur avant ton prochain lancer."]
  ];
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  class LiarBar{
    constructor(){this.state=null}
    newGame(names){
      const players=names.map((name,id)=>({id,name:name.toUpperCase(),wins:0,hand:[]}));
      this.state={players,leader:0,active:0,target:null,pile:[],lastPlay:null,round:1,status:"target",selected:[],pendingPenalty:null};
      this.deal();this.save();return this.state
    }
    deal(){
      const deck=shuffle(PB_CARDS.cards.map(c=>({...c,uid:`${c.id}-${Math.random().toString(36).slice(2,7)}`})));
      this.state.players.forEach(p=>p.hand=[]);
      let i=0;while(deck.length)this.state.players[i++%this.state.players.length].hand.push(deck.pop());
      this.state.players.forEach(p=>p.hand.sort((a,b)=>a.order-b.order));
      this.state.active=this.state.leader;this.state.target=null;this.state.pile=[];this.state.lastPlay=null;this.state.selected=[];this.state.status="target"
    }
    setTarget(rank){this.state.target=rank;this.state.status="playing";this.save()}
    toggle(uid){const s=this.state.selected,i=s.indexOf(uid);if(i>=0)s.splice(i,1);else if(s.length<3)s.push(uid);this.save()}
    play(){
      const p=this.activePlayer();if(!this.state.selected.length)return null;
      const cards=p.hand.filter(c=>this.state.selected.includes(c.uid));
      p.hand=p.hand.filter(c=>!this.state.selected.includes(c.uid));
      this.state.pile.push(...cards);this.state.lastPlay={playerId:p.id,cards,claimed:this.state.target};
      this.state.selected=[];this.state.status="playing";
      if(p.hand.length===0){this.state.status="roundPending"}
      this.next();this.save();return cards
    }
    pass(){this.state.selected=[];this.next();this.save()}
    next(){this.state.active=(this.state.active+1)%this.state.players.length}
    accuse(accuserId){
      if(!this.state.lastPlay)return null;
      const lp=this.state.lastPlay;
      const lied=lp.kingpin?false:lp.cards.some(c=>c.type==="joker"||c.rank!==lp.claimed);
      const penalized=lied?lp.playerId:accuserId;
      const penalty=penalties[Math.floor(Math.random()*penalties.length)];
      this.state.pendingPenalty={playerId:penalized,penalty,lied,accuserId,accusedId:lp.playerId};
      this.state.status="penalty";this.save();return this.state.pendingPenalty
    }
    finishPenalty(){
      const empty=this.state.players.find(p=>p.hand.length===0);
      this.state.pendingPenalty=null;
      if(empty){empty.wins++;this.state.status=empty.wins>=3?"gameOver":"roundOver";this.state.roundWinner=empty.id}
      else{this.state.pile=[];this.state.lastPlay=null;this.state.status="playing"}
      this.save();return empty
    }
    finishUnchallenged(){
      const empty=this.state.players.find(p=>p.hand.length===0);if(!empty)return null;
      empty.wins++;this.state.status=empty.wins>=3?"gameOver":"roundOver";this.state.roundWinner=empty.id;this.save();return empty
    }
    useKingpin(rank){
      const p=this.activePlayer(),kingpin=p.hand.find(c=>c.type==="kingpin");if(!kingpin)return null;
      p.hand=p.hand.filter(c=>c.uid!==kingpin.uid);this.state.pile.push(kingpin);this.state.target=rank;
      this.state.lastPlay={playerId:p.id,cards:[kingpin],claimed:"KINGPIN",kingpin:true};this.state.selected=[];
      if(p.hand.length===0)this.state.status="roundPending";this.next();this.save();return kingpin
    }
    nextRound(){this.state.leader=(this.state.leader+1)%this.state.players.length;this.state.round++;this.deal();this.save()}
    changeTarget(rank){this.state.target=rank;this.save()}
    activePlayer(){return this.state.players[this.state.active]}
    save(){localStorage.setItem("pb-strike-bluff",JSON.stringify(this.state))}
    load(){try{this.state=JSON.parse(localStorage.getItem("pb-strike-bluff"));return this.state}catch{return null}}
    clear(){localStorage.removeItem("pb-strike-bluff");this.state=null}
  }
  window.LiarBar=LiarBar;
})();
