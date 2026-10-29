/* =====================================================================
   ONBOARDING QUESTIONNAIRE — replaces the kick-off call.
   Edit freely: each section becomes a step; answers save as the client
   types and land in public.briefs.answers keyed by field id.
   Field types: text, textarea, choice (one), multi (many, `max` caps it),
   files (upload), visual (pick one style tile), scale (this-or-that sliders,
   1 to 5 between two words), examples (up to three sites and what they like).
   ===================================================================== */
export type Style={t:string,d:string,bg:string,ink:string,accent:string,font:string};
export type Field={inspire?:boolean,id:string,label:string,type:'text'|'textarea'|'choice'|'multi'|'files'|'visual'|'scale'|'examples',hint?:string,options?:string[],required?:boolean,placeholder?:string,max?:number,styles?:Style[],pairs?:[string,string][]};

/* style directions shown as small tiles in the brief */
/* what a client confirms before uploading anything that may appear on their website */
export const IMAGE_DECLARATION='I confirm that I own these images, logos and documents or have permission to use them on our website. This includes permission from anyone who can be recognised in a photo, and any licence needed for stock or professionally taken photos. Minshall Group may crop, edit and optimise them for the website.';

export const STYLES:Style[]=[
  {t:'Warm and crafted',d:'Natural colours, big photos, a handmade feel',bg:'#F3EDE3',ink:'#23392D',accent:'#B5552B',font:'Georgia, serif'},
  {t:'Clean and modern',d:'Lots of white space, simple shapes, crisp type',bg:'#FFFFFF',ink:'#14171A',accent:'#2F6FEB',font:'system-ui, sans-serif'},
  {t:'Bold and confident',d:'Strong colour, big headlines, plenty of energy',bg:'#121316',ink:'#FFFFFF',accent:'#FFC531',font:'Impact, sans-serif'},
  {t:'Premium and editorial',d:'Elegant type, dark tones, magazine layouts',bg:'#0A1A3F',ink:'#FFFFFF',accent:'#E9A27E',font:'Georgia, serif'},
  {t:'Calm and caring',d:'Soft colours, gentle shapes, reassuring words',bg:'#EEF4F1',ink:'#1F4A44',accent:'#E9A27E',font:'system-ui, sans-serif'}
];
export type Section={id:string,t:string,intro:string,fields:Field[]};

