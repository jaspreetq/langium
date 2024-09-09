// /******************************************************************************
//  * Copyright 2022 TypeFox GmbH
//  * This program and the accompanying materials are made available under the
//  * terms of the MIT License, which is available in the project root.s
//  ******************************************************************************/
import { EmptyFileSystem } from 'langium';
import { toString, type Generated } from 'langium/generate';
import { parseHelper } from 'langium/test';
import { describe, expect, test } from 'vitest';
import { generateCppContent } from '../src/cli/generator.js';
import type { Statemachine } from '../src/language-server/generated/ast.js';
import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
import { normalizeCode } from './util.js';
import * as fs from 'fs';
import * as path from 'path';

/* New Code by @jaspreetq ***************************/
const examplesDir = path.resolve(__dirname, '../test/featureSpecificTestInput');
const expectedOutputDir = path.resolve(__dirname, '../test/featureSpecificTestOutput');

function readExampleFile(fileName: string, dir: string): string {
    return fs.readFileSync(path.join(dir, fileName), 'utf-8');
}

const testCases = [
    { inputFile: 'BooleanSwitch.statemachine', expectedOutputFile: 'BooleanSwitch.cpp' },
    { inputFile: 'ComplexLogicSwitch.statemachine', expectedOutputFile: 'ComplexLogicSwitch.cpp' },
    { inputFile: 'GuardedSwitch.statemachine', expectedOutputFile: 'GuardedSwitch.cpp' },
    { inputFile: 'LightSwitch.statemachine', expectedOutputFile: 'LightSwitch.cpp' },
    { inputFile: 'TimeoutSwitch.statemachine', expectedOutputFile: 'TimeoutSwitch.cpp' },
];

/********************************************/
describe('Tests the code generator', () => {
    /* Old Code by @Eclipse-Langium Team ***********************/
    const services = createStatemachineServices(EmptyFileSystem).statemachine;
    const parse = parseHelper<Statemachine>(services);

    testCases.forEach(({ inputFile, expectedOutputFile }) => {
        test(`Generation test for ${inputFile}`, async () => {
            const input = readExampleFile(inputFile, examplesDir);
            const expectedOutput = readExampleFile(expectedOutputFile, expectedOutputDir);

            const ast = await parse(input);

            const generated: Generated = generateCppContent({
                statemachine: ast.parseResult.value,
                destination: undefined!, // not needed
                fileName: undefined!,    // not needed
            });

            const text = toString(generated);
            /********************************************/

            /* New Changes by @jaspreetq ***************************/
            const normalizedText = normalizeCode(text);
            const normalizedExpectedOutput = normalizeCode(expectedOutput);

            expect(normalizedText).toBe(normalizedExpectedOutput);
            /****************************************/
        });
    });
});

// import { describe, expect, test } from 'vitest';
// import { generateCppContent } from '../src/cli/generator.js';
// import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
// import { parseHelper } from 'langium/test';
// import { normalizeCode } from './util.js';
// import * as fs from 'fs';
// import * as path from 'path';
// import { Statemachine } from '../src/language-server/generated/ast.js';

// const examplesDir = path.resolve(__dirname, '../test/generatorTestInput');
// const expectedOutputDir = path.resolve(__dirname, '../test/generatorTestExpectedOutput');

// function readExampleFile(fileName: string, dir: string): string {
//     return fs.readFileSync(path.join(dir, fileName), 'utf-8');
// }

