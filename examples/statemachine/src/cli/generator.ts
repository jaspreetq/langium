// import { Expression } from './../../../../packages/langium/test/grammar/type-system/inferred-types.test';
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { type Generated, expandToNode as toNode, joinToNode as join, toString } from 'langium/generate';
import { Action, Attribute, Expression, isBinExpr, isRef, isStringLiteral, Transition, type State, type Statemachine } from '../language-server/generated/ast.js';
import { extractDestinationAndName } from './cli-util.js';
import { env, StatemachineEnv } from './interpreter.js';
import { getDefaultAttributeValue, evalExpression } from './interpret-util.js';
import { isNegExpr, isLiteral, isNegIntExpr, isNegBoolExpr, isGroup } from "../language-server/generated/ast.js";
import chalk from 'chalk';

export function generateCpp(statemachine: Statemachine, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const ctx = <GeneratorContext>{
        statemachine,
        fileName: `${data.name}.cpp`,
        destination: data.destination,
    };
    return generate(ctx);
}

interface GeneratorContext {
    statemachine: Statemachine;
    fileName: string;
    destination: string;
}

function generate(ctx: GeneratorContext): string {
    const fileNode = generateCppContent(ctx);

    if (!fs.existsSync(ctx.destination)) {
        fs.mkdirSync(ctx.destination, { recursive: true });
    }

    const generatedFilePath = path.join(ctx.destination, ctx.fileName);
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;

}

function joinWithExtraNL<T>(content: T[], toString: (e: T) => Generated): Generated {
    return join(content, toString, { appendNewLineIfNotEmpty: true });
}

export function generateCppContent(ctx: GeneratorContext): Generated {
    return toNode`
        #include <iostream>
        #include <map>
        #include <string>
        #include <chrono>
        #include <thread>
        class ${ctx.statemachine.name};

        ${generateStateClass(ctx)}

        ${generateStatemachineClass(ctx, env)}
        
        ${joinWithExtraNL(ctx.statemachine.states, state => generateStateDeclaration(ctx, state))}
        ${joinWithExtraNL(ctx.statemachine.states, state => generateStateDefinition(ctx, state, env))}

        typedef void (${ctx.statemachine.name}::*Event)();

        ${generateMain(ctx, env)}

    `;
}

function generateStateClass(ctx: GeneratorContext): Generated {
    return toNode`
        class State {
        protected:
            ${ctx.statemachine.name} *statemachine;

        public:
            virtual ~State() {}

            void set_context(${ctx.statemachine.name} *statemachine) {
                this->statemachine = statemachine;
            }

            virtual std::string get_name() {
                return "Unknown";
            }
        ${joinWithExtraNL(ctx.statemachine.events, event => toNode`
            
                virtual void ${event.name}() {
                    std::cout << "Impossible event for the current state." << std::endl;
                }
        `)}
        };
    `;
}

function generateStatemachineClass(ctx: GeneratorContext, env: StatemachineEnv): Generated {
    return toNode`
        class ${ctx.statemachine.name} {
        private:
            State* state = nullptr;
        public:
            ${joinWithExtraNL(ctx.statemachine.attributes, attribute => toNode`
                ${generateAttributeDeclaration(attribute, env)}
            `)}
            ${ctx.statemachine.name}(State* initial_state) {
                initial_state->set_context(this);
                state = initial_state;
                std::cout << "[" << state->get_name() <<  "]" << std::endl;
            }

            ~${ctx.statemachine.name}() {
                if (state != nullptr) {
                    delete state;
                }
            }

            void transition_to(State *new_state) {
                std::cout << state->get_name() << " ===> " << new_state->get_name() << std::endl;
                if (state != nullptr) {
                    delete state;
                }
                new_state->set_context(this);
                state = new_state;
            }
            ${joinWithExtraNL(ctx.statemachine.events, event => toNode`
                    void ${event.name}() {
                        state->${event.name}();
                    }
            `)}
        };
    `;
}

function generateStateDeclaration(ctx: GeneratorContext, state: State): Generated {
    return toNode`
        class ${state.name} : public State {
        public:
            std::string get_name() override { return "${state.name}"; }
            ${joinWithExtraNL(state.transitions, transition => `void ${transition.event.$refText}() override;`)}
        };
    `;
}