export const BRIEF:Section[]=[
  {id:'business',t:'Your business',intro:'Tell us who you are and who you serve. Plain words are best: write it as you would say it to a customer.',fields:[
    {id:'what',label:'What does your business do, in one or two sentences?',type:'textarea',required:true,placeholder:'We are a family-run café in Harrogate serving breakfast, lunch and cakes, with outdoor seating.'},
    {id:'customers',label:'Who are your customers?',type:'textarea',required:true,placeholder:'Local families, office workers at lunchtime, walkers at weekends.'},
    {id:'areas',label:'Where do you work or serve?',type:'text',placeholder:'Harrogate and Knaresborough'},
    {id:'different',label:'What makes you different from competitors?',type:'textarea',placeholder:'Everything is baked on site; dog friendly; open late on Fridays.'}
  ]},
  {id:'goals',t:'What the website must do',intro:'A good website has one main job. Tell us what yours is.',fields:[
    {id:'action',label:'What is the main thing you want visitors to do?',type:'choice',required:true,options:['Call us','Fill in an enquiry form','Book online','Buy online','Visit us in person','Request a quote','Donate or sign up']},
    {id:'top',label:'Your top three services or products, most important first',type:'textarea',required:true,placeholder:'1. Breakfast and brunch\n2. Celebration cakes to order\n3. Private hire in the evenings'},
    {id:'offers',label:'Any offers, prices or packages to show?',type:'textarea',hint:'Optional. Prices shown clearly often increase enquiries.'}
  ]},
  {id:'brand',t:'Your brand',intro:'The basics we need to match your brand.',fields:[
    {id:'logo',label:'Upload your logo',type:'files',hint:'Best as SVG, PNG or a high-resolution JPG. No logo? Say so below; we can tidy one up.'},
    {id:'colours',label:'Brand colours, if you have them',type:'text',placeholder:'Dark green and cream'},
    {id:'tone',label:'How should the website sound?',type:'choice',options:['Friendly and relaxed','Professional and calm','Premium and polished','Bold and energetic','Warm and caring']},
    {id:'words',label:'Pick three words you would like people to use about your business',type:'multi',max:3,options:['Friendly','Expert','Trusted','Local','Modern','Traditional','Premium','Affordable','Creative','Calm','Fun','Bold','Caring','Quick','Independent','Family-run']}
  ]},
  {id:'style',t:'Your style',intro:'Most people find it easier to react to things than describe them. There are no wrong answers, and you can change your mind later.',fields:[
    {id:'direction',label:'Which of these feels most like you?',type:'visual',required:true,hint:'Pick the closest. We will make it your own.'},
    {id:'scales',label:'This or that',type:'scale',hint:'Slide towards the side that suits you. Leave it in the middle if you do not mind.',pairs:[['Classic','Modern'],['Minimal','Rich and detailed'],['Calm','Energetic'],['Light','Dark'],['Photo-led','Words-led'],['Serious','Playful']]},
    {id:'examples',label:'Websites you like, and what you like about each',type:'examples',hint:'Any websites at all, not only ones in your industry. What you like can be small: the colours, the photos, how easy it is to book.'},
    {id:'mood',label:'Upload images that capture the feel you want (optional)',type:'files',inspire:true,hint:'Screenshots, photos, Pinterest or Instagram saves, a leaflet you love. These are for inspiration only: we will never put them on your website.'},
    {id:'dislikes',label:'Anything you definitely do not want?',type:'textarea',placeholder:'No stock photos of people shaking hands. Nothing too corporate.'},
    {id:'photos',label:'Photography',type:'choice',options:['We have good photos of our own','We will take new photos','We would like a professional shoot (we can arrange one)','Please use carefully chosen stock photos','Not sure yet']},
    {id:'feel',label:'When someone lands on your homepage, what should they feel in the first five seconds?',type:'textarea',placeholder:'That we are friendly, local and easy to book with.'},
    {id:'competitors',label:'Your main competitors’ websites',type:'textarea',placeholder:'One per line. Tell us if there is anything they do well or badly.'}
  ]},
  {id:'pages',t:'Pages and content',intro:'Choose the pages you need. We will suggest structure and wording; you approve everything before it goes live.',fields:[
    {id:'pages',label:'Which pages do you need?',type:'multi',required:true,options:['Home','About us','Services','Individual service pages','Prices','Gallery or portfolio','Reviews','Team','FAQs','News or blog','Booking','Shop','Contact','Privacy notice']},
    {id:'pagesNotes',label:'Anything specific for particular pages?',type:'textarea',placeholder:'Services: list each treatment with price and duration.'},
    {id:'writer',label:'Who will write the words?',type:'choice',required:true,options:['We will provide the text','Please write it for us (copywriting add-on)','Reuse and improve the text from our current site']},
    {id:'content',label:'Upload photos, text or documents',type:'files',hint:'Photos of your work, premises, team or products. Any existing brochures or price lists help too.'}
  ]},
  {id:'practical',t:'Practical details',intro:'The details customers look for. Please do not put any passwords here; we will send you a secure way to share access.',fields:[
    {id:'enquiryEmail',label:'Which email address should enquiries go to?',type:'text',required:true,placeholder:'hello@yourbusiness.co.uk'},
    {id:'phone',label:'Phone number to show',type:'text'},
    {id:'address',label:'Address to show (if any)',type:'textarea'},
    {id:'hours',label:'Opening hours',type:'textarea',placeholder:'Mon–Fri 8am–4pm, Sat 9am–3pm, closed Sunday'},
    {id:'social',label:'Social media links',type:'textarea',placeholder:'Instagram, Facebook, LinkedIn links, one per line'},
    {id:'domainAccess',label:'Where is your domain or current website managed?',type:'choice',options:['GoDaddy','123 Reg','IONOS','Squarespace or Wix','Someone else manages it','Not sure','We need a new domain']},
    {id:'deadline',label:'Is there a date you need it live by?',type:'text',placeholder:'Before our spring opening, 1 March'},
    {id:'anything',label:'Anything else we should know?',type:'textarea'}
  ]}
];