// const testCases = [
//     {
//         inputFile: 'LightSwitch.statemachine',
//         fileContent: `
//             statemachine LightSwitch
//                 events
//                     toggle
//                 attributes
//                     isOn: bool = false
//                 initialState Off
//                 state Off
//                     toggle => On with{
//                         isOn = true
//                     };
//                 end
//                 state On
//                     toggle => Off with{
//                         isOn = false
//                     };
//                 end
//         `,
//         expectedOutputFile: 'LightSwitch.cpp'
//     },
//     {
//         inputFile: 'TimeoutSwitch.statemachine',
//         fileContent: `
//             statemachine TimeoutSwitch
//                 events
//                     toggle
//                 attributes
//                     isOn: bool = false
//                 initialState Off
//                 state Off
//                     toggle => On with{
//                         isOn = true
//                     };
//                 end
//                 state On
//                     toggle => Off with{
//                         isOn = false
//                         setTimeout(1000)
//                     };
//                 end
//         `,
//         expectedOutputFile: 'TimeoutSwitch.cpp'
//     },
//     {
//         inputFile: 'BooleanSwitch.statemachine',
//         fileContent: `
//             statemachine BooleanSwitch
//                 events
//                     toggle
//                 attributes
//                     count: int = 0
//                     isOn: bool = false
//                     isActive: bool = true
//                 initialState Off
//                 state Off
//                     toggle => On with{
//                         isOn = true
//                         count = count + 1
//                         isActive = isOn && (count > 0)
//                     };
//                 end
//                 state On
//                     toggle => Off with{
//                         isOn = false
//                         count = count * 2
//                         isActive = isOn || (count < 5)
//                     };
//                 end
//         `,
//         expectedOutputFile: 'BooleanSwitch.cpp'
//     },
//     {
//         inputFile: 'ComplexLogicSwitch.statemachine',
//         fileContent: `
//             statemachine ComplexLogicSwitch
//                 events
//                     toggle
//                     reset
//                 attributes
//                     count: int = 0
//                     isOn: bool = false
//                     isActive: bool = true
//                 initialState Off
//                 state Off
//                     toggle => On with{
//                         isOn = true
//                         count = count + 1
//                         isActive = isOn && (count > 0)
//                     };
//                 end
//                 state On
//                     toggle => Off with{
//                         isOn = false
//                         count = count * 2
//                         isActive = isOn || (count < 5)
//                     };
//                     reset => Off with{
//                         isOn = false
//                         count = 0
//                         isActive = false
//                     };
//                 end
//         `,
//         expectedOutputFile: 'ComplexLogicSwitch.cpp'
//     },
//     {
//         inputFile: 'GuardedSwitch.statemachine',
//         fileContent: `
//             statemachine GuardedSwitch
//                 events
//                     toggle
//                     reset
//                 attributes
//                     count: int = 0
//                     isOn: bool = false
//                     isActive: bool = true
//                 initialState Off
//                 state Off
//                     toggle when(count < 3) => On with{
//                         isOn = true
//                         count = count + 1
//                     };
//                 end
//                 state On
//                     toggle => Off with{
//                         isOn = false
//                         count = count * 2
//                     };
//                     reset => Off with{
//                         isOn = false
//                         count = 0
//                         isActive = false
//                     };
//                 end
//         `,
//         expectedOutputFile: 'GuardedSwitch.cpp'
//     }
// ];

// describe('Tests the code generator', () => {
//     const services = createStatemachineServices(EmptyFileSystem).statemachine;
//     const parse = parseHelper<Statemachine>(services);

//     testCases.forEach(({ inputFile, fileContent, expectedOutputFile }) => {
//         test(`Generation test for ${inputFile}`, async () => {
//             // Write the file content to the input file
//             fs.writeFileSync(path.join(examplesDir, inputFile), fileContent, 'utf8');

//             const input = readExampleFile(inputFile, examplesDir);
//             const expectedOutput = readExampleFile(expectedOutputFile, expectedOutputDir);

//             const model = await parse(input, { validation: true });

//             // Validate the state machine
//             expect(model.diagnostics).toHaveLength(0);

//             // Generate the C++ content
//             const generated = generateCppContent({
//                 statemachine: model.parseResult.value,
//                 destination: undefined!, // not needed
//                 fileName: undefined!,    // not needed
//             });

//             const text = toString(generated);
//             const normalizedText = normalizeCode(text);
//             const normalizedExpectedOutput = normalizeCode(expectedOutput);

//             expect(normalizedText).toBe(normalizedExpectedOutput);

//             // Clean up: Remove the created input file
//             fs.unlinkSync(path.join(examplesDir, inputFile));
//         });
//     });
// });