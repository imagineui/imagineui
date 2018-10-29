import program from 'commander';

program
    .version('0.1.0', '-v, --version')
    .option('-i, --input', 'source file (.scene)')
    .option('-o, --output', 'output path (format defined by renderer)')
    .option('-r, --renderer [type]', 'how should the scene be rendered [crayon-png]', 'json, crayon-png')
    .parse(process.argv);
