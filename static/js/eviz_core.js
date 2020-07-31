(function (eviz) {
    'use strict';

    // ! adattaroló
    eviz.data = {}
    eviz.codes = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'IS', 'NO', 'CH', 'MK', 'UK', 'ME', 'RS', 'TR'];
    eviz.countries = ['Belgium', 'Bulgaria', 'Czechia', 'Denmark', 'Germany', 'Estonia', 'Ireland', 'Greece', 'Spain', 'France', 'Croatia', 'Italy', 'Cyprus', 'Latvia', 'Lithuania', 'Luxembourg', 'Hungary', 'Malta', 'Netherlands', 'Austria', 'Poland', 'Portugal', 'Romania', 'Slovenia', 'Slovakia', 'Finland', 'Sweden', 'Iceland', 'Norway', 'Switzerland', 'North Macedonia', 'United Kingdom', 'Montenegro', 'Serbia', 'Turkey'];

    eviz.targetColor = '#27ae60';

    eviz.TRANS_DURATION = 1000;

    eviz.decideGroup = function (code) {
        switch (code) {
            case 'DE':
            case 'FR':
            case 'UK':
            case 'IT':
            case 'ES':
            case 'PT':
            case 'NL':
            case 'BE':
            case 'IE':
            case 'CH':
            case 'NL':
            case 'LU':
            case 'MT':
            case 'DK':
            case 'AT':
            case 'LI':
                return 'West';

            case 'PL':
            case 'CZ':
            case 'RO':
            case 'HU':
            case 'SK':
            case 'SI':
            case 'BG':
            case 'HR':
            case 'LT':
            case 'EE':
            case 'LV':
            case 'SE':
            case 'FI':
            case 'EL':
            case 'CY':
                return 'East';

            default:
                return 'Non-EU';
        }
    }

    eviz.init = function () {
        eviz.initFirst();
        eviz.initSecond();
        eviz.initThird();
        eviz.initFourth();
    }
}(window.eviz = window.eviz || {}));