function generateAttributeDeclaration(attribute: Attribute, env: StatemachineEnv): Generated {
    const defaultValue = getDefaultAttributeValue(attribute);

    if (attribute.type !== 'int' && attribute.type !== 'bool') {
        throw new Error(`Unsupported attribute type: ${attribute.type}`);
    }

    if (attribute.defaultValue === undefined) {
        env.set(attribute.name, defaultValue);
        return toNode`
                        ${attribute.type} ${attribute.name} = ${defaultValue};
            `;
    }

    const defaultValueExprValue = evalExpression(attribute.defaultValue, env);
    const defaultValueString = convertExpressionToString(attribute.defaultValue, env, '')
    env.set(attribute.name, defaultValueExprValue);
    return toNode`
                    ${attribute.type} ${attribute.name} = ${defaultValueString};
        `;
}


function generateAction(action: Action, env: StatemachineEnv): string {
    if (action.setTimeout) {
        return `
            std::cout << "Delaying transition for ${action.setTimeout.duration} milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(${action.setTimeout.duration}));
        `;
    } else if (action.assignment) {
        const variableName = action.assignment.variable.ref?.name;
        const value = convertExpressionToString(action.assignment.value, env, 'statemachine->');
        return `            statemachine->${variableName} = ${value};`;
    } else if (action.print) {
        const values = action.print.values.map(value => {
            if (isStringLiteral(value)) {
                return `"${value.value}"`;  // Assuming value.val contains the string content
            } else {
                return convertExpressionToString(value, env, 'statemachine->');
            }
        });
        return `            std::cout << ${values.join(' << ')} << std::endl;`;
    } else if (action.command) {
        return `            std::cout << "Run Command: ${action.command.$refText}()" << std::endl;`;
    }
    return '';
}

function generateTransition(transition: Transition, stateName: string, env: StatemachineEnv): string {
    if (transition.guard !== undefined && typeof evalExpression(transition.guard, env) !== 'boolean') {
        throw new Error('Guard condition must be a boolean expression');
    }

    const guardCondition = transition.guard != undefined ? convertExpressionToString(transition.guard, env, 'statemachine->') : "true";
    const actionsCode = transition.actions.map(action => `${generateAction(action, env)}`).filter(actionCode => actionCode.length > 0)
        .join('\n');

    return `
    void ${stateName}::${transition.event.$refText}() {
        if (${guardCondition}) {
${transition.actions?.length > 0 ? actionsCode : ''}
            statemachine->transition_to(new ${transition.state.$refText});
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    `;
}

function generateStateDefinition(ctx: GeneratorContext, state: State, env: StatemachineEnv): Generated {
    const transitionsCode = state.transitions.map(transition => generateTransition(transition, state.name, env)).join('\n');

    return toNode`
        // ${state.name}
    ${transitionsCode}
    `;
}

function convertExpressionToString(e: Expression, env: StatemachineEnv, refPrefix: string): string {
    if (isLiteral(e)) {
        return e.val.toString();
    } else if (isRef(e)) {
        // Write code to throw an error if the reference is not defined in the current scope, throw an error i.e.
        if (!e.val.ref || !env.has(e.val.$refText)) {
            throw new Error(`${e.val.$refText} Reference is undefined in this scope`);
        }
        return refPrefix + e.val.ref?.name ?? '';
    } else if (isBinExpr(e)) {
        let op = e.op;
        let left = convertExpressionToString(e.e1, env, refPrefix);
        let right = convertExpressionToString(e.e2, env, refPrefix);
        return `(${left} ${op} ${right})`;
    } else if (isNegExpr(e)) {
        if (isNegIntExpr(e)) {
            const expr = convertExpressionToString(e.ne, env, refPrefix);
            return `-${expr}`;
        } else if (isNegBoolExpr(e)) {
            const expr = convertExpressionToString(e.ne, env, refPrefix);
            return `!${expr}`;
        }
    } else if (isGroup(e)) {
        let expr = convertExpressionToString(e.ge, env, refPrefix);
        return `(${expr})`;
    }
    throw new Error(chalk.red('Unhandled Expression: ' + e));
}

function generateMain(ctx: GeneratorContext, env: StatemachineEnv): Generated {
    return toNode`
        int main() {
            ${ctx.statemachine.name} *statemachine = new ${ctx.statemachine.name}(new ${ctx.statemachine.init.$refText});

            static std::map<std::string, Event> event_by_name;
            ${joinWithExtraNL(ctx.statemachine.events, event => `event_by_name["${event.name}"] = &${ctx.statemachine.name}::${event.name};`)}
            for (std::string input; std::getline(std::cin, input);) {
                std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
                if (event_by_name_it == event_by_name.end()) {
                    std::cout << "There is no event <" << input << "> in the ${ctx.statemachine.name} statemachine." << std::endl;
                    continue;
                }
                Event event_invoker = event_by_name_it->second;
                (statemachine->*event_invoker)();
            }

            delete statemachine;
            return 0;
        }
    `;
}