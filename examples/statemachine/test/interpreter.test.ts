import { describe, expect, test } from 'vitest';
import { _testHandleEvents, interpretStatemachineStatic } from '../src/cli/interpreter.js';
import { createStatemachineServices } from '../src/language-server/statemachine-module.js';
// import { parseHelper } from 'langium/test';
import { NodeFileSystem } from 'langium/node';
import { extractAstNode } from '../src/cli/cli-util.js';
import * as fs from 'fs';
import { Statemachine } from '../src/language-server/generated/ast.js';
import { StatemachineLanguageMetaData } from '../src/language-server/generated/module.js';

describe('Statemachine Interpreter Tests', () => {
    const testCases = [
        {
            description: 'Basic state transitions',
            fileName: 'LightSwitch.statemachine',
            fileContent: `
            statemachine LightSwitch
                events
                    toggle
                attributes
                    isOn: bool = false
                initialState Off
                state Off
                    toggle => On with{
                        isOn = true
                    };
                end
                state On
                    toggle => Off with{
                        isOn = false
                    };
                end
            `,
            events: ['toggle', 'toggle'],
            expectedState: 'Off',
            expectedAttributes: { isOn: false }
        },
        {
            description: 'State transition with timeout',
            fileName: 'TimeoutSwitch.statemachine',
            fileContent: `
                statemachine TimeoutSwitch
                    events
                        toggle
                    attributes
                        isOn: bool = false
                    initialState Off
                    state Off
                        toggle => On with{
                            isOn = true
                        };
                    end
                    state On
                        toggle => Off with{
                            isOn = false
                            setTimeout(1000)
                        };
                    end
            `,
            events: ['toggle'],
            expectedState: 'On',
            expectedAttributes: { isOn: true }
        },
        {
            description: 'State transition with boolean expressions',
            fileName: 'BooleanSwitch.statemachine',
            fileContent: `
            statemachine BooleanSwitch
                events
                    toggle
                attributes
                    count: int = 0
                    isOn: bool = false
                    isActive: bool = true
                initialState Off
                state Off
                    toggle => On with{
                        isOn = true
                        count = count + 1
                        isActive = isOn && (count > 0)
                    };
                end
                state On
                    toggle => Off with{
                        isOn = false
                        count = count * 2
                        isActive = isOn || (count < 5)
                    };
                end
            `,
            events: ['toggle', 'toggle'],
            expectedState: 'Off',
            expectedAttributes: { isOn: false, count: 2, isActive: true }
        },
        {
            description: 'State transition with multiple events and complex logic',
            fileName: 'ComplexLogicSwitch.statemachine',
            fileContent: `
            statemachine ComplexLogicSwitch
                events
                    toggle
                    reset
                attributes
                    count: int = 0
                    isOn: bool = false
                    isActive: bool = true
                initialState Off
                state Off
                    toggle => On with{
                        isOn = true
                        count = count + 1
                        isActive = isOn && (count > 0)
                    };
                end
                state On
                    toggle => Off with{
                        isOn = false
                        count = count * 2
                        isActive = isOn || (count < 5)
                    };
                    reset => Off with{
                        isOn = false
                        count = 0
                        isActive = false
                    };
                end
            `,
            events: ['toggle', 'toggle', 'reset'],
            expectedState: 'Off',
            expectedAttributes: { isOn: false, count: 2, isActive: true }
        },
        {
            description: 'State transition with guards',
            fileName: 'GuardedSwitch.statemachine',
            fileContent: `
            statemachine GuardedSwitch
                events
                    toggle
                    reset
                attributes
                    count: int = 0
                    isOn: bool = false
                    isActive: bool = true
                initialState Off
                state Off
                    toggle when(count < 3) => On with{
                        isOn = true
                        count = count + 1
                    };
                end
                state On
                    toggle => Off with{
                        isOn = false
                        count = count * 2
                    };
                    reset => Off with{
                        isOn = false
                        count = 0
                        isActive = false
                    };
                end
            `,
            events: ['toggle', 'toggle', 'toggle', 'toggle'],
            expectedState: 'Off',
            expectedAttributes: { isOn: false, count: 6, isActive: true }
        }
    ];

    testCases.forEach(({ description, fileName, fileContent, events, expectedState, expectedAttributes }) => {
        test(description, async () => {
            // Step 1: Create a new file with the specified name and content
            fs.writeFileSync(fileName, fileContent, 'utf8');

            // Step 2: Extract the AST node from the file
            const services = createStatemachineServices(NodeFileSystem).statemachine;
            const model = await extractAstNode<Statemachine>(fileName, StatemachineLanguageMetaData.fileExtensions, services);

            // Step 3: Interpret the state machine
            const context = await interpretStatemachineStatic(model, events);

            // Check the final state
            expect(context.currentState?.name).toBe(expectedState);

            // Check the attributes
            for (const [key, value] of Object.entries(expectedAttributes)) {
                expect(context.env.get(key)).toBe(value);
            }

            // Clean up: Remove the created file
            fs.unlinkSync(fileName);
        });
    });
});