const log = console.log.bind(console)

function prettyLog(node, indent='') {
    const message = `${indent}${node.kind}${node && node.value ? ` ${node.value}` : ''}`
    log(message)

    indent += '    '
    node.getChildren().forEach(child => {
        prettyLog(child, indent)
    });
}

const DIGITS = '0123456789'
const WHITESPACES = ' \s\t\n\r\v'
const OPERATORS = '+-*/()'
