(function(){
  const ranks=[{v:"A",r:"I"},{v:"2",r:"II"},{v:"3",r:"III"},{v:"4",r:"IV"},{v:"5",r:"V"},{v:"6",r:"VI"},{v:"7",r:"VII"},{v:"8",r:"VIII"},{v:"9",r:"IX"},{v:"10",r:"X"},{v:"J",r:"J"},{v:"Q",r:"Q"},{v:"K",r:"K"}];
  const suits=[
    {id:"spades",symbol:"♠",name:"Boules Noires",art:"●"},
    {id:"hearts",symbol:"♥",name:"Quilles Blanches",art:"♟"},
    {id:"diamonds",symbol:"♦",name:"Gants Rouges",art:"✦"},
    {id:"clubs",symbol:"♣",name:"Chaussures Vertes",art:"◒"}
  ];
  const cards=[];
  suits.forEach(s=>ranks.forEach((rank,i)=>cards.push({id:`${s.id}-${rank.v}`,rank:rank.v,roman:rank.r,suit:s.id,symbol:s.symbol,family:s.name,art:s.art,type:"standard",order:i})));
  for(let i=1;i<=4;i++)cards.push({id:`joker-${i}`,rank:"JOKER",roman:"☠",suit:"special",symbol:"☠",family:"Crâne doré",art:"☠",type:"joker",order:13});
  for(let i=1;i<=4;i++)cards.push({id:`kingpin-${i}`,rank:"KINGPIN",roman:"K♛",suit:"special",symbol:"♛",family:"Kingpin",art:"♛",type:"kingpin",order:14});
  window.PB_CARDS={cards,ranks,suits};
})();
