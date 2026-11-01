/* =====================================================================
   PLACEBOARD DEMO — a working Placeboard set in Ripon. The map, drive times,
   landmarks and calendar are real, from public sources. The businesses,
   requests and dashboard numbers are examples, and the page says so. Ripon
   City Council, Ripon BID and Visit Ripon are not involved.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';
import {type Place,type Season,requestPortal,councilPortal,dashboard,year} from './place';

const RIPON:Place={
  host:'ripon.theplaceboard.com',brand:'the Ripon board',client:'Example council login',project:'Ripon 2027 · sample plan',
  biz:['Market Square café (example)','Supper, then the Hornblower at 9pm','Thursdays in May, from 6pm'],
  queue:[['event','Event','Late-night shopping before the lights switch-on','A Kirkgate gift shop (example) · submitted yesterday'],
    ['news','News','Bike hire for the ride out to Fountains Abbey','A cycle shop (example) · submitted 2 days ago']],
  done:['Offer','Race-day lunch for racegoers','A Westgate pub (example) · approved, in Stories on Saturday'],
  tiles:[['Stage','Plan'],['Next milestone','Spring campaign live'],['Waiting for you','2'],['Next meeting','Quarterly · Apr']],
  needs:['Approve the April content calendar','Sign off the Fountains Abbey to the city walking page'],
  plan:[['done','Accounts and analytics connected','Jan'],['done','Baseline report','Jan'],['now','Spring and race season creative','Mar'],
    ['','Annual plan to committee','Mar'],['','First race day campaign','Apr'],['','Quarterly review','Jun']],
  approvals:[['April content calendar','Five working days · due 20 Mar'],['Abbey to the city walking page','Five working days · due 24 Mar']],
  approved:['Spring in Ripon campaign plan','Approved 2 Mar'],
  docs:[['PDF','Place check: reach and findability','From Minshall Group · Jan'],['PDF','Baseline report','From Minshall Group · Jan'],
    ['DOC','Spring in Ripon campaign plan','From Minshall Group · Feb'],['ZIP','City photo library','Shared by the council · Jan']],
  reports:[['RPT','February report and dashboard link','Two pages, published in early March'],['RPT','January report','Published February']],
  dash:{title:'Ripon · live dashboard (sample)',
    kpis:[['Reach outside the local area',58,'% of total reach'],['Website sessions',6930,'this month'],['Clicks to businesses',1040,'to their own sites'],['Portal requests',31,'received, 28 approved']],
    bars:[34,39,42,47,53,58],mon:['Jan','Feb','Mar','Apr','May','Jun'],visitors:58,outside:'Visitors from outside the area',
    top:[['What’s on in Ripon','1,870'],['Fountains Abbey to the city','1,220'],['Race days and getting here','990'],['The Hornblower and the 9pm watch','540']],
    flag:'Real city, made-up numbers. These figures show the format. They are not Ripon’s results.'}
};

/* the real year in Ripon, from the racecourse, cathedral and city calendars */
const SEASONS:Season[]=[
  {span:1,t:'Christmas in the City',s:'Christmas',m:'Dec',f:'Gift guides from independents, festive food and drink, Christmas at the cathedral and winter days out at Fountains Abbey.'},
  {span:2,t:'Fresh Start',s:'Fresh Start',m:'Jan to Feb',f:'Winter walks at Studley Royal, indoor days out, new openings and reasons for residents to shop local.'},
  {span:2,t:'Spring and the first race day',s:'Spring',m:'Mar to Apr',f:'Easter family days out, the Thursday market, and the start of the flat season at Yorkshire’s Garden Racecourse.'},
  {span:4,t:'Summer in the City',s:'Summer in the City',m:'May to Aug',f:'Race days, the canal and riverside walks, outdoor dining, St Wilfrid’s Procession in early August and the Great St Wilfrid at the racecourse.'},
  {span:2,t:'Heritage and Harvest',s:'Heritage and Harvest',m:'Sep to Oct',f:'Heritage Open Days, the last race meetings of the year, the cathedral, and the World Heritage Site at Fountains Abbey and Studley Royal.'},
  {span:1,t:'Shop Local',s:'Shop Local',m:'Nov',f:'The Christmas lights switch-on in the Market Square, the cathedral’s Christmas food and gift fair, and parking and travel information.'}
];

