const fs = require('fs');
const readline = require('readline');

const utl = require('../../modules/utilities/utility');

const logger = require('../../modules/utilities/logger');
const stream = logger.stream;

beforeAll(async () => {
    await createFiles(['./logs/info-logs.log', './logs/error-logs.log']);
});

getLines = async (filePath) => {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // crlfDelay option to recognize all instances of CR LF ('\r\n') in file as a single line break.

    let lines = [];
    for await (const line of rl) {
        lines.push(line);
    }

    return lines;
}

createFiles = async (filePaths) => {
    for (const filePath of filePaths) {
        await fs.writeFile(filePath, `creating file for testing purposes at ${Date.now()}\n`, { flag: 'w' }, function (err) {
            if (err) {
                throw err;
            }
        });
    }
}

test('test logger stream', () => {
    const temp = logger.info;
    logger.info = jest.fn();

    stream.write("logger test");
    expect(logger.info).toBeCalledTimes(1);

    logger.info = temp;
})

test('test logger info log', async () => {
    const uuid = utl.uuid();
    const msg = `logger testing info log, ${uuid}`;
    const msgFormatted = `{"message\":\"${msg}\",\"level\":\"info\"}`
    const filePath = './logs/info-logs.log';

    logger.info(msg);

    let errorOccurred = false;
    let lines = [];

    try {
        lines = await getLines(filePath);
    } catch {
        errorOccurred = true;
    }

    expect(errorOccurred).toBe(false);
    expect(lines).toContain(msgFormatted);
})

test('test logger error log', async () => {
    const uuid = utl.uuid();
    const msg = `logger testing error log, ${uuid}`;
    const msgFormatted = `{"message\":\"${msg}\",\"level\":\"error\"}`
    const filePath = './logs/error-logs.log';

    logger.error(msg);

    let errorOccurred = false;
    let lines = [];

    try {
        lines = await getLines(filePath);
    } catch {
        errorOccurred = true;
    }

    expect(errorOccurred).toBe(false);
    expect(lines).toContain(msgFormatted);
})