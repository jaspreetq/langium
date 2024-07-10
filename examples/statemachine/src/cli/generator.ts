/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { type Generated, expandToNode as toNode, joinToNode as join, toString } from 'langium/generate';
import { Attribute, Expr, isBinExpr, isGroup, isLit, isNegExpr, isRef, type State, type Statemachine } from '../language-server/generated/ast.js';
import { extractDestinationAndName } from './cli-util.js';

// For precise white space handling in generation template
// we suggest you to enable the display of white space characters in your editor.
// In VS Code execute the 'Toggle Render Whitespace' command, for example.
type StatemachineEnv = Map<string, number>;

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
    const env: StatemachineEnv = new Map();
    return toNode`
        #include <iostream>
        #include <map>
        #include <string>

        class ${ctx.statemachine.name};

        ${generateStateClass(ctx)}

        ${generateStatemachineClass(ctx)}
        
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

function generateStatemachineClass(ctx: GeneratorContext): Generated {

    return toNode`
        class ${ctx.statemachine.name} {
        private:
            State* state = nullptr;
        public:
            ${ctx.statemachine.name}(State* initial_state) {
                initial_state->set_context(this);
                state = initial_state;
                std::cout << "[op" << state->get_name() <<  "]" << std::endl;
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

function generateStateDefinition(ctx: GeneratorContext, state: State, env: StatemachineEnv): Generated {
    // state.transitions.forEach((transition, idx) => {
    //     if (transition.guard) {
    //         env.set(state.name + idx, evalExprWithEnv(transition.guard, env));
    //     }
    // });

    return toNode`
        // ${state.name}
        ${join(state.transitions, transition => toNode`
            void ${state.name}::${transition.event.$refText}() {
                if(${transition.guard != undefined ? (evalExprWithEnv(transition.guard, env) > 0) ? true : false : true}) {
                    statemachine->transition_to(new ${transition.state.$refText});
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        `)}
    `;
}

function evalExprWithEnv(e: Expr, env: StatemachineEnv): number {//
    if (isLit(e)) {
        return e.val;

    } else if (isRef(e)) {
        const v = env.get(e.val.ref?.name ?? '');
        if (v != undefined) {
            return v;
        }
        throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);

    } else if (isBinExpr(e)) {
        let opval = e.op;
        let v1 = evalExprWithEnv(e.e1, env);
        let v2 = evalExprWithEnv(e.e2, env);

        switch (opval) {
            case '+': return v1 + v2;
            case '-': return v1 - v2;
            case '*': return v1 * v2;
            case '/': return v1 / v2;
            case '<': return v1 < v2 ? 1 : 0;
            case '>': return v1 > v2 ? 1 : 0;
            case '<=': return v1 <= v2 ? 1 : 0;
            case '>=': return v1 >= v2 ? 1 : 0;
            case '==': return v1 === v2 ? 1 : 0;
            case '!=': return v1 !== v2 ? 1 : 0;
            case '&&': return (v1 && v2) ? 1 : 0;
            case '||': return (v1 || v2) ? 1 : 0;
            default: throw new Error(`Unrecognized bin op passed: ${opval}`);
        }

    } else if (isNegExpr(e)) {
        return -1 * evalExprWithEnv(e.ne, env);

    } else if (isGroup(e)) {
        return evalExprWithEnv(e.ge, env);

    }

    throw new Error('Unhandled Expression: ' + e);

}
// function generateAttributeDeclaration(attribute: Attribute): Generated {
//     // attribute.defaultValue = 
//     return toNode`
//         int ${attribute.name} = 0;
//     `;
// }

// function generateAttributeDefaultValue(attribute: Attribute): string {
//     if (attribute.defaultValue) {
//         const env: StatemachineEnv = new Map();
//         const defaultValue = evalExprWithEnv(attribute.defaultValue, env);
//         return ` = ${defaultValue}`;
//     }
//     return '= 0';
// }

function generateAttributeInitialization(attribute: Attribute, env: StatemachineEnv): Generated {
    if (attribute.defaultValue) {
        const defaultValue = evalExprWithEnv(attribute.defaultValue, env);
        env.set(attribute.name, defaultValue);  // Store the evaluated value in the environment
        if (attribute.defaultValue.$type == 'Lit') {
            attribute.defaultValue.val = defaultValue;
        }
        else if (attribute.defaultValue.$type == 'Ref' && attribute.defaultValue.val.ref?.defaultValue?.$type == 'Lit') {
            attribute.defaultValue.val.ref.defaultValue.val = defaultValue;
        }
        return toNode`
            int ${attribute.name} = ${defaultValue};
            std::cout << "${attribute.name}: " << ${env.get(attribute.name)} << std::endl;
        `;
    }
    return toNode`int ${attribute.name} = 0;`; // Set default value to 0
}


// if (attribute.defaultValue) {
//     if (attribute.defaultValue) {
//     const defaultValue = evalExprWithEnv(attribute.defaultValue, env);
//     env.set(attribute.name, defaultValue);  // Store the evaluated value in the environment
//     return toNode`this->${attribute.name} = ${defaultValue};`;
// }
// return toNode`this->${attribute.name} = 0;`; // Set default value to 0
//     const defaultValue = evalExprWithEnv(attribute.defaultValue, env);
//     env.set(attribute.name, defaultValue);  // Store the evaluated value in the environment
//     return toNode`this->${attribute.name} = ${defaultValue};`;
// }
// return toNode``;
// function generateAttributeDeclaration(attribute: Attribute): Generated {
//     return toNode`
//         int ${attribute.name}${generateAttributeDefaultValue(attribute)};
//     `;
// }

// function generateAttributeDefaultValue(attribute: Attribute): string {
//     if (typeof attribute.defaultValue != 'number') { // Check if it's a number
//         attribute.defaultValue = undefined;
//     }
//     const defaultValue = attribute.defaultValue ? evalExprWithEnv(attribute.defaultValue, new Map()) : 0;
//     return ` = ${defaultValue}`;
// }

// function generateAttributeInitialization(attribute: Attribute, env: StatemachineEnv): Generated {
//     let defaultValue = 0; // Default value for integers

//     if (attribute.defaultValue) {
//         const evaluatedValue = evalExprWithEnv(attribute.defaultValue, env); // Evaluate the expression
//         if (typeof evaluatedValue === 'number') { // Check if it's a number
//             defaultValue = evaluatedValue;
//         } else {
//             console.warn(`Warning: Default value for attribute '${attribute.name}' is not an integer. Using default value of 0.`);
//         }

//         env.set(attribute.name, defaultValue);

//         return toNode`
//                 this->${attribute.name} = ${defaultValue};
//                 std::cout << "${attribute.name}: " << this->${attribute.name} << std::endl;
//             `;
//     }

//     // Store the default value in the environment if no default is provided
//     env.set(attribute.name, defaultValue);
//     return toNode``; // No initialization code needed if no default is provided
// }
//////////////////
//         // Check if the evaluated value is a literal number
//         if (isLit(attribute.defaultValue) && typeof evaluatedValue === 'number') {
//             defaultValue = evaluatedValue;
//         } else {
//             console.warn(`Warning: Default value for attribute '${attribute.name}' is not a simple integer literal. Using default value of 0.`);
//         }

//         env.set(attribute.name, defaultValue);  // Update the environment

//         return toNode`
//             this->${attribute.name} = ${defaultValue};
//             std::cout << "${attribute.name}: " << this->${attribute.name} << std::endl;
//         `;
//     }

//     // Store the default value in the environment if no default is provided
//     env.set(attribute.name, defaultValue);
//     return toNode``; // No initialization code needed if no default is provided
// }
//     let defaultValue = 0;

//     if (attribute.defaultValue) {
//         const evaluatedValue = evalExprWithEnv(attribute.defaultValue, env);

//         if (typeof evaluatedValue === 'number') { // Check if it's a number
//             defaultValue = evaluatedValue;
//         } else {
//             console.warn(`Warning: Default value for attribute '${attribute.name}' is not an integer. Using default value of 0.`);
//         }

//         env.set(attribute.name, defaultValue);

//         return toNode`
//                 this->${attribute.name} = ${defaultValue};
//                 std::cout << "${attribute.name}: " << this->${attribute.name} << std::endl;
//             `;
//     }

//     // Store the default value in the environment if no default is provided
//     env.set(attribute.name, defaultValue);
//     return toNode``; // No initialization code needed if no default is provided
// }


//     if (typeof attribute.defaultValue == "number") {
//         const defaultValue = evalExprWithEnv(attribute.defaultValue, env);
//         env.set(attribute.name, defaultValue);  // Store the evaluated value in the environment
//         return toNode`
//             this->${attribute.name} = ${defaultValue};
//             std::cout << "${attribute.name}: " << this->${attribute.defaultValue} << std::endl;
//         `;
//     }
//     else {
//         env.set(attribute.name, zeroDefaultValue);  // Store the evaluated value in the environment
//     }
//     return toNode``;
// }

function generateMain(ctx: GeneratorContext, env: StatemachineEnv): Generated {
    return toNode`
        int main() {
            ${ctx.statemachine.name} *statemachine = new ${ctx.statemachine.name}(new ${ctx.statemachine.init.$refText});

            static std::map<std::string, Event> event_by_name;
            ${joinWithExtraNL(ctx.statemachine.events, event => `event_by_name["${event.name}"] = &${ctx.statemachine.name}::${event.name};`)}
            ${joinWithExtraNL(ctx.statemachine.attributes, attribute => toNode`
                ${generateAttributeInitialization(attribute, env)}
            `)}
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
