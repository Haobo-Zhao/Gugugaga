class SyntaxNode {
    constructor() {

    }

    getChildren() {

    }
}

class SyntaxToken extends SyntaxNode {
    constructor(kind, position, text, value) {
        super()

        this.kind = kind
        this.position = position
        this.text = text
        this.value = value
    }

    getChildren() {
        return []
    }
}

const SyntaxKind = {
    falseKeyword: 'falseKeyword',
    trueKeyword: 'trueKeyword',

    number: 'number',
    literal: 'literal',
    whitespace: 'whitespace',

    plus: 'plus',
    minus: 'minus',
    multiplication: 'multiplication',
    division: 'division',

    openParenthesis: 'openParenthesis',
    closingParenthesis: 'closingParenthesis',

    IdentifierToken: 'IdentifierToken',

    badToken: 'badToken',
    endOfFile: 'endOfFile',

    logicalNegation: 'logicalNegation',
    logicalAnd: 'logicalAnd',
    logicalOr: 'logicalOr',

    unaryExpression: 'unaryExpression',
    literalExpression: 'literalExpression',
    binaryExpression: 'binaryExpression',
    parenthesizedExpression: 'parenthesizedExpression',
}

class Lexer {
    constructor(text) {
        this.text = text
        this.position = 0
        this.diagnostics = []
    }

    currentChar() {
        if (this.position >= this.text.length) {
            return '\0'
        }

        return this.text[this.position]
    }

    lookAhead(offset) {
        const i = this.position + offset
        if (i >= this.text.length) {
            return '\0'
        }

        return this.text[i]
    }

    increasePosition() {
        this.position++
    }

    nextToken() {
        // literal
        // + - * / ( )
        // whlitespace

        if (this.position >= this.text.length) {
            return new SyntaxToken(SyntaxKind.endOfFile, this.position, '\0', null)
        }

        const char = this.currentChar()
        // log(`current char: (${char})`)

        if (DIGITS.includes(char)) {
            const start = this.position
            while (DIGITS.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const text = this.text.slice(start, end)
            const value = Number(text)

            if (isNaN(value)) {
                this.diagnostics.push(`ERROR: '${text}' is not a valid literal.`)
            }

            return new SyntaxToken(SyntaxKind.number, start, text, value)
        } else if (WHITESPACES.includes(char)) {
            const start = this.position
            while (WHITESPACES.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const text = this.text.slice(start, end)

            return new SyntaxToken(SyntaxKind.whitespace, start, text, null)
        } else if (OPERATORS.includes(char)) {
            this.increasePosition()

            if (char == '+') {
                return new SyntaxToken(SyntaxKind.plus, this.position, char, null)
            } else if (char == '-') {
                return new SyntaxToken(SyntaxKind.minus, this.position, char, null)
            } else if (char == '*') {
                return new SyntaxToken(SyntaxKind.multiplication, this.position, char, null)
            } else if (char == '/') {
                return new SyntaxToken(SyntaxKind.division, this.position, char, null)
            }
        } else if (PARENTHESIS.includes(char)) {
            this.increasePosition()

            if (char == '(') {
                return new SyntaxToken(SyntaxKind.openParenthesis, this.position, char, null)
            } else if (char == ')') {
                return new SyntaxToken(SyntaxKind.closingParenthesis, this.position, char, null)
            }
        } else if (char == 't' || char == 'f') {
            const start = this.position

            while ('true'.includes(this.currentChar()) || 'false'.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const keyword = this.text.slice(start, end)
            const syntaxKind = getKeywordSyntaxKind(keyword)

            return new SyntaxToken(syntaxKind, start, keyword, null)
        } else if (char == '!') {
            this.increasePosition()

            const start = this.position
            const syntaxKind = SyntaxKind.logicalNegation

             return new SyntaxToken(syntaxKind, start, char, null)
        } else if (char == '&' || char == '|') {
            const nextChar = this.lookAhead(1)
            if (char == nextChar) {
                this.increasePosition()
                this.increasePosition()

                const start = this.position
                const syntaxKind = char == '&'
                    ? SyntaxKind.logicalAnd
                    : SyntaxKind.logicalOr

                return new SyntaxToken(syntaxKind, start, `${char}${nextChar}`, null)
            }
        }

        const errorMessage = `ERROR: bad character: ${this.currentChar()}`
        this.diagnostics.push(errorMessage)

        const badToekn = new SyntaxToken(
            SyntaxKind.badToken,
            this.position,
            this.text.slice(this.position, this.position + 1, null)
        )
        this.increasePosition()
        return badToekn
    }
}
