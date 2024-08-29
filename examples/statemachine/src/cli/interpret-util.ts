import { Attribute, Statemachine } from "../language-server/generated/ast.js";
import { Expression, isNegExpr, isLiteral, isNegIntExpr, isNegBoolExpr, isGroup, isRef, isBinExpr } from "../language-server/generated/ast.js";
import { attributeNames, StatemachineEnv } from '../cli/interpreter.js';
import chalk from "chalk";
// export function getErrorMessage(e: Error): string {

// }
export const ERROR_MESSAGE_GUARD_NOT_BOOL = 'Guard must be a boolean expression';
export function getDefaultAttributeValue(attribute: Attribute): number | boolean {
    return attribute.type == 'bool' ? false : 0;
}

export function eventsAreValid(model: Statemachine, eventNames: string[]): boolean {
    const validEventNames = model.events.map(event => event.name);
    const invalidEvents = eventNames.filter(eventName => !validEventNames.includes(eventName));

    if (invalidEvents.length > 0) {
        return false;
    }
    return true;
}

export function inferType(e: Expression, env: StatemachineEnv, rootAttributeName?: string): string {
    if (isLiteral(e)) {
        // type other than int or bool is not supported by the langium grammar itself 
        // which is why we can safely assume that the type is either int or bool
        return typeof e.val === 'boolean' ? 'bool' : 'int';
    } else if (isRef(e)) {
        // Write code to throw an error if the reference is not defined in the current scope, throw an error i.e.
        const attributeIndex = attributeNames.indexOf(rootAttributeName ?? '');
        const refIndex = attributeNames.indexOf(e.val.$refText);
        if (attributeIndex !== -1 && rootAttributeName) {
            // console.log('refIndex', refIndex, 'attributeIndex', attributeIndex);
            // console.log(attributeNames);
            if (refIndex >= attributeIndex) {
                throw new Error(`${e.val.$refText} Reference is undefined in this scope`);
            }
        }
        if (!e.val.ref || !env.has(e.val.$refText) || (e.val.$refText === rootAttributeName)) {
            throw new Error(`${e.val.$refText} Reference is undefined in this scope`);
        }
        return e.val.ref?.type;
    } else if (isBinExpr(e) && e?.$type === 'BinExpr') {
        const leftType = inferType(e.e1, env, rootAttributeName);
        const rightType = inferType(e.e2, env, rootAttributeName);
        if (leftType !== rightType) {
            throw new Error(`Type mismatch: ${leftType} ${e.op} ${rightType}`);
        }
        if (e.op === '||' || e.op === '&&') {
            if (leftType !== 'bool' || rightType !== 'bool') {
                throw new Error(`Invalid types for boolean operation: ${leftType} ${e.op} ${rightType}`);
            }
            return 'bool';
        } else if (['==', '!='].includes(e.op)) {
            return 'bool';
        } else if (['<', '>', '<=', '>='].includes(e.op)) {
            if (leftType !== 'int' || rightType !== 'int') {
                throw new Error(`Invalid types for comparison operation: ${leftType} ${e.op} ${rightType}`);
            }
            return 'bool';
        } else {
            if (leftType !== 'int' || rightType !== 'int') {
                throw new Error(`Invalid types for arithmetic operation: ${leftType} ${e.op} ${rightType}`);
            }
            if (e.op === '/') {
                try {
                    if (evalExpression(e.e2, env) == 0) {
                        throw new Error('Division by zero');
                    }
                } catch (error) {
                    if (error instanceof Error && error.message === 'Division by zero') {
                        throw error;
                    }
                }
                // try {
                //     console.log('Entering try block in infertype ');
                //     if (evalExpression(e.e2, env) == 0) {
                //         throw new Error('Division by zero');
                //     }
                // } catch (error) {
                //     console.error('error', (error as Error).message);
                // }
            }
            return 'int';
        }
    } else if (isNegExpr(e)) {
        if (isNegIntExpr(e)) {
            const exprType = inferType(e.ne, env, rootAttributeName);
            if (exprType !== 'int') {
                throw new Error(`Invalid type for integer negation: ${exprType}`);
            }
            return 'int';
        } else if (isNegBoolExpr(e)) {
            const exprType = inferType(e.ne, env, rootAttributeName);
            if (exprType !== 'bool') {
                throw new Error(`Invalid type for boolean negation: ${exprType}`);
            }
            return 'bool';
        }
    } else if (isGroup(e)) {
        return inferType(e.ge, env, rootAttributeName);
    }
    throw new Error(chalk.red('Unhandled Expression: ' + e));
}

export function evalExpression(e: Expression, env: StatemachineEnv): number | boolean {
    if (isLiteral(e)) {
        return e.val;
    } else if (isRef(e)) {
        const refName = e.val.ref?.name;
        if (refName && env.get(refName) !== undefined) {
            return env.get(refName) as number | boolean;
        } else {
            throw new Error(`Undefined reference: ${refName}`);
        }
    } else if (isBinExpr(e) && e?.$type === 'BinExpr') {
        const leftValue = evalExpression(e.e1, env);
        const rightValue = evalExpression(e.e2, env);
        const leftType = typeof leftValue;
        const rightType = typeof rightValue;
        const opval = e.op;
        if (leftType != rightType) {
            // console.log(`Type sd mismatch: ${leftType} ${e.op} ${rightType}`);
            throw new Error(`Type sd mismatch: ${leftType} ${e.op} ${rightType}`);
        } else if (e.op === '!=' || e.op === '==') {
            return e.op === '==' ? leftValue === rightValue : leftValue !== rightValue;
        } else if (e.op === '||' || e.op === '&&') {
            if (leftType !== 'boolean') {
                throw new Error(`Invalid types for boolean operation: ${leftType} ${e.op} ${rightType}`);
            }
            return e.op === '||' ? leftValue || rightValue : leftValue && rightValue;
        } else if ((typeof leftValue === 'number' && typeof rightValue === 'number' && (['<', '>', '<=', '>=', '/', '*', '+', '-'].includes(opval)))) {
            switch (opval) {
                case '<': return leftValue < rightValue;
                case '>': return leftValue > rightValue;
                case '<=': return leftValue <= rightValue;
                case '>=': return leftValue >= rightValue;
                case '==': return leftValue === rightValue;
                case '!=': return leftValue !== rightValue;
                case '/':
                    if (rightValue == 0) {
                        throw new Error('Division by zero');
                    }
                    return leftValue / rightValue;
                case '*': return leftValue * rightValue;
                case '+': return leftValue + rightValue;
                case '-': return leftValue - rightValue;
                default: throw new Error(`Unrecognized binary operator: ${opval}`);
            }
        } else {
            throw new Error(`Unrecognized binary operator: ${opval}`);
        }
    } else if (isNegExpr(e)) {
        if (isNegIntExpr(e)) {
            const value = evalExpression(e.ne, env);
            return -Number(value);
        } else if (isNegBoolExpr(e)) {
            const value = evalExpression(e.ne, env);
            return !Boolean(value);
        }
    } else if (isGroup(e)) {
        return evalExpression(e.ge, env);
    }
    throw new Error('Unhandled Expression: ' + e);
}
