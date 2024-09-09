// import { EmptyFileSystem } from 'langium';
// import { toString, type Generated } from 'langium/generate';
// import { parseHelper } from 'langium/test';
// import { describe, expect, test } from 'vitest';
// import { generateCppContent } from '../src/cli/generator.js';
// import type { Statemachine } from '../src/language-server/generated/ast.js';
// import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
// import { normalizeCode } from './util.js';
// import * as fs from 'fs';
// import * as path from 'path';
// import { extractAstNode } from '../src/cli/cli-util.js';
// import { interpretStatemachineStatic } from '../src/cli/interpreter.js';

// const examplesDir = path.resolve(__dirname, '../test/sampleProgramsGeneratorTestInput');
// const expectedOutputDir = path.resolve(__dirname, '../test/sampleProgramsGeneratorTestExpectedOutput');

// function readExampleFile(fileName: string, dir: string): string {
//     return fs.readFileSync(path.join(dir, fileName), 'utf-8');
// }

// const testCases = [
//     {
//         inputFile: 'homesecuritysystem.statemachine',
//         expectedOutputFile: 'homesecuritysystem.cpp',
//         expectedInitialState: 'Idle',
//         expectedAttributes: { isOn: false }, //
//         inputEvents: ['resetSystem', 'disarmSystem', 'triggerAlarm']
//     },
//     {
//         inputFile: 'smartthermostat.statemachine',
//         expectedOutputFile: 'smartthermostat.cpp',
//         expectedInitialState: 'Idle',
//         expectedAttributes: { temperature: 20 },
//         inputEvents: ['increaseTemperature', 'decreaseTemperature', 'setMode', 'reset']
//     },
//     {
//         inputFile: 'trafficlight.statemachine',
//         expectedOutputFile: 'trafficlight.cpp',
//         expectedInitialState: 'RedLight',
//         expectedAttributes: { timeElapsedInSec: 6, },
//         inputEvents: ['next', 'switchMode']
//     },
//     {
//         inputFile: 'vendingmachine.statemachine',
//         expectedOutputFile: 'vendingmachine.cpp',
//         expectedInitialState: 'Idle',
//         expectedAttributes: { balance: 0 },
//         inputEvents: ['insertCoin', 'selectItem', 'dispenseItem', 'cancel']
//     },
//     {
//         inputFile: 'homeautomation.statemachine',
//         expectedOutputFile: 'homeautomation.cpp',
//         expectedInitialState: 'Off',
//         expectedAttributes: { lightsOn: false },
//         inputEvents: ['motionDetected', 'noMotion', 'lightOn', 'lightOff', 'temperatureRise', 'temperatureDrop']
//     }
// ];

// describe('Tests the code generator', () => {
//     const services = createStatemachineServices(EmptyFileSystem).statemachine;
//     const parse = parseHelper<Statemachine>(services);

//     testCases.forEach(({ inputFile, expectedOutputFile, expectedInitialState, expectedAttributes, inputEvents }) => {
//         test(`Generation test for ${inputFile}`, async () => {
//             const input = readExampleFile(inputFile, examplesDir);
//             const expectedOutput = readExampleFile(expectedOutputFile, expectedOutputDir);

//             const model = await parse(input, { validation: true });

//             // Validate the state machine
//             expect(model.diagnostics).toHaveLength(0);

//             // Interpret the state machine
//             const ast = model.parseResult.value;
//             const context = await interpretStatemachineStatic(ast, inputEvents);

//             // Check the initial state and attributes
//             expect(context.currentState?.name).toBe(expectedInitialState);
//             for (const [key, value] of Object.entries(expectedAttributes)) {
//                 expect(context.env.get(key)).toBe(value);
//             }

//             const generated: Generated = generateCppContent({
//                 statemachine: ast,
//                 destination: undefined!, // not needed
//                 fileName: undefined!,    // not needed
//             });

//             const text = toString(generated);
//             const normalizedText = normalizeCode(text);
//             const normalizedExpectedOutput = normalizeCode(expectedOutput);

