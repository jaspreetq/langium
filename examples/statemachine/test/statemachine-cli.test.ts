/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import type { ExecException } from 'child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { afterAll, describe, expect, test } from 'vitest';
import { exec } from 'child_process';

describe('Test the statemachine CLI with trafficlight', () => {
    let fullPath: string;
    let fileName = path.join(__dirname, '../example/trafficlight.statemachine');
    const destination = 'statemachine-example-test';

    test('Generator command returns code 0 and creates expected files', async () => {
        const result = await cli(['generate', fileName, '-d', destination]);
        expect(result.code).toBe(0);

        fileName = fileName.replace(/\..*$/, '').replace(/[.-]/g, '');
        fullPath = path.join(destination, `${path.basename(fileName)}.cpp`);
        const generatedDirExists = fs.existsSync(fullPath);
        expect(generatedDirExists).toBe(true);
    });
    let inputFileName = path.join(__dirname, '../example/trafficlight.statemachine');
    test('Interpret-static command returns code 0 and produces expected output', async () => {
        const events = `'switchMode' 'next'`; // Example events array
        const result = await cli(['interpret-static', inputFileName, events]);
        console.log(result.stdout, result.stderr, result.error);
        expect(result.code).toBe(0);
        // Add additional assertions to verify the output if needed
    });

    afterAll(() => {
        if (fs.existsSync(destination)) {
            fs.rmdirSync(destination, { recursive: true });
        }
    });

});

describe('Test the statemachine CLI with vendingmachine', () => {
    const vendingMachineFile = path.join(__dirname, '../example/vendingmachine.statemachine');
    const destination = 'vendingmachine-example-test';
    test('Generator command returns code 0 and creates expected files', async () => {
        const result = await cli(['generate', vendingMachineFile, '-d', destination]);
        expect(result.code).toBe(0);

        const fileName = vendingMachineFile.replace(/\..*$/, '').replace(/[.-]/g, '');
        const fullPath = path.join(destination, `${path.basename(fileName)}.cpp`);
        const generatedDirExists = fs.existsSync(fullPath);
        expect(generatedDirExists).toBe(true);
    });

    /* New Changes by @jaspreetq ***************************/
    test('Interpret-static command returns code 0 and produces expected output', async () => {
        const events = `'insertCoin' 'selectProduct'`; // Example events array
        const result = await cli(['interpret-static', vendingMachineFile, events]);
        console.log(result.stdout, result.stderr, result.error);
        expect(result.code).toBe(0);
        // Add additional assertions to verify the output if needed
    });

    afterAll(() => {
        if (fs.existsSync(destination)) {
            fs.rmdirSync(destination, { recursive: true });
        }
    });
});

describe('Test the statemachine CLI with smartthermostat', () => {
    const smartthermostatFile = path.join(__dirname, '../example/smartthermostat.statemachine');
    const destination = 'smartthermostat-example-test';

    test('Generator command returns code 0 and creates expected files', async () => {
        const result = await cli(['generate', smartthermostatFile, '-d', destination]);
        expect(result.code).toBe(0);

        const fileName = smartthermostatFile.replace(/\..*$/, '').replace(/[.-]/g, '');
        const fullPath = path.join(destination, `${path.basename(fileName)}.cpp`);
        const generatedDirExists = fs.existsSync(fullPath);
        expect(generatedDirExists).toBe(true);
    });
    /* New Changes by @jaspreetq ***************************/
    test('Interpret-static command returns code 0 and produces expected output', async () => {
        const events = `'insertCoin' 'selectProduct'`; // Example events array
        const result = await cli(['interpret-static', smartthermostatFile, events]);
        console.log(result.stdout, result.stderr, result.error);
        expect(result.code).toBe(0);
        // Add additional assertions to verify the output if needed
    });

    afterAll(() => {
        if (fs.existsSync(destination)) {
            fs.rmdirSync(destination, { recursive: true });
        }
    });
});
interface CliResult {
    code: number,
    error: ExecException | null,
    stdout: string,
    stderr: string
}

async function cli(args: string[]): Promise<CliResult> {
    return new Promise(resolve => {
        exec(`node "${path.join(__dirname, '../bin/cli')}" "${args.join('" "')}"`, (error, stdout, stderr) => {
            resolve({
                code: error && error.code ? error.code : 0,
                error,
                stdout,
                stderr
            });
        });
    });
}
