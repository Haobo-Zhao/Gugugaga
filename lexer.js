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
    number: 'number',
    whitespace: 'whitespace',

    plus: 'plus',
    minus: 'minus',
    multiplication: 'multiplication',
    division: 'division',

    openParenthesis: 'openParenthesis',
    closingParenthesis: 'closingParenthesis',

    badToken: 'badToken',
    endOfFile: 'endOfFile',

    numberExpression: 'numberExpression',
    binaryExpression: 'binaryExpression',
}

class Lexer {
    constructor(text) {
        this.text = text
        this.position = 0
        this.diagnostics = []
    }

    currentChar() {
        if (this.position >= this.text.length) {
            // log(this.position, this.text[this.position])
            // log('reached the end of code')
            return '\0'
        }

        return this.text[this.position]
    }

    increasePosition() {
        this.position++
    }

    nextToken() {
        // number
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
            return new SyntaxToken(SyntaxKind.number, start, text, value)
        } else if (WHITESPACES.includes(char)) {
            // log('white')
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
            } else if (char == '(') {
                return new SyntaxToken(SyntaxKind.openParenthesis, this.position, char, null)
            } else if (char == ')') {
                return new SyntaxToken(SyntaxKind.closingParenthesis, this.position, char, null)
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
