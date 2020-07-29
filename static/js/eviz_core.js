(function (eviz) {
    'use strict';

    // ! adattaroló
    eviz.data = {}
    eviz.codes = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'IS', 'NO', 'CH', 'MK', 'UK', 'ME', 'RS', 'TR'];
    eviz.countries = ['Belgium', 'Bulgaria', 'Czechia', 'Denmark', 'Germany', 'Estonia', 'Ireland', 'Greece', 'Spain', 'France', 'Croatia', 'Italy', 'Cyprus', 'Latvia', 'Lithuania', 'Luxembourg', 'Hungary', 'Malta', 'Netherlands', 'Austria', 'Poland', 'Portugal', 'Romania', 'Slovenia', 'Slovakia', 'Finland', 'Sweden', 'Iceland', 'Norway', 'Switzerland', 'North Macedonia', 'United Kingdom', 'Montenegro', 'Serbia', 'Turkey'];

    eviz.targetColor = '#27ae60';

    eviz.TRANS_DURATION = 1000;

    eviz.init = function () {
        eviz.initFirst();
        eviz.initSecond();
        eviz.initThird();
    }
}(window.eviz = window.eviz || {}));
