// -1 + 2 * 3
//
//    +
//  /  \
// -    *
// |   / \
// 1  2   3


class ExpressionSyntax extends SyntaxNode {
    constructor() {
        super()
    }
}

class LiteralExpressionSyntax extends ExpressionSyntax {
    constructor(literalToken) {
        super()
        this.initializeInstance(literalToken, literalToken.value)
    }

    initializeInstance(literalToken, value) {
        this.literalToken = literalToken
        this.value = value
        this.kind = SyntaxKind.literalExpression
    }

    getChildren() {
        return [this.literalToken]
    }
}

class UnaryExpressionSyntax extends ExpressionSyntax {
    constructor(operatorToken, operandExpression) {
        super()

        this.operatorToken = operatorToken
        this.operandExpression = operandExpression

        this.kind = SyntaxKind.unaryExpression
    }

    getChildren() {
        return [this.operatorToken, this.operandExpression]
    }
}

class BinaryExpressionSyntax extends ExpressionSyntax {
    constructor(leftExpression, operatorToken, rightExpression) {
        super()

        this.leftExpression = leftExpression
        this.operatorToken = operatorToken
        this.rightExpression = rightExpression

        this.kind = SyntaxKind.binaryExpression
    }

    getChildren() {
        return [this.leftExpression, this.operatorToken, this.rightExpression]
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
    constructor(diagnosticBag, rootExpression, endOfFileToken) {
        this.diagnosticBag = diagnosticBag
        this.rootExpression = rootExpression
        this.endOfFileToken = endOfFileToken
    }
}

class Parser {
    constructor(text) {
        this.tokens = []
        this.position = 0
        this.diagnosticBag = new DiagnosticBag()
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

        this.diagnosticBag.addBag(this.lexer.diagnosticBag)
    }

    parse() {
        const expressionSyntax = this.parseExpression()
        const endOfFileToken = this.matchToken(SyntaxKind.endOfFile)

        return new SyntaxTree(this.diagnosticBag, expressionSyntax, endOfFileToken)
    }

    parseExpression(parentPrecedence = 0) {
        let leftExpression
        let currentToken = this.currentToken()
        const unaryPrecedence = getUnaryOperatorPrecedence(currentToken.text)

        // handles unary expressions
        if (unaryPrecedence != 0 && unaryPrecedence >= parentPrecedence) {
            this.increasePosition()
            const operandExpression = this.parseExpression(unaryPrecedence)
            leftExpression = new UnaryExpressionSyntax(currentToken, operandExpression)
        } else {
            leftExpression = this.parsePrimaryExpression()
        }

        while (true) {
            const operatorToken = this.currentToken()
            const precedence = getBinaryOperatorPrecedence(operatorToken.text)
            // when at endOfFile, precedence will be 0
            if (precedence == 0 || precedence <= parentPrecedence) {
                break
            }

            this.increasePosition()
            const rightExpression = this.parseExpression(precedence)
            leftExpression = new BinaryExpressionSyntax(leftExpression, operatorToken, rightExpression)
        }

        return leftExpression
    }

    // handles
    // 1) a single literal
    // 2) a parenthesized expression
    parsePrimaryExpression() {
        const token = this.currentToken()

        if (token.kind == SyntaxKind.openParenthesis) {
            return this.parseParenthesizedExpression()
        }

        // handles booleans
        if (token.kind == SyntaxKind.trueKeyword || token.kind == SyntaxKind.falseKeyword) {
            const value = token.kind == SyntaxKind.trueKeyword
            token.value = value
            this.increasePosition()

            return new LiteralExpressionSyntax(token)
        }

        const numberToken = this.matchToken(SyntaxKind.number)

        return new LiteralExpressionSyntax(numberToken)
    }

    parseParenthesizedExpression() {
        const op = this.currentToken()
        this.increasePosition()

        // handles nested parenthesized expressions
        const expression = this.parseExpression()

        // provide the closing one if missed.
        // this will simplify parsing the AST
        // and let diagnostics handle errors should there be any
        const cp = this.matchToken(SyntaxKind.closingParenthesis)

        return new ParenthesizedExpressionSyntax(op, expression, cp)
    }

    // Note: this method will increase `this.position` when matched
    matchToken(expectedKind) {
        const currentToken = this.currentToken()

        if (currentToken.kind == expectedKind) {
            this.increasePosition()
            return currentToken
        } else {
            const textSpan = currentToken.textSpan
            this.diagnosticBag.reportUnexpectedToken(textSpan, currentToken.kind, expectedKind)

            return new SyntaxToken(expectedKind, currentToken.position, '\0', null)
        }
    }

    lookAhead(offset) {
        const index = this.position + offset
        const l = this.tokens.length

        if (index >= l) {
            return this.tokens[l - 1]
        } else {
            return this.tokens[index]
        }
    }

    currentToken() {
        return this.lookAhead(0)
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