function main() {
    log('\n******** Start parsing ********\n\n')

    // const line = '1 1 * @#'
    // const line = '1 + 2 + 3'
    // const line = '-(1 + 1) + 2 * 3'
    // const line = '(1 + 2) * 3'
    // const line = '-1 + 2 * 3'
    const line = 'false && !true || !false'

    const parser = new Parser(line)
    const syntaxTree = parser.parse()
    const rootExpression = syntaxTree.rootExpression
    const binder = new Binder()
    const boundExpression = binder.bindExpression(rootExpression)

    const diagnostics = parser.diagnostics.concat(binder.diagnostics)

    log(`Parsing '${line}':\n\n`)
    prettyLog(rootExpression)

    if (diagnostics.length == 0) {
        const evaluator = new Evaluator(boundExpression)
        const value = evaluator.evaluate()

        log('\n******** Start evaluating ********\n\n')
        log(`> ${value}`)
    } else {
        diagnostics.forEach(errorMessage => {
            console.error(errorMessage)
        });
    }
}

main()