//             expect(normalizedText).toBe(normalizedExpectedOutput);
//         });
//     });
// });// import { EmptyFileSystem } from 'langium';
// // import { toString, type Generated } from 'langium/generate';
// // import { parseHelper } from 'langium/test';
// // import { describe, expect, test } from 'vitest';
// // import { generateCppContent } from '../src/cli/generator.js';
// // import type { Statemachine } from '../src/language-server/generated/ast.js';
// // import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
// // import { normalizeCode } from './util.js';
// // import * as fs from 'fs';
// // import * as path from 'path';
// // import { extractAstNode } from '../src/cli/cli-util.js';
// // import { interpretStatemachineStatic } from '../src/cli/interpreter.js';

// // const examplesDir = path.resolve(__dirname, '../test/generatorTestInput');
// // const expectedOutputDir = path.resolve(__dirname, '../test/generatorTestExpectedOutput');

// // function readExampleFile(fileName: string, dir: string): string {
// //     return fs.readFileSync(path.join(dir, fileName), 'utf-8');
// // }

// // const testCases = [
// //     {
// //         inputFile: 'homesecuritysystem.statemachine',
// //         expectedOutputFile: 'homesecuritysystem.cpp',
// //         expectedInitialState: 'Off',
// //         expectedAttributes: { isOn: false } //
// //     },
// //     {
// //         inputFile: 'smartthermostat.statemachine',
// //         expectedOutputFile: 'smartthermostat.cpp',
// //         expectedInitialState: 'Idle',
// //         expectedAttributes: { temperature: 20 } //
// //     },
// //     {
// //         inputFile: 'trafficlight.statemachine',
// //         expectedOutputFile: 'trafficlight.cpp',
// //         expectedInitialState: 'Red',
// //         expectedAttributes: { isFlashing: false } //
// //     },
// //     {
// //         inputFile: 'vendingmachine.statemachine',
// //         expectedOutputFile: 'vendingmachine.cpp',
// //         expectedInitialState: 'Idle',
// //         expectedAttributes: { balance: 0 } //
// //     },
// //     {
// //         inputFile: 'homeautomation.statemachine',
// //         expectedOutputFile: 'homeautomation.cpp',
// //         expectedInitialState: 'Off',
// //         expectedAttributes: { lightsOn: false } //
// //     }
// // ];

// // describe('Tests the code generator', () => {
// //     const services = createStatemachineServices(EmptyFileSystem).statemachine;
// //     const parse = parseHelper<Statemachine>(services);

// //     testCases.forEach(({ inputFile, expectedOutputFile, expectedInitialState, expectedAttributes }) => {
// //         test(`Generation test for ${inputFile}`, async () => {
// //             const input = readExampleFile(inputFile, examplesDir);
// //             const expectedOutput = readExampleFile(expectedOutputFile, expectedOutputDir);

// //             const ast = await parse(input);

// //             // Validate the state machine
// //             const validationErrors = services.validation.DocumentValidator.validate(ast.parseResult.value).diagnostics;
// //             expect(validationErrors.length).toBe(0);

// //             // Interpret the state machine
// //             const model = await extractAstNode<Statemachine>(inputFile, ['.statemachine'], services);
// //             const context = await interpretStatemachineStatic(model, []);

// //             // Check the initial state and attributes
// //             expect(context.currentState?.name).toBe(expectedInitialState);
// //             for (const [key, value] of Object.entries(expectedAttributes)) {
// //                 expect(context.env.get(key)).toBe(value);
// //             }

// //             const generated: Generated = generateCppContent({
// //                 statemachine: ast.parseResult.value,
// //                 destination: undefined!, // not needed
// //                 fileName: undefined!,    // not needed
// //             });

// //             const text = toString(generated);
// //             const normalizedText = normalizeCode(text);
// //             const normalizedExpectedOutput = normalizeCode(expectedOutput);

// //             expect(normalizedText).toBe(normalizedExpectedOutput);
// //         });
// //     });
// // });