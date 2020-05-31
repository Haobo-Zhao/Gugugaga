class SyntaxNode {
    constructor() {

    }

    getChildren() {

    }
}

class TextSpan {
    constructor(start, length) {
        this.start = start
        this.length = length
        this.end = start + length   // exclusive
    }
}

class SyntaxToken extends SyntaxNode {
    constructor(kind, position, text, value) {
        super()

        this.kind = kind
        this.position = position
        this.text = text
        this.value = value
        this.textSpan = new TextSpan(position, text.length)
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

    identifierToken: 'identifierToken',
    equalsToken: 'equalsToken',

    badToken: 'badToken',
    endOfFile: 'endOfFile',

    equals: 'equals',
    unequals: 'unequals',

    logicalNegation: 'logicalNegation',
    logicalAnd: 'logicalAnd',
    logicalOr: 'logicalOr',

    literalExpression: 'literalExpression',
    nameExpression: 'nameExpression',
    assignmentExpression: 'assignmentExpression',
    unaryExpression: 'unaryExpression',
    binaryExpression: 'binaryExpression',
    parenthesizedExpression: 'parenthesizedExpression',
}

class Lexer {
    constructor(text) {
        this.text = text
        this.position = 0
        this.diagnosticBag = new DiagnosticBag()
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
        // 1) literals
        // 2) + - * / ( )
        // 3) whlitespace

        if (this.position >= this.text.length) {
            return new SyntaxToken(SyntaxKind.endOfFile, this.position, '\0', null)
        }

        const char = this.currentChar()
        const start = this.position

        if (DIGITS.includes(char)) {
            while (DIGITS.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const text = this.text.slice(start, end)
            const value = Number(text)

            if (isNaN(value)) {
                const textSpan = new TextSpan(start, text.length)
                this.diagnosticBag.reportInvalidNumber(textSpan, typeof(1))
            }

            return new SyntaxToken(SyntaxKind.number, start, text, value)
        } else if (WHITESPACES.includes(char)) {
            while (WHITESPACES.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const text = this.text.slice(start, end)

            return new SyntaxToken(SyntaxKind.whitespace, start, text, null)
        } else if (OPERATORS.includes(char)) {
            this.increasePosition()

            if (char == '+') {
                return new SyntaxToken(SyntaxKind.plus, start, char, null)
            } else if (char == '-') {
                return new SyntaxToken(SyntaxKind.minus, start, char, null)
            } else if (char == '*') {
                return new SyntaxToken(SyntaxKind.multiplication, start, char, null)
            } else if (char == '/') {
                return new SyntaxToken(SyntaxKind.division, start, char, null)
            }
        } else if (PARENTHESIS.includes(char)) {
            this.increasePosition()

            if (char == '(') {
                return new SyntaxToken(SyntaxKind.openParenthesis, start, char, null)
            } else if (char == ')') {
                return new SyntaxToken(SyntaxKind.closingParenthesis, start, char, null)
            }
        } else if (char == 't' || char == 'f') {

            while ('true'.includes(this.currentChar()) || 'false'.includes(this.currentChar())) {
                this.increasePosition()
            }

            const end = this.position
            const keyword = this.text.slice(start, end)
            const syntaxKind = getKeywordSyntaxKind(keyword)

            return new SyntaxToken(syntaxKind, start, keyword, null)
        } else if (char == '&' || char == '|') {
            const nextChar = this.lookAhead(1)

            if (char == nextChar) {
                this.increasePosition()
                this.increasePosition()

                const syntaxKind = char == '&'
                    ? SyntaxKind.logicalAnd
                    : SyntaxKind.logicalOr

                return new SyntaxToken(syntaxKind, start, `${char}${nextChar}`, null)
            }
        } else if (char == '=') {
            const nextChar = this.lookAhead(1)
            // == equals
            if (char == nextChar) {
                this.increasePosition()
                this.increasePosition()

                const syntaxKind = SyntaxKind.equals

                return new SyntaxToken(syntaxKind, start, `${char}${nextChar}`, null)
            } else {    // = assignment
                this.increasePosition()

                return new SyntaxToken(SyntaxKind.equals, start, `=`, null)
            }
        // handles
        // 1) unequals
        // 2) logicalNegation
        } else if (char == '!') {
            const nextChar = this.lookAhead(1)

            // unequals
            if (nextChar == '=') {
                this.increasePosition()
                this.increasePosition()

                const syntaxKind = SyntaxKind.unequals

                return new SyntaxToken(syntaxKind, start, `${char}${nextChar}`, null)
            } else {
                // logicalNegation
                this.increasePosition()

                const syntaxKind = SyntaxKind.logicalNegation

                return new SyntaxToken(syntaxKind, start, char, null)
            }
        } else if (LOWER_CASES.includes(char) || UPPER_CASES.includes(char)) {
            while (!WHITESPACES.includes(this.currentChar()) && this.currentChar() != EOF) {
                this.increasePosition()
            }

            const end = this.position
            const text = this.text.slice(start, end)

            return new SyntaxToken(SyntaxKind.identifierToken, start, text, null)
        }

        this.diagnosticBag.reportBadCharacter(start, char)

        const badToekn = new SyntaxToken(
            SyntaxKind.badToken,
            this.position,
            this.text.slice(this.position, this.position + 1, null)
        )
        this.increasePosition()
        return badToekn
    }
}
