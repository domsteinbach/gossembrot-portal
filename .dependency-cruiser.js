module.exports = {
    options: {
        tsConfig: { fileName: 'tsconfig.app.json' }, // adjust if different
        includeOnly: '\\.ts$',
        exclude: 'node_modules|dist|coverage',
        outputType: 'dot'
    }
};
