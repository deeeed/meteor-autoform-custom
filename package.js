Package.describe({
    name: 'deeeed:autoform-custom',
    summary: 'Simple custom fields/forms for autoform',
    version: '0.2.0',
    git: 'https://github.com/deeeed/meteor-autoform-custom.git'
});

Package.onUse(function (api) {
    api.versionsFrom('1.0.1');

    api.use([
        'templating',
        'ui',
        'tracker',
        'session',
        'deps',
        'ecmascript',
        'aldeed:autoform',
        'tap:i18n'
    ]);
    api.use("stevezhu:lodash");

    api.addFiles([
        'afFormArrayWrapper/afFormArrayWrapper.html',
        'afFormArrayWrapper/afFormArrayWrapper.js',
        'inputTypes/select-buttons/select-buttons.html',
        'inputTypes/select-buttons/select-buttons.css',
        'inputTypes/select-buttons/select-buttons.js',
        'inputTypes/select-pictures/select-pictures.html',
        'inputTypes/select-pictures/select-pictures.css',
        'inputTypes/select-pictures/select-pictures.js',
        'inputTypes/select-progressive/select-progressive.css',
        'inputTypes/select-progressive/select-progressive.html',
        'inputTypes/select-progressive/select-progressive.js',
        'inputTypes/smartdate/smartdate.html',
        'inputTypes/smartdate/smartdate.js'
    ], 'client');
});
