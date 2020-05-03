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

class Parser {
    constructor(text) {
        this.tokens = []
        this.position = 0
        this.lexer = new Lexer(text)

        // get all tokens at once
        // compiler books in the 80's usually consume one token at a time for better performance
        // but time's changed ;)

        // this.tokens will always have at least 1 element, kind SyntaxKind.EndOfFile
        let token;
        do {
            token = this.lexer.nextToken()

            if (token.kind != SyntaxKind.whitespace && token.kind != SyntaxKind.badToken) {
                this.tokens.push(token)
            }
        } while (token.kind != SyntaxKind.EndOfFile)
        // log('all tokens', this.tokens)
    }

    parse() {
        let left = this.ParsePrimaryExpression()
        while (
            this.currentToken().kind == SyntaxKind.plus
            || this.currentToken().kind == SyntaxKind.minus
        ) {
            const operatorToken = this.currentToken()

            this.increasePosition()

            const right = this.ParsePrimaryExpression()

            left = new BinaryExpressionSyntax(left, operatorToken, right)
        }
        return left
    }

    ParsePrimaryExpression() {
        const numberToken = this.match(SyntaxKind.number)

        return new NumberExpressionSyntax(numberToken)
    }

    // Note: increase this.position when matched
    match(kind) {
        const currentToken = this.currentToken()
        if (currentToken.kind == kind) {
            this.increasePosition()
            return currentToken
        } else {
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