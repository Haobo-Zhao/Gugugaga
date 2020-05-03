const log = console.log.bind(console)

const prettyLog = (node, indent = '', marker = '', isLastChild = true, isRoot = true) => {
    let message = `${indent}${marker}${node.kind}`
    if (node && node.value) {
        message += ` ${node.value}`
    }
    log(message)

    const children = node.getChildren()
    const lastChild = children[children.length - 1]

    const parentIsLastChild = isLastChild
    const parentIsRoot = isRoot
    const parentIndent = indent
    const childIndent = parentIndent + (parentIsRoot
        ? ''
        : `${parentIsLastChild ? '    ' : '│   '}`
    )
    children.forEach(child => {
        const childMarker = child == lastChild
            ? '└── '
            : '├── '

        prettyLog(child, childIndent, childMarker, child == lastChild, false)
    });
}

const DIGITS = '0123456789'
const WHITESPACES = ' \s\t\n\r\v'
const OPERATORS = '+-*/'
const PARENTHESIS = '()'
