grammar Statemachine

entry Statemachine:
    'statemachine' name=ID
    ('events' events+=Event+)?
    ('commands' commands+=Command+)?
    ('attributes' attributes+=Attribute+)?
    'initialState' init=[State]
    states+=State*;

Event:
    name=ID;

Command:
    name=ID;

State:
    'state' name=ID
        transitions+=Transition*
    'end';

Transition:
    event=[Event:ID] 
    ('when' guard=Expression)? '=>' state=[State] 
    ('with{'
         actions+=Action+
    '}')? ';' ;

Action:
    assignment=Assignment | print=PrintStatement | ('run' command=[Command]) | setTimeout=SetTimeout;

SetTimeout:
    'setTimeout' '(' duration=NUMBER ')';

PrintStatement:     
    'print' '(' values+=PrintValue (',' values+=PrintValue)* ')';

PrintValue:
    StringLiteral | Expression;

StringLiteral:
    value=STRING;

Assignment:
    variable=[Attribute] '=' value=Expression;

Attribute:
    name=ID ':' type=TYPE ('=' defaultValue=Expression)?;

// Expression: Unified rule for all types of expressions
Expression:
    Conditional;

Conditional infers Expression:
    Comparison ({infer BinExpr.e1=current} op=('||' | '&&') e2=Comparison)*;

Comparison infers Expression:
    Equality ({infer BinExpr.e1=current} op=('<' | '<=' | '>' | '>=' ) e2=Equality)*;

Equality infers Expression:
    Add ({infer BinExpr.e1=current} op=('==' | '!=') e2=Add)*;

Add infers Expression:
    Mult ({infer BinExpr.e1=current} op=('+' | '-' ) e2=Mult)*;

Mult infers Expression:
    PrimaryExpr ({infer BinExpr.e1=current} op=('*' | '/' ) e2=PrimaryExpr)*;

PrimaryExpr:
    Literal | Ref | Group | NegExpr;

Literal:
    val=NUMBER | val=BOOL_VALUE;

Ref:
    val=[Attribute:ID];
Group:
    '(' ge=Expression ')';

NegExpr:
    NegIntExpr | NegBoolExpr;

NegIntExpr:
    '-' ne=Expression;

NegBoolExpr:
    '!' ne=Expression;

hidden terminal WS: /\s+/;
terminal TYPE returns string: 'int' | 'bool';
terminal BOOL_VALUE returns boolean: 'true' | 'false';
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number:/(?:(?:-?[0-9]+)?\.[0-9]+)|-?[0-9]+/;
terminal STRING returns string: /"([^"\\]|\\.)*"/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;