export const STAGES=[
  {id:'onboarding',t:'Onboarding',d:'You answer the onboarding questions and upload your content.'},
  {id:'design',t:'Design',d:'We design your home page and key pages. You review the preview and approve.'},
  {id:'build',t:'Build',d:'We build the rest of the site, forms and features.'},
  {id:'review',t:'Review',d:'You check everything and raise any final changes.'},
  {id:'live',t:'Live',d:'Your site goes live and we track its performance each month.'}
];

/* ---------- commercial strategy and digital projects ---------- */
const ORG:Section={id:'org',t:'Your organisation',intro:'The context we need before we start. Plain words are best.',fields:[
  {id:'what',label:'What does your organisation do, and for whom?',type:'textarea',required:true,placeholder:'We run four physiotherapy clinics in Leeds, mostly self-pay and insured patients.'},
  {id:'stage',label:'Where are you now?',type:'choice',options:['Early stage, pre-revenue','Growing, under £1m revenue','Established, £1m to £10m','Larger, over £10m','Public sector or charity']},
  {id:'who',label:'Who is the main contact, and who else should be involved?',type:'textarea',placeholder:'Me as sponsor, plus our operations lead and finance director.'}
]};
const PRACTICAL:Section={id:'practical',t:'Practicalities',intro:'How you like to work, and anything we should read first.',fields:[
  {id:'deadline',label:'Is there a date this needs to land by?',type:'text',placeholder:'Board meeting on 15 January'},
  {id:'budget',label:'Budget range, if set',type:'choice',options:['Under £10k','£10k to £25k','£25k to £50k','£50k to £100k','Over £100k','Not set yet']},
  {id:'docs',label:'Upload anything useful',type:'files',inspire:true,hint:'Plans, board papers, data extracts, previous reports. Only what you are happy for us to read; please do not upload patient-identifiable data.'},
  {id:'anything',label:'Anything else we should know?',type:'textarea'}
]};
export const STRATEGY_BRIEF:Section[]=[ORG,
  {id:'outcome',t:'The outcome',intro:'Every project we run is measured by a number. Tell us yours.',fields:[
    {id:'goal',label:'What do you want to change, and why now?',type:'textarea',required:true,placeholder:'Grow self-pay revenue at our clinics by 30% within two years.'},
    {id:'metric',label:'Which number would show this has worked?',type:'text',required:true,placeholder:'Monthly self-pay revenue, currently about £80k'},
    {id:'focus',label:'What do you need from us?',type:'multi',options:['Market and opportunity sizing','Site selection and catchment','Go-to-market plan','Selling into the NHS','Business case or investment case','Pricing and proposition','Sponsorship and commercial rights','Board-ready recommendations']},
    {id:'decision',label:'What decision will this support, and who makes it?',type:'textarea',placeholder:'Whether to open a fifth clinic; the board decides in March.'}
  ]},
  {id:'context',t:'Context and constraints',intro:'What we should know about the market, the competition and the limits we are working within.',fields:[
    {id:'market',label:'Who are your customers or commissioners, and who are your competitors?',type:'textarea',required:true},
    {id:'tried',label:'What have you already tried or ruled out?',type:'textarea'},
    {id:'constraints',label:'Constraints we should respect',type:'textarea',placeholder:'Capital limited to £500k; must stay within West Yorkshire.'},
    {id:'data',label:'What data do you have that we can use?',type:'multi',options:['Sales or revenue data','Customer or patient numbers (anonymised)','Marketing and web analytics','Market research','Financial accounts and forecasts','Not much yet']}
  ]},PRACTICAL];