/* Drive times from Ripon Market Place, worked out with OpenStreetMap routing
   (OSRM, no traffic): 48 bearings sampled every 6 km, then smoothed. Towns,
   railways, the A1(M), the A61 and the coast are placed from real coordinates. */
const ISO={30:'M262.0 115.6C264.1 117.1 265.7 117.3 267.5 117.9C269.3 118.5 271.5 117.9 273.0 119.1C274.5 120.3 275.3 123.3 276.4 125.1C277.4 126.9 277.7 129.4 279.3 130.0C280.9 130.6 283.9 128.8 286.0 128.8C288.1 128.8 290.6 128.9 292.2 129.8C293.8 130.7 294.2 132.8 295.7 134.1C297.2 135.3 299.4 136.1 301.4 137.3C303.4 138.5 306.6 139.3 307.6 141.1C308.6 142.8 308.4 145.5 307.5 147.8C306.6 150.1 304.2 152.7 302.4 154.7C300.6 156.7 298.5 158.5 296.6 160.0C294.8 161.5 292.6 162.7 291.3 163.9C290.0 165.1 288.6 165.7 288.6 167.1C288.7 168.5 289.8 169.8 291.6 172.2C293.4 174.6 297.7 178.5 299.4 181.6C301.1 184.7 302.2 188.4 301.7 190.5C301.2 192.6 298.1 193.1 296.4 194.4C294.7 195.7 292.9 196.7 291.5 198.4C290.1 200.1 289.4 203.0 287.8 204.6C286.2 206.2 284.2 208.1 281.9 208.0C279.6 207.9 276.3 205.6 273.8 204.1C271.3 202.6 269.1 199.6 267.1 199.1C265.1 198.6 263.9 200.3 262.0 201.3C260.1 202.3 258.0 204.6 256.0 205.3C254.0 206.0 251.7 205.9 249.8 205.4C247.9 204.9 246.1 203.6 244.4 202.5C242.7 201.4 241.2 200.0 239.7 198.7C238.2 197.4 236.7 196.2 235.2 194.9C233.7 193.6 231.8 192.8 230.9 191.1C230.0 189.4 229.9 186.8 229.8 184.7C229.7 182.6 231.0 179.9 230.1 178.4C229.2 176.9 225.5 177.0 224.2 175.7C222.9 174.4 221.2 172.6 222.2 170.7C223.2 168.8 228.0 166.0 230.3 164.2C232.6 162.4 234.9 161.3 235.8 160.0C236.7 158.7 235.4 157.6 235.9 156.6C236.4 155.6 237.9 154.7 238.7 153.8C239.5 152.9 240.8 152.4 240.6 151.1C240.4 149.8 238.4 147.8 237.4 145.8C236.4 143.8 235.1 141.2 234.5 138.9C233.9 136.6 233.5 133.8 233.7 131.7C233.9 129.5 234.8 127.5 235.9 126.0C237.1 124.5 239.3 124.7 240.6 122.9C241.9 121.1 242.3 118.1 243.5 115.4C244.7 112.7 245.8 107.6 247.7 106.5C249.6 105.4 252.8 107.1 255.2 108.6C257.6 110.1 259.9 114.0 262.0 115.6Z',
  60:'M262.0 30.2C267.4 30.0 273.3 33.1 278.4 35.6C283.5 38.1 287.5 43.7 292.8 45.1C298.1 46.5 305.1 42.2 310.1 43.8C315.1 45.3 322.7 45.9 323.0 54.4C323.3 62.9 315.8 83.6 312.1 94.7C308.4 105.8 300.6 116.9 300.8 121.2C301.0 125.5 307.9 121.1 313.2 120.7C318.5 120.3 327.6 118.2 332.8 119.1C338.0 120.0 341.6 123.0 344.1 126.0C346.7 129.0 346.4 133.2 348.1 136.9C349.8 140.6 352.8 144.1 354.1 147.9C355.5 151.8 356.6 156.0 356.2 160.0C355.8 164.0 352.7 167.9 351.5 171.8C350.3 175.7 349.8 179.5 349.2 183.4C348.6 187.3 349.0 191.7 347.8 195.5C346.6 199.3 344.1 202.8 342.2 206.3C340.2 209.9 337.7 212.8 336.1 216.8C334.5 220.9 334.0 225.8 332.6 230.6C331.2 235.4 329.9 240.9 327.7 245.7C325.5 250.5 322.5 254.8 319.4 259.4C316.2 264.0 313.1 270.1 308.8 273.1C304.5 276.1 298.9 277.9 293.5 277.6C288.1 277.3 281.9 273.6 276.7 271.5C271.4 269.4 266.6 267.4 262.0 265.2C257.4 263.0 253.0 261.1 249.0 258.5C245.0 255.9 241.4 252.7 238.1 249.4C234.8 246.1 231.8 242.6 229.4 238.8C227.0 235.0 225.6 230.0 223.6 226.5C221.6 223.0 220.6 219.4 217.7 217.7C214.8 215.9 210.1 216.8 206.0 216.0C201.9 215.2 195.4 215.6 192.9 213.1C190.4 210.6 190.9 205.1 190.9 201.0C190.9 196.9 192.5 192.4 193.0 188.6C193.5 184.8 190.9 181.9 194.1 178.2C197.3 174.5 207.0 169.6 212.0 166.6C217.0 163.6 223.4 162.1 223.9 160.0C224.4 157.9 216.3 155.9 215.0 153.8C213.7 151.8 215.6 149.7 216.2 147.7C216.8 145.7 220.8 145.6 218.6 142.0C216.4 138.4 207.1 131.7 202.9 125.9C198.7 120.2 193.8 111.9 193.5 107.5C193.2 103.1 199.2 102.6 201.4 99.4C203.6 96.2 205.7 93.6 206.9 88.2C208.1 82.8 206.6 73.2 208.4 67.2C210.2 61.2 213.7 56.0 217.5 52.5C221.3 49.0 226.7 48.5 231.4 45.9C236.1 43.2 240.7 39.2 245.8 36.6C250.9 34.0 256.6 30.4 262.0 30.2Z',
  90:'M262.0 -32.4C270.3 -34.4 278.5 -33.2 287.8 -35.9C297.1 -38.6 306.5 -43.5 317.8 -48.4C329.1 -53.3 341.6 -60.2 355.4 -65.4C369.1 -70.6 391.7 -85.5 400.3 -79.5C408.9 -73.5 412.3 -51.2 407.2 -29.3C402.1 -7.4 377.0 33.7 369.8 52.2C362.6 70.7 364.6 73.8 364.1 81.7C363.6 89.6 367.2 93.3 367.0 99.4C366.8 105.5 361.0 113.4 362.8 118.3C364.6 123.2 372.1 125.0 377.6 129.0C383.1 133.0 390.9 137.2 395.6 142.4C400.3 147.6 404.0 153.9 405.9 160.0C407.8 166.1 407.3 172.8 407.0 179.1C406.7 185.4 404.8 191.5 404.3 198.1C403.8 204.7 405.2 212.1 404.0 218.8C402.8 225.5 400.9 232.6 397.2 238.1C393.5 243.6 386.8 247.5 381.6 251.8C376.4 256.2 371.9 260.9 366.2 264.2C360.5 267.5 352.0 266.5 347.6 271.5C343.2 276.5 341.9 284.1 339.6 294.4C337.3 304.6 338.0 323.4 333.6 333.0C329.2 342.6 321.3 349.3 313.5 352.1C305.7 354.9 295.6 353.5 287.0 349.6C278.4 345.7 269.3 336.5 262.0 328.8C254.7 321.1 248.9 309.9 243.1 303.3C237.3 296.7 233.0 292.1 227.4 289.3C221.8 286.5 215.3 288.1 209.6 286.4C203.9 284.6 196.7 284.2 193.4 278.8C190.1 273.4 191.7 260.6 189.7 254.2C187.7 247.8 188.0 241.9 181.6 240.4C175.2 238.9 157.2 247.2 151.1 245.1C144.9 243.0 142.4 235.2 144.7 227.7C147.0 220.2 163.4 206.7 164.7 200.3C166.0 193.9 158.5 193.1 152.7 189.3C146.9 185.5 134.6 182.3 129.8 177.4C125.0 172.5 121.5 165.5 124.0 160.0C126.5 154.5 137.3 148.7 145.0 144.6C152.7 140.5 166.0 139.2 170.4 135.5C174.8 131.8 173.3 128.2 171.6 122.5C169.9 116.8 164.5 109.8 160.2 101.2C155.9 92.6 146.4 78.6 146.0 71.0C145.6 63.4 152.0 58.7 157.5 55.5C163.0 52.3 173.4 54.9 179.1 52.0C184.8 49.1 187.3 43.0 191.7 38.2C196.1 33.4 200.8 29.6 205.4 23.4C210.0 17.2 214.0 8.8 219.4 0.9C224.8 -7.0 230.7 -18.4 237.8 -24.0C244.9 -29.6 253.7 -30.4 262.0 -32.4Z'};
