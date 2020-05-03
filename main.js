function main() {
    log('******** Start parsing ********\n\n')

    const line = '1 + 2 + 3'
    // const line = '1 + 2 * 3'
    const parser = new Parser(line)
    const expression = parser.parse()

    log(`Parsing ${line}:\n\n`)
    prettyLog(expression)
}

main()
