import shell from 'shelljs'
// import shell from 'shelljs'

// copy workers to public
shell.mkdir('-p', './public/monaco-editor-wrapper/dist/workers');
shell.cp('-fr', './node_modules/monaco-editor-wrapper/dist/workers/editorWorker-es.js', './public/monaco-editor-wrapper/dist/workers/editorWorker-es.js');

// copy workers to public
shell.mkdir('-p', './public/monaco-editor-workers/workers');
shell.cp(
    '-fr',
    './node_modules/monaco-editor-workers/dist/index.js',
    './public/monaco-editor-workers/index.js'
);
shell.cp(
    '-fr',
    './node_modules/monaco-editor-workers/dist/workers/editorWorker-es.js',
    './public/monaco-editor-workers/workers/editorWorker-es.js'
);
shell.cp(
    '-fr',
    './node_modules/monaco-editor-workers/dist/workers/editorWorker-iife.js',
    './public/monaco-editor-workers/workers/editorWorker-iife.js'
);