const GEO={land:'M0 0L262.4 -73.9 L281.0 -1.7 L304.6 43.7 L309.5 56.3 L319.4 58.4 L330.6 65.8 L352.9 71.0 L375.2 85.7 L385.1 98.3 L390.1 104.6 L402.5 129.9 L414.9 144.6 L440.9 161.4 L437.2 163.5 L427.3 171.9 L431.0 207.6 L454.5 245.4 L464.4 276.9 L444.6 266.4 L419.8 249.6 L409.9 243.3 L380.2 247.5 L351.7 251.7 L364.1 255.9 L386.4 258.0 L413.6 264.3 L426.0 268.5 L442.1 279.0 L465.7 300.0 L491.7 335.7 L506.6 419.8 L506.6 385L0 385Z',sea:'M560 -40L262.4 -73.9 L281.0 -1.7 L304.6 43.7 L309.5 56.3 L319.4 58.4 L330.6 65.8 L352.9 71.0 L375.2 85.7 L385.1 98.3 L390.1 104.6 L402.5 129.9 L414.9 144.6 L440.9 161.4 L437.2 163.5 L427.3 171.9 L431.0 207.6 L454.5 245.4 L464.4 276.9 L444.6 266.4 L419.8 249.6 L409.9 243.3 L380.2 247.5 L351.7 251.7 L364.1 255.9 L386.4 258.0 L413.6 264.3 L426.0 268.5 L442.1 279.0 L465.7 300.0 L491.7 335.7 L506.6 419.8 L560 385Z',coast:'M262.4 -73.9 L281.0 -1.7 L304.6 43.7 L309.5 56.3 L319.4 58.4 L330.6 65.8 L352.9 71.0 L375.2 85.7 L385.1 98.3 L390.1 104.6 L402.5 129.9 L414.9 144.6 L440.9 161.4 L437.2 163.5 L427.3 171.9 L431.0 207.6 L454.5 245.4 L464.4 276.9 L444.6 266.4 L419.8 249.6 L409.9 243.3 L380.2 247.5 L351.7 251.7 L364.1 255.9 L386.4 258.0 L413.6 264.3 L426.0 268.5 L442.1 279.0 L465.7 300.0 L491.7 335.7 L506.6 419.8',
  ecml:'M250.1 -21.4 L254.8 25.7 L259.1 79.3 L272.2 118.7 L280.7 140.7 L315.4 197.5 L318.6 234.1 L309.6 288.9 L320.7 356.7',harr:'M259.0 231.7 L257.5 216.0 L260.3 190.1 L268.5 187.0 L315.4 197.5',old:'M260.3 190.1 L261.2 176.1 L262.6 158.0 L266.2 146.7 L272.2 118.7',
  a1:'M246.3 -21.4 L257.5 25.7 L243.9 96.2 L258.7 125.7 L274.8 156.1 L277.3 169.8 L281.0 203.4 L286.0 241.2 L302.1 289.5 L295.9 356.7',a61:'M259.0 231.7 L259.7 190.3 L262.0 160.0 L284.5 139.8'};
