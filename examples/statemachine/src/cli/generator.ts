// import { Expression } from './../../../../packages/langium/test/grammar/type-system/inferred-types.test';
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { type Generated, expandToNode as toNode, joinToNode as join, toString } from 'langium/generate';
import { Action, Attribute, BoolExpr, Expr, isBinExpr, isBoolExpr, isBoolGroup, isBoolLit, isBoolRef, isExpr, isGroup, isLit, isNegExpr, isRef, Transition, type State, type Statemachine } from '../language-server/generated/ast.js';
import { extractDestinationAndName } from './cli-util.js';
import { env, evalBoolExprWithEnv, StatemachineEnv } from './interpreter.js';
// isExpr
// For precise white space handling in generation template
// we suggest you to enable the display of white space characters in your editor.
// In VS Code execute the 'Toggle Render Whitespace' command, for example.
// set map type to <string, E> where E is number or boolean

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
    const defaultValue = attribute.type === 'int' ? 0 : false;

    if (attribute.type !== 'int' && attribute.type !== 'bool') {
        throw new Error(`Unsupported attribute type: ${attribute.type}`);
    }

    if (attribute.defaultValue === undefined) {
        env.set(attribute.name, defaultValue);
        return toNode`
                        ${attribute.type} ${attribute.name} = ${defaultValue};
            `;
    }
    const defaultValueExprValue = attribute.type === 'int' ? evalBoolExprWithEnv(attribute.defaultValue, env) : evalBoolExprWithEnv(attribute.defaultValue, env);

    if ((attribute.type === 'int' && typeof defaultValueExprValue !== 'number') || (attribute.type === 'bool' && typeof defaultValueExprValue !== 'boolean')) {
        throw new Error(`Default value for attribute '${attribute.name}' is not of type ${attribute.type}.`);
    }
    const defaultValueString = convertBoolExprToString(attribute.defaultValue, env, '')
    env.set(attribute.name, defaultValueExprValue);
    return toNode`
                    ${attribute.type} ${attribute.name} = ${defaultValueString};
        `;
}


function generateAction(action: Action, env: StatemachineEnv): string {
    if (action.assignment) {
        const variableName = action.assignment.variable.ref?.name;
        const value = convertBoolExprToString(action.assignment.value, env, 'statemachine->');
        return `            statemachine->${variableName} = ${value};`;
    } else if (action.print) {
        const value = convertBoolExprToString(action.print.value, env, 'statemachine->');
        return `            std::cout << ${value} << std::endl;`;
    } else if (action.command) {
        return `            std::cout << "Run Command: ${action.command.$refText}()" << std::endl;`;
    }
    return '';
}

function generateTransition(transition: Transition, stateName: string, env: StatemachineEnv): string {
    if (transition.guard !== undefined && typeof evalBoolExprWithEnv(transition.guard, env) !== 'boolean') {
        throw new Error('Guard condition must be a boolean expression');
    }

    const guardCondition = transition.guard != undefined ? convertBoolExprToString(transition.guard, env, 'statemachine->') : "true";
    const actionsCode = transition.actions.map(action => `${generateAction(action, env)}`).join('\n');

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

function convertBoolExprToString(e: BoolExpr | Expr, env: StatemachineEnv, refString: string): string {
    if (isBoolExpr(e)) {
        evalBoolExprWithEnv(e, env);
    } else if (isExpr(e)) {
        evalBoolExprWithEnv(e, env);
    }
    if (isLit(e)) {
        return e.val.toString();
    } else if (isRef(e)) {
        return refString + e.val.ref?.name ?? '';
    } else if (isBinExpr(e)) {
        let op = e.op;
        let left = convertBoolExprToString(e.e1, env, refString);
        let right = convertBoolExprToString(e.e2, env, refString);
        return `(${left} ${op} ${right})`;
    } else if (isNegExpr(e)) {
        let expr = convertBoolExprToString(e.ne, env, refString);
        return `-${expr}`;
    } else if (isGroup(e)) {
        let expr = convertBoolExprToString(e.ge, env, refString);
        return `(${expr})`;
    } else if (isBoolLit(e)) {
        return e.val.toString();
    } else if (isBoolGroup(e)) {
        return convertBoolExprToString(e.gbe, env, refString);
    } else if (isExpr(e)) {
        return evalBoolExprWithEnv(e, env).toString();
    } else if (isBoolRef(e)) {
        return refString + e.val.ref?.name ?? '';
    }
    throw new Error('Unhandled Expression: ' + e);
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