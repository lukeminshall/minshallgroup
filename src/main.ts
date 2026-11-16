/* Entry point: styles, shell (nav + footer), forms, router. */
import '@fontsource-variable/archivo/wdth.css';
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