const STATIONS:[number,number][]=[[260.3,190.1],[280.7,140.7],[315.4,197.5],[272.2,118.7]];
const FOUNTAINS:[number,number]=[254.9,165.7];
/* name, x, y, label side, minutes by road */
const TOWNS:[string,number,number,'l'|'r'|'t'|'b'|'bl'|'br',number][]=[
  ['Harrogate',259.7,190.3,'l',22],
  ['Thirsk',284.5,139.8,'br',18],
  ['Masham',245.6,142.0,'bl',17],
  ['York',316.8,197.3,'r',39],
  ['Leeds',259.0,231.5,'r',50],
  ['Northallerton',273.1,117.5,'r',27],
  ['Darlington',258.5,78.8,'l',41],
  ['Middlesbrough',297.8,68.1,'r',47],
  ['Durham',255.6,25.7,'r',62],
  ['Scarborough',401.4,129.2,'r',82],
  ['Whitby',374.6,86.6,'r',80],
  ['Hull',409.7,242.5,'r',91],
  ['Sheffield',268.6,318.7,'r',84],
  ['Skipton',200.9,196.7,'b',44],
  ['Bradford',232.8,231.7,'l',54],
  ['Kendal',110.5,119.8,'b',94],
  ['Malton',352.0,160.1,'b',51],
  ['Hawes',178.6,124.8,'t',55]];

