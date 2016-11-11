Package.describe({
    name: 'deeeed:autoform-custom',
    summary: 'Simple custom fields/forms for autoform',
    version: '0.1.0',
    git: 'https://github.com/deeeed/meteor-autoform-custom.git'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.1');

    api.use([
        'templating',
        'aldeed:autoform@4.0.0 || 5.0.0'
    ], 'client');

    api.addFiles([
        'afFormArrayWrapper/afFormArrayWrapper.html',
        'afFormArrayWrapper/afFormArrayWrapper.js',
        'inputTypes/select-buttons/select-buttons.html',
        'inputTypes/select-buttons/select-buttons.css',
        'inputTypes/select-buttons/select-buttons.js',
        'inputTypes/smartdate/smartdate.html',
        'inputTypes/smartdate/smartdate.js'
    ], 'client');
});