export const DIGITAL_BRIEF:Section[]=[ORG,
  {id:'problem',t:'The problem and the people',intro:'Good digital work starts with the people who will use it and the number it should move.',fields:[
    {id:'goal',label:'What problem are we solving, and why now?',type:'textarea',required:true,placeholder:'Patients cannot book or rebook online, so our reception team spends half the day on the phone.'},
    {id:'metric',label:'Which number would show this has worked?',type:'text',required:true,placeholder:'Share of bookings made online, currently 10%'},
    {id:'users',label:'Who will use it?',type:'textarea',required:true,placeholder:'Patients booking appointments; clinicians checking their diary; reception staff.'},
    {id:'focus',label:'What do you need from us?',type:'multi',options:['Discovery and user research','Product or service design','Web platform or portal','App','Integrations with existing systems','Data and dashboards','AI and automation','Ongoing support']}
  ]},
  {id:'systems',t:'Systems and data',intro:'What already exists, so we connect to it rather than replace it.',fields:[
    {id:'current',label:'Which systems do you use today?',type:'textarea',required:true,placeholder:'Cliniko for bookings, Xero for accounts, a WordPress website.'},
    {id:'dataTypes',label:'Will it handle any of these?',type:'multi',options:['Personal data','Health data','Payments','None of these']},
    {id:'assurance',label:'Any standards or assurance it must meet?',type:'multi',options:['DTAC','DSPT','DCB0129 / DCB0160','Cyber Essentials','Accessibility (WCAG 2.2)','Not sure']},
    {id:'tech',label:'Who looks after your technology now?',type:'choice',options:['An in-house team','An outside supplier','A person who helps part-time','Nobody really']}
  ]},PRACTICAL];
export const STRATEGY_STAGES=[
  {id:'onboarding',t:'Kick-off',d:'You answer the brief and share what you have.'},
  {id:'discovery',t:'Discovery',d:'We interview, gather data and agree the questions that matter.'},
  {id:'analysis',t:'Analysis',d:'We size the opportunity and test the options.'},
  {id:'recommendations',t:'Recommendations',d:'We present what to do, the case for it and the plan.'},
  {id:'complete',t:'Complete',d:'Final report delivered. We track the numbers with you.'}
];
export const DIGITAL_STAGES=[
  {id:'onboarding',t:'Kick-off',d:'You answer the brief and share what you have.'},
  {id:'discovery',t:'Discovery',d:'We meet your users, map your systems and agree the first release.'},
  {id:'design',t:'Design',d:'We design and test it with real users. You approve.'},
  {id:'build',t:'Build',d:'We build in usable slices you can see as we go.'},
  {id:'live',t:'Live',d:'It is in use, and we measure the number it was built to move.'}
];
export const SERVICES:Record<string,{t:string,short:string,d:string}>={
  website:{t:'Small business website',short:'Website',d:'A new or refreshed website, fixed price.'},
  strategy:{t:'Commercial strategy',short:'Commercial strategy',d:'Find the growth, enter a market, make the case.'},
  digital:{t:'Digital, data and AI',short:'Digital',d:'Platforms, portals, data and AI that move a number.'}
};
export const svc=(p:any)=>p?.service||'website';
export const briefFor=(p:any)=>svc(p)==='strategy'?STRATEGY_BRIEF:svc(p)==='digital'?DIGITAL_BRIEF:BRIEF;
export const stagesFor=(p:any)=>svc(p)==='strategy'?STRATEGY_STAGES:svc(p)==='digital'?DIGITAL_STAGES:STAGES;