function riponMap(){
  const [cx,cy]=[262,160];
  const lab=(n:string,m:number,x:number,y:number,a:string)=>{const t=`${n} <tspan>${m} min</tspan>`;if(a==='bl'||a==='br')return `<text x="${a==='bl'?x-5:x+5}" y="${y+14}" text-anchor="${a==='bl'?'end':'start'}">${t}</text>`;return a==='t'?`<text x="${x}" y="${y-9}" text-anchor="middle">${t}</text>`:a==='b'?`<text x="${x}" y="${y+17}" text-anchor="middle">${t}</text>`:`<text x="${a==='l'?x-9:x+9}" y="${y+4}" text-anchor="${a==='l'?'end':'start'}">${t}</text>`;};
  return `<figure class="pf-map-card">
  <svg class="pf-map" viewBox="0 0 520 345" role="img" aria-label="Map of Ripon with areas showing where people can drive from in 30, 60 and 90 minutes. Harrogate, Thirsk and Masham are within 30 minutes; York, Leeds, Darlington and Middlesbrough within 60; Scarborough, Whitby and Sheffield within 90.">
    <defs>
      <pattern id="pf-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,.11)"/></pattern>
      <radialGradient id="pf-glow"><stop offset="0" stop-color="#FF2E63" stop-opacity=".28"/><stop offset="1" stop-color="#FF2E63" stop-opacity="0"/></radialGradient>
      <clipPath id="pf-clip"><rect width="520" height="345"/></clipPath>
      <clipPath id="pf-landclip"><path d="${GEO.land}"/></clipPath>
    </defs>
    <g clip-path="url(#pf-clip)">
      <rect class="pf-land" width="520" height="345"/>
      <path class="pf-sea-fill" d="${GEO.sea}"/>
      <path class="pf-coast" d="${GEO.coast}"/>
      <g clip-path="url(#pf-landclip)">
        <path class="pf-iso far" d="${ISO[90]}"/>
        <path class="pf-iso mid" d="${ISO[60]}"/>
        <path class="pf-iso near" d="${ISO[30]}"/>
      </g>
      <text class="pf-downs-l" x="150" y="170" text-anchor="middle">Yorkshire Dales</text>
      <text class="pf-downs-l" x="336" y="104" text-anchor="middle">North York Moors</text>
      <circle cx="${cx}" cy="${cy}" r="60" fill="url(#pf-glow)"/>
      <path class="pf-road" d="${GEO.a1}"/>
      <path class="pf-road" d="${GEO.a61}"/>
      <path class="pf-oldrail" d="${GEO.old}"/>
      <path class="pf-rail" d="${GEO.harr}"/>
      <path id="pf-rail" class="pf-rail" d="${GEO.ecml}"/>
      <circle class="pf-train" r="4.5"><animateMotion dur="9s" repeatCount="indefinite" calcMode="linear"><mpath href="#pf-rail"/></animateMotion></circle>
      <g class="pf-stops">${STATIONS.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
      <g class="pf-town">${TOWNS.map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}${TOWNS.map(([n,x,y,a,m])=>lab(n,m,x,y,a)).join('')}</g>
      <g class="pf-pill"><text x="510" y="20" text-anchor="end">Drive times without traffic</text></g>
      <circle class="pf-pulse" cx="${cx}" cy="${cy}" r="8"/>
      <circle class="pf-home" cx="${cx}" cy="${cy}" r="7"/>
      <g class="pf-home-pill"><rect x="${cx-40}" y="${cy-42}" width="80" height="26" rx="13"/><path d="M${cx-6} ${cy-16.5}l6 6 6-6z"/><text x="${cx}" y="${cy-24}" text-anchor="middle">Ripon</text></g>
    </g>
  </svg>
  <figcaption class="pf-map-key"><span><i class="k-iso near"></i>30 minutes by road</span><span><i class="k-ring"></i>60 and 90 minutes</span><span><i class="k-rail"></i>Railway</span><span><i class="k-old"></i>Ripon line, closed 1967</span><span><i class="k-road"></i>A1(M) and A61</span></figcaption>
</figure>`;
}


