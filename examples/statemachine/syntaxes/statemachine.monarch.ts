// Monarch syntax highlighting for the statemachine language.
export default {
    keywords: [
        'attributes','commands','end','events','initialState','print','run','setTimeout','state','statemachine','when','with{'
    ],
    operators: [
        '!','!=','&&','*','+',',','-','/',':',';','<','<=','=','==','=>','>','>=','||'
    ],
    symbols: /!|!=|&&|\(|\)|\*|\+|,|-|\/|:|;|<|<=|=|==|=>|>|>=|\|\||\}/,

    tokenizer: {
        initial: [
            { regex: /(int|bool)/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"string"} }} },
            { regex: /(true|false)/, action: {"token":"boolean"} },
            { regex: /[_a-zA-Z][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
            { regex: /(?:(?:-?[0-9]+)?\.[0-9]+)|-?[0-9]+/, action: {"token":"number"} },
            { regex: /"([^"\\]|\\.)*"/, action: {"token":"string"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\s+/, action: {"token":"white"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\/[^\n\r]*/, action: {"token":"comment"} },
        ],
        comment: [
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
