import { describe, expect, test } from 'vitest';
import { parseHelper } from 'langium/test';
import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
import { NodeFileSystem } from 'langium/node';

const services = createStatemachineServices(NodeFileSystem);
const parse = parseHelper(services.statemachine);

describe('Statemachine Validator Tests', () => {
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

    test('Valid SM with Logical and Relational Expressions Used during Attribute Initialization ', async () => {
        const input = `
            statemachine TestMachine
            events
                start stop
            attributes
                count: int = 0
                isRunning: bool = count < 0 || count > 0
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

    test('Invalid statemachine with type mismatch in the attribute definition', async () => {
        const input = `
        statemachine TypeMismatchAttribute
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
        expect(model.diagnostics).toHaveLength(2);  // Expecting two validation error for type mismatch
    });

    test('Invalid statemachine with a type mismatch in a conditional expression (guard)', async () => {
        const input = `
        statemachine TypeMismatchExpression
        events
            start stop
        attributes
            count: int = 0
            isRunning: bool = false
        initialState Idle
        state Idle
            start when count + 2 || isRunning => Running with{
                print("Running")
            };
        end
        state Running
            stop => Idle with{
                print("Stop")
            };
        end
        `;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics).toHaveLength(1);
    });

    test('Invalid statemachine with an invalid assignment', async () => {
        const input = `
        statemachine InvalidAssignment
        events
            start stop
        attributes
            count: int = 23
            isRunning: bool = false
        initialState Idle
        state Idle
            start => Running with{
                isRunning = count + 7
            };
        end
        state Running
            stop => Idle;
        end`;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics).toHaveLength(1);  // Expecting validation error for undefined event
    });

    test('Invalid state machine with an out-of-scope attribute access (undefined reference)', async () => {
        const input = `
        statemachine ReferenceUndefined
        events
            start stop
        attributes
            count: int = steps + 1
            steps: int = 0
            isRunning: bool = false
        initialState Idle
        state Idle
            start when !isRunning => Running with{
                print("Running")
            };
        end
        state Running
            stop => Idle with{
                print("Stop")
            };
        end
        `;
        const model = await parse(input, { validation: true });
        expect(model.diagnostics).toHaveLength(1);  // Expecting validation errors for undefined attribute
    });
});