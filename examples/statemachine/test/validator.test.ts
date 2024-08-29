import { describe, expect, test } from 'vitest';
import { parseHelper } from 'langium/test';
import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
import { NodeFileSystem } from 'langium/node';

const services = createStatemachineServices(NodeFileSystem);
const parse = parseHelper(services.statemachine);

describe('Statemachine Validator Tests', () => {
    test('Valid statemachine passes without errors', async () => {
        const input = `
        statemachine TestMachine
        events
            start stop
        attributes
            count: int = 0
            isRunning: bool = false
        initialState Idle
        state Idle
            start => Running;
        end
        state Running
            stop => Idle;
        end
        `;
        const model = await parse(input, { validation: true });
        console.log(model.diagnostics);
        expect(model.diagnostics).toHaveLength(0);  // Expect no validation errors
    });

    test('Invalid statemachine with type error', async () => {
        const input = `
        statemachine TestMachine
        events
            start
        attributes
            count: int = "zero"
        initialState Idle
        state Idle
            start => Running;
        end
        state Running end
        `;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics?.length).toBeGreaterThanOrEqual(1);  // Expecting one validation error for type mismatch
    });

    test('Valid statemachine with multiple states', async () => {
        const input = `
        statemachine ComplexMachine
        events
            start stop pause resume
        attributes
            count: int = 0
            isRunning: bool = false
        initialState Idle
        state Idle
            start => Running;
        end
        state Running
            stop => Idle;
            pause => Paused;
        end
        state Paused
            resume => Running;
        end
        `;
        const model = await parse(input, { validation: true });
        console.log(model.diagnostics);
        expect(model.diagnostics).toHaveLength(0);  // Expect no validation errors
    });

    test('Invalid statemachine with missing initial state', async () => {
        const input = `
        statemachine MissingInitialState
        events
            start stop
        attributes
            count: int = 0
            isRunning: bool = false
        state Idle
            start => Running;
        end
        state Running
            stop => Idle;
        end
        `;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics?.length).toBeGreaterThanOrEqual(1);  // Expecting validation error for missing initial state
    });

    test('Invalid statemachine with undefined event', async () => {
        const input = `
        statemachine UndefinedEvent
        events
            start stop
        attributes
            count: int = 0
            isRunning: bool = false
        initialState Idle
        state Idle
            start => Running;
        end
        state Running
            undefinedEvent => Idle;
        end
        `;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics?.length).toBeGreaterThanOrEqual(1);  // Expecting validation error for undefined event
    });
});