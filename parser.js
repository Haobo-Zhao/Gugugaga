// 1 + 2 * 3
//
//   +
//  / \
// 1   *
//    / \
//   2   3

class ExpressionSyntax extends SyntaxNode {
    constructor() {
        super()
    }
}

class NumberExpressionSyntax extends ExpressionSyntax {
    constructor(numberToken) {
        super()

        this.numberToken = numberToken

        this.kind = SyntaxKind.numberExpression
    }

    getChildren() {
        return [this.numberToken]
    }
}

class BinaryExpressionSyntax extends ExpressionSyntax {
    constructor(left, operatorToken, right) {
        super()

        this.left = left
        this.operatorToken = operatorToken
        this.right = right

        this.kind = SyntaxKind.binaryExpression
    }

    getChildren() {
        return [this.left, this.operatorToken, this.right]
    }
}

class ParenthesizedExpressionSyntax extends ExpressionSyntax {
    constructor(openParenthesis, expression, closingParenthesis) {
        super()

        this.openParenthesis = openParenthesis
        this.expression = expression
        this.closingParenthesis = closingParenthesis

        this.kind = SyntaxKind.parenthesizedExpression
    }

    getChildren() {
        return [this.openParenthesis, this.expression, this.closingParenthesis]
    }
}

class SyntaxTree {
    constructor(diagnostics, rootExpression, endOfFileToken) {
        this.diagnostics = diagnostics
        this.rootExpression = rootExpression
        this.endOfFileToken = endOfFileToken
    }
}

class Parser {
    constructor(text) {
        this.tokens = []
        this.position = 0
        this.diagnostics = []
        this.lexer = new Lexer(text)

        // get all tokens at once
        // compiler books in the 80's usually consume one token at a time for better performance
        // but time's changed ;)

        // this.tokens will always have at least 1 element, kind SyntaxKind.endOfFile
        let token;
        do {
            token = this.lexer.nextToken()

            if (token.kind != SyntaxKind.whitespace && token.kind != SyntaxKind.badToken) {
                this.tokens.push(token)
            }
        } while (token.kind != SyntaxKind.endOfFile)

        this.diagnostics = this.diagnostics.concat(this.lexer.diagnostics)
    }

    parse() {
        return this.parseExpression()
    }

    parseExpression() {
        const expression = this.parseTerm()
        const endOfFileToken = this.matchToken(SyntaxKind.endOfFile)

        return new SyntaxTree(this.diagnostics, expression, endOfFileToken)
    }

    // handles '+' and '-'
    // and serves as an entry point for parsing any expression most of the time
    parseTerm() {
        let left = this.parseFactor()

        while (
            this.currentToken().kind == SyntaxKind.plus
            || this.currentToken().kind == SyntaxKind.minus
        ) {
            const operatorToken = this.currentToken()

            this.increasePosition()

            const right = this.parseFactor()

            left = new BinaryExpressionSyntax(left, operatorToken, right)
        }

        return left
    }

    // handles '*' and '/', both of which bind arguments stronger than '+' and '-'
    parseFactor() {
        let left = this.parsePrimaryExpression()

        while (
            this.currentToken().kind == SyntaxKind.multiplication
            || this.currentToken().kind == SyntaxKind.division
        ) {
            const operatorToken = this.currentToken()

            this.increasePosition()

            const right = this.parsePrimaryExpression()

            left = new BinaryExpressionSyntax(left, operatorToken, right)
        }

        return left
    }

    // handles
    // 1) a single number
    // 2) a parenthesized expression
    parsePrimaryExpression() {
        const token = this.currentToken()

        if (token.kind == SyntaxKind.openParenthesis) {
            return this.parseParenthesizedExpression()
        }

        const numberToken = this.matchToken(SyntaxKind.number)

        return new NumberExpressionSyntax(numberToken)
    }

    parseParenthesizedExpression() {
        const op = this.currentToken()
        this.increasePosition()

        // handles nested parenthesized expressions
        const expression = this.parseTerm()

        // provide the closing one if missed.
        // this will simplify parsing the AST
        // and let diagnostics handle errors should there be any
        const cp = this.matchToken(SyntaxKind.closingParenthesis)

        return new ParenthesizedExpressionSyntax(op, expression, cp)
    }

    // Note: this method will increase `this.position` when matched
    matchToken(kind) {
        const currentToken = this.currentToken()

        if (currentToken.kind == kind) {
            this.increasePosition()
            return currentToken
        } else {
            const errorMessage = `ERROR: was expecting a <${kind}> token, but got a <${currentToken.kind}> token`
            this.diagnostics.push(errorMessage)

            return new SyntaxToken(kind, currentToken.position, null, null)
        }
    }

    peek(offset) {
        const index = this.position + offset
        const l = this.tokens.length

        if (index >= l) {
            return this.tokens[l - 1]
        } else {
            return this.tokens[index]
        }
    }

    currentToken() {
        return this.peek(0)
    }

    nextToken() {
        const currentToken = this.currentToken()

        this.increasePosition()

        return currentToken
    }

    increasePosition() {
        this.position++
    }
}