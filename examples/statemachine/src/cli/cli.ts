/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

// import chalk from 'chalk';
import { Command } from 'commander';
import { NodeFileSystem } from 'langium/node';
import type { Statemachine } from '../language-server/generated/ast.js';
import { StatemachineLanguageMetaData } from '../language-server/generated/module.js';
import { createStatemachineServices } from '../language-server/statemachine-module.js';
import { extractAstNode } from './cli-util.js';
import { generateCpp } from './generator.js';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { interpretStatemachine } from './interpreter.js';
import { eventsAreValid } from './interpret-util.js';
import chalk from 'chalk';

export const interpret = async (fileName: string, eventNames: string[]): Promise<void> => {
    const services = createStatemachineServices(NodeFileSystem).statemachine;
    const model = await extractAstNode<Statemachine>(fileName, StatemachineLanguageMetaData.fileExtensions, services);
    console.log('Interpreting model...', model.$type, typeof model);
    if (!eventsAreValid(model, eventNames)) {
        console.error('Invalid events provided. Interpretation aborted.');
        return;
    }
    console.log('Interpreting model...', model.$type, typeof model);
    interpretStatemachine(model, eventNames);
};


export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createStatemachineServices(NodeFileSystem).statemachine;
    const statemachine = await extractAstNode<Statemachine>(fileName, StatemachineLanguageMetaData.fileExtensions, services);
    const generatedFilePath = generateCpp(statemachine, fileName, opts.destination);
    console.log(chalk.green(`C++ code generated successfully: ${generatedFilePath}`));
};


export const generateAst = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createStatemachineServices(NodeFileSystem).statemachine;
    const statemachine = await extractAstNode<Statemachine>(fileName, StatemachineLanguageMetaData.fileExtensions, services);
    // serialize & output the model ast
    const serializedAst = services.serializer.JsonSerializer.serialize(statemachine, { sourceText: true, textRegions: true });
    console.log(serializedAst);
};

export type GenerateOptions = {
    destination?: string;
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

const program = new Command();

program.version(JSON.parse(packageContent).version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${StatemachineLanguageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .description('generates a C++ CLI to walk over states')
    .action(generateAction);
program
    .command('generate-ast')
    .argument('<file>', `possible file extensions: ${StatemachineLanguageMetaData.fileExtensions.join(', ')}`)
    .description('Generates a Statemachine AST in JSON format')
    .action(generateAst);

program
    .command('interpret')
    .argument('<file>', `possible file extensions: ${StatemachineLanguageMetaData.fileExtensions.join(', ')}`)
    .argument('<events...>', 'list of events to trigger the statemachine')
    .description('Interpret a statemachine model with a sequence of events')
    .action((file, events) => interpret(file, events));

program.parse(process.argv);

// import { Command } from 'commander';
// import type { Statemachine } from '../language-server/generated/ast.js';
// import { StatemachineLanguageMetaData } from '../language-server/generated/module.js';
// import { NodeFileSystem } from 'langium/node';
// import { createStatemachineServices } from '../language-server/statemachine-module.js';
// import { extractAstNode } from './cli-util.js';
// import { interpretStatemachine } from '../interpreter/interpreter.js';
// import * as url from 'node:url';
// import * as fs from 'node:fs/promises';
// import * as path from 'node:path';
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// export const generateAst = async (fileName: string): Promise<void> => {
//     const services = createStatemachineServices(NodeFileSystem).statemachine;
//     const model = await extractAstNode<Statemachine>(fileName, services);
//     // serialize & output the model ast
//     const serializedAst = services.serializer.JsonSerializer.serialize(model, { sourceText: true, textRegions: true });
//     console.log(serializedAst);
// };

// export const interpret = async (fileName: string): Promise<void> => {
//     const services = createStatemachineServices(NodeFileSystem).Statemachine;
//     const model = await extractAstNode<Statemachine>(fileName, services);
//     interpretStatemachine(model);
// };

// export default async function (): Promise<void> {
//     const program = new Command();

//     const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
//     const packageContent = await fs.readFile(packagePath, 'utf-8');
//     const version = JSON.parse(packageContent).version;
//     program.version(version);

//     const fileExtensions = StatemachineLanguageMetaData.fileExtensions.join(', ');

//     program
//         .command('generate')
//         .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
//         .description('Generates a Statemachine AST in JSON format')
//         .action(generateAst);

//     program
//         .command('interpret')
//         .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
//         .description('Interprets the Statemachine code')
//         .action(interpret);

//     program.parse(process.argv);
// }