/* Two ways to take Placeboard: the live feed on the website a place already
   has, or a new visitor website with the feed built in. Founding place prices,
   excluding VAT; change them here and both pages follow. */
export const PB_PRICES={embed:995,month:100,site:1995};
const gbp=(n:number)=>'£'+n.toLocaleString('en-GB');
const SNIPPET='<div data-placeboard="ripon"></div>\n<script src="https://theplaceboard.com/embed.js" async></script>';
const escH=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

export function pbOptions(){
  return `<div class="pkgs pb-opts">
    <article class="pkg pop reveal">
      <span class="pkg-flag">Keep your website</span>
      <h3 class="pkg-name">Embed the feed</h3>
      <p class="pkg-price">${gbp(PB_PRICES.embed)}<span> a year</span></p>
      <p class="pb-month">or ${gbp(PB_PRICES.month)} a month</p>
      <p class="pkg-for">For places that already have a website they are happy with.</p>
      <ul class="ticks"><li>The full board: one route in for businesses, council approvals, the seasonal plan and the dashboard</li><li>A live What’s On feed on your existing site, added with two lines of code</li><li>A direct feed: approve once and it appears on your site, with nothing to copy or upload</li><li>Matched to your colours, and it fits any page width</li><li>Set up, and your officers trained, within two weeks</li></ul>
      <a class="btn" href="/contact?interest=Placeboard%20embed"><span>Ask about the embed</span></a>
    </article>
    <article class="pkg reveal" style="--i:1">
      <h3 class="pkg-name">A new visitor website</h3>
      <p class="pkg-price"><span>from</span> ${gbp(PB_PRICES.site)}<span> to build</span></p>
      <p class="pkg-for">Then ${gbp(PB_PRICES.embed)} a year or ${gbp(PB_PRICES.month)} a month, hosting included. For places with no visitor website, or one that is past saving.</p>
      <ul class="ticks"><li>Everything in the embed</li><li>A visitor website for the place, designed and built by us</li><li>What’s On, a business directory, getting here and seasonal campaign pages, all fed by the board</li><li>Built to the public sector accessibility standard (WCAG 2.2 AA)</li><li>On your own domain, and the content is yours to keep</li></ul>
      <a class="btn ghost" href="/contact?interest=Placeboard%20website"><span>Ask about a new website</span></a>
    </article>
  </div>
  <p class="pf-flag">Founding place prices for 2027, excluding VAT. Want us to run the campaigns and reporting as well? We quote that separately.</p>`;
}

function embedSection(){
  return `<section class="pf-sec soft" id="embed"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">05 · On your website</span><h2 class="h2">No new website needed. It feeds the one you have.</h2></div><div class="shead-r reveal" style="--i:1"><p>Paste two lines into your existing site and What’s On runs itself. It is a direct feed: when the council approves a request on the board, it appears on your website straight away. Try it: approve a request in section 01 and watch it arrive here.</p></div></div>
  <div class="pb-embed">
    <div class="pf-win reveal"><div class="pf-bar"><i></i><i></i><i></i><span>your-council-website · What’s On</span><b class="pf-live"><i></i>Live</b></div>
      <div class="pb-host"><p class="pb-host-k">Your existing website, your header and footer</p>
        <iframe data-pf-embed src="/embed/ripon" title="What’s on in Ripon, the Placeboard feed" loading="lazy"></iframe>
      </div>
    </div>
    <div class="pb-how reveal" style="--i:1">
      <ol class="pb-steps"><li><b>Paste two lines</b><span>Into any page on any website: WordPress, a council CMS or hand-built. No plug-in, no developer.</span></li><li><b>Approve on the board</b><span>The same approval that sends a post to social media sends it to your website.</span></li><li><b>It appears straight away</b><span>No copying, re-uploading or out-of-date listings. Past events drop off by themselves.</span></li></ol>
      <div class="pb-code"><pre><code>${escH(SNIPPET)}</code></pre><button type="button" class="btn sm ghost" data-pf-copy="${escH(SNIPPET).replace(/"/g,'&quot;')}"><span>Copy code</span></button></div>
    </div>
  </div>
  <p class="pf-flag">The feed shows real Ripon events and example businesses. It is not on any Ripon website.</p>
  <div class="pb-price-h reveal"><span class="eyebrow">Two ways to take it</span><h3 class="h2">Keep your website, or let us build one.</h3></div>
  ${pbOptions()}
</div></section>`;
}

