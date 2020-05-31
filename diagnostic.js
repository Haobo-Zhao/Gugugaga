class Diagnostic
{
    constructor(textSpan, message)
    {
        this.textSpan = textSpan
        this.message = message
    }
}

class DiagnosticBag
{
    constructor()
    {
        this.diagnostics = []
    }

    addBag(diagnosticBag)
    {
        this.diagnostics.concat(diagnosticBag.diagnostics)
    }

    report(textSpan, message)
    {
        const d = new Diagnostic(textSpan, message)
        this.diagnostics.push(d)
    }

    reportInvalidNumber(textSpan, text, type)
    {
        const message = `The number ${text} isn't a valid ${type}`;
        this.report(textSpan, message);
    }

    reportBadCharacter(position, character)
    {
        const textSpan = new TextSpan(position, 1);
        const message = `Bad character input: '${character}'`
        this.report(textSpan, message);
    }

    reportUnexpectedToken(textSpan, actualKind, expectedKind)
    {
        const message = `unmatched token: was expecting a <${expectedKind}>, but get a <${actualKind}>`
        this.report(textSpan, message);
    }

    reportUndefinedName(textSpan, name)
    {
        const message = `variable '${name}' doesn't exist`
        this.report(textSpan, message);
    }

    reportUndefinedUnaryOperator(textSpan, operatorText, operandType)
    {
        const message = `Unary operator '${operatorText}' is not defined for type <${operandType}>`
        this.report(textSpan, message);
    }

    reportUndefinedBinaryOperator(textSpan, operatorText, leftType, rightType)
    {
        const message = `Binary operator '${operatorText}' is not defined for types <${leftType}> and <${rightType}>`
        this.report(textSpan, message);
    }
}
