function main() {
    log('******** Start parsing ********\n\n')

    const line = '1 1 * @#'
    // const line = '1 + 2 + 3'
    // const line = '1 + 2 * 3'
    const parser = new Parser(line)
    const syntaxTree = parser.parse()
    const rootExpression = syntaxTree.rootExpression

    log(`Parsing ${line}:\n\n`)
    prettyLog(rootExpression)

    if (parser.diagnostics) {
        parser.diagnostics.forEach(errorMessage => {
            console.error(errorMessage)
        });
    }
}

main()
