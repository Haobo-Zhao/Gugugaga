function main() {
    log('\n******** Start parsing ********\n\n')

    // const line = '1 1 * @#'
    // const line = '1 + 2 + 3'
    // const line = '1 + 2 * 3'
    const line = '(1 + 2) * 3'

    const parser = new Parser(line)
    const syntaxTree = parser.parse()
    const rootExpression = syntaxTree.rootExpression

    log(`Parsing: ${line}:\n\n`)
    prettyLog(rootExpression)

    if (parser.diagnostics.length == 0) {
        const evaluator = new Evaluator(rootExpression)
        const value = evaluator.evaluate()

        log('\n******** Start evaluating ********\n\n')
        // log(rootExpression)
        log(`> ${value}`)
    } else {
        parser.diagnostics.forEach(errorMessage => {
            console.error(errorMessage)
        });
    }
}

main()
