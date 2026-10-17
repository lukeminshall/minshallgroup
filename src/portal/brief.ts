/* =====================================================================
   ONBOARDING QUESTIONNAIRE — replaces the kick-off call.
   Edit freely: each section becomes a step; answers save as the client
   types and land in public.briefs.answers keyed by field id.
   Field types: text, textarea, choice (one), multi (many), files (upload).
   ===================================================================== */
export type Field={id:string,label:string,type:'text'|'textarea'|'choice'|'multi'|'files',hint?:string,options?:string[],required?:boolean,placeholder?:string};
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
  {id:'brand',t:'Look and feel',intro:'Help us match the design to your brand and to sites you like.',fields:[
    {id:'logo',label:'Upload your logo',type:'files',hint:'Best as SVG, PNG or a high-resolution JPG. No logo? Say so below; we can tidy one up.'},
    {id:'colours',label:'Brand colours, if you have them',type:'text',placeholder:'Dark green and cream'},
    {id:'tone',label:'How should the website sound?',type:'choice',options:['Friendly and relaxed','Professional and calm','Premium and polished','Bold and energetic','Warm and caring']},
    {id:'likes',label:'Websites you like, and what you like about them',type:'textarea',placeholder:'example.co.uk: clean, big photos, easy to book'},
    {id:'competitors',label:'Your main competitors’ websites',type:'textarea',placeholder:'One per line'}
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