export function placeboardDemo(){
  return `
<header class="demo-hero dark pf-hero"><div class="grain" aria-hidden="true"></div><div class="wrap pf-hero-in">
  <div>
    <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/placeboard">Placeboard</a><span aria-hidden="true">/</span>Demo</nav>
    <h1 class="display split">${split('Your town, on one board',1)}${dot}</h1>
    <p class="lede rise" style="--i:6">A working Placeboard set in Ripon. The map, the drive times and the year of events are real. The businesses, requests and results are examples. Send a request as a local business, approve it as the council, and open the dashboard.</p>
    <div class="actions rise" style="--i:7"><a class="btn" href="#portal"><span>Send a request</span></a><a class="btn ghost" href="/contact?interest=Placeboard"><span>Become a founding place</span></a></div>
    <p class="demo-flag rise" style="--i:8">A demonstration only. Ripon City Council, Ripon BID and Visit Ripon are not involved, and nothing you send goes anywhere.</p>
  </div>
  <div class="pf-map-wrap rise" style="--i:5">${riponMap()}</div>
</div>
<div class="wrap"><dl class="pf-facts rise" style="--i:8">
  <div><dt>Ripon</dt><dd>A cathedral city of 16,589 people (Census 2021)</dd></div>
  <div><dt>Within 30 minutes</dt><dd>Harrogate, Knaresborough, Thirsk, Masham and Wetherby</dd></div>
  <div><dt>Within an hour</dt><dd>Leeds, York, Darlington, Middlesbrough and Skipton</dd></div>
  <div><dt>Getting here</dt><dd>By road. The station closed in 1967, so the nearest are Harrogate and Thirsk</dd></div>
</dl></div></header>

<section class="pf-sec dark pf-portal-sec" id="portal"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">01 · Local businesses</span><h2 class="h2">One fair route in. The council approves everything.</h2></div><div class="shead-r reveal" style="--i:1"><p>Businesses and partners send events, offers, news and listing changes in one place. Each request is logged and goes to the council before anything is published. Try it: send the request, then approve it as the council.</p></div></div>
  ${requestPortal(RIPON)}
  <p class="pf-flag on-dark">Example businesses. Nothing you send here goes anywhere.</p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">02 · The council</span><h2 class="h2">The plan, the approvals and the reports, in one place.</h2></div><div class="shead-r reveal" style="--i:1"><p>Council officers get their own login: where the work is, what needs their sign-off, every document delivered and every monthly report. Approvals are logged with who gave them and when.</p></div></div>
  <div class="reveal">${councilPortal(RIPON)}</div>
  <p class="pf-flag">A sample project. Ripon City Council is not involved.</p>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">03 · The year</span><h2 class="h2">Six seasonal campaigns, one connected story.</h2></div><div class="shead-r reveal" style="--i:1"><p>Built around Ripon’s real calendar: the racecourse, the cathedral, the market and Fountains Abbey. Every season has hero content, a way for businesses to join in and a measure agreed up front.</p></div></div>
  ${year(SEASONS)}
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">04 · Results</span><h2 class="h2">Measured on visitors, not likes.</h2></div><div class="shead-r reveal" style="--i:1"><p>A dashboard the council can open any day, and a two-page report each month: who was reached outside the town, what they clicked through to, and how many businesses took part.</p></div></div>
  <div class="reveal">${dashboard(RIPON)}</div>
</div></section>

${embedSection()}

<section class="cta-band"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">Want Placeboard for your town or city?</h2><p class="lede">We are looking for a small number of founding places to shape it with us.</p></div>
  <div class="actions reveal" style="--i:1"><a class="btn mag" href="/contact?interest=Placeboard"><span>Become a founding place</span></a></div></div></section>`;
}
