/* Entry point: styles, shell (nav + footer), forms, router. */
import '@fontsource-variable/archivo/wdth.css';
import './styles.css';
import {buildShell} from './nav';
import {initRouter} from './router';
import {initForms} from './forms';
import {initShare} from './share';
import {initGlobal} from './motion';
import {initPalette} from './palette';
import {initConsent} from './consent';

buildShell();
initForms();
initShare();
initRouter();
initGlobal();
initPalette();
initConsent();

