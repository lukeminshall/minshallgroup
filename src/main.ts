/* Entry point: styles, shell (nav + footer), forms, router. */
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/manrope';
import './styles.css';
import {buildShell} from './nav';
import {initRouter} from './router';
import {initForms} from './forms';
import {initGlobal} from './motion';
import {initPalette} from './palette';
import {initConsent} from './consent';

buildShell();
initForms();
initRouter();
initGlobal();
initPalette();
initConsent();

/* first visit: the tile draws itself, then the curtain lifts */
const html=document.documentElement;
if(html.classList.contains('loading')){
  setTimeout(()=>{html.classList.add('lifting');
    setTimeout(()=>{html.classList.remove('loading','lifting');try{sessionStorage.setItem('mg-intro','1');}catch{}},600);},700);
}
