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
const examplesDir = path.resolve(__dirname, '../test/sampleProgramsGeneratorTestInput');
const expectedOutputDir = path.resolve(__dirname, '../test/sampleProgramsGeneratorTestExpectedOutput');

function readExampleFile(fileName: string, dir: string): string {
    return fs.readFileSync(path.join(dir, fileName), 'utf-8');
}

const testCases = [
    { inputFile: 'homesecuritysystem.statemachine', expectedOutputFile: 'homesecuritysystem.cpp' },
    { inputFile: 'smartthermostat.statemachine', expectedOutputFile: 'smartthermostat.cpp' },
    { inputFile: 'trafficlight.statemachine', expectedOutputFile: 'trafficlight.cpp' },
    { inputFile: 'vendingmachine.statemachine', expectedOutputFile: 'vendingmachine.cpp' },
    { inputFile: 'homeautomation.statemachine', expectedOutputFile: 'homeautomation.cpp' }
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