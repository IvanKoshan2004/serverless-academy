import { resolve } from "path";
import { readFile, writeFile, readdir } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

export class DBCore {
    #bufferPointer = 0;
    #bufferSize = 2 ** 16;
    #buffer = Buffer.alloc(this.#bufferSize);
    #encoding = "utf-8";
    #flushInterval;
    #flushIntervalPeriodMS = 300;
    #folderNames = {
        dataFolderName: "data",
    };
    #fileNames = {
        indexFileName: "index",
    };
    #index = new Map();
    #lastBufferPointerValue = 0;
    #paths = {
        dbFolderPath: "",
        dataFolderPath: "",
        indexFilePath: "",
    };
    #workingFilePointer = 1;
    #maxInMemoryReadFiles = 10;
    #readFileBuffers = [];

    constructor(dbFolderPath) {
        this.#paths.dbFolderPath = dbFolderPath;
        this.#paths.dataFolderPath = resolve(
            dbFolderPath,
            this.#folderNames.dataFolderName
        );
        this.#paths.indexFilePath = resolve(
            dbFolderPath,
            this.#fileNames.indexFileName
        );
        this.initialized = false;
        this.running = true;
    }
    async initDb() {
        this.#initFolderStructure();
        await this.#initWorkingBuffer();
        await this.#initIndex();
        this.#flushInterval = setInterval(
            this.#flushDataBuffer.bind(this),
            this.#flushIntervalPeriodMS
        );
        this.initialized = true;
    }
    stopDb() {
        this.running = false;
        this.#flushDataBuffer();
        clearInterval(this.#flushInterval);
    }
    async store(key, value) {
        if (!this.initialized) throw Error("DB not initialized");
        if (!this.running) throw Error("DB not running");
        if (!this.#valueFitsInWorkingBuffer(value)) {
            await this.#writeWorkingBufferToFile();
            this.#setNextWorkingBuffer();
        }
        const [valueStart, valueEnd] = this.#appendToWorkingBuffer(value);
        this.#addKeyToIndex(
            key,
            this.#workingFilePointer,
            valueStart,
            valueEnd
        );
        await this.#writeIndexToFile(key);
    }
    async get(key) {
        if (!this.initialized) throw Error("DB not initialized");
        if (!this.running) throw Error("DB not running");
        const indexData = this.#index.get(key);
        if (!indexData) {
            throw Error("Value not stored in DB");
        }
        if (indexData.filePointer == this.#workingFilePointer) {
            const readBytesLength =
                indexData.valueEnd - indexData.valueStart + 1;
            const readBytesBuffer = Buffer.allocUnsafe(readBytesLength);
            this.#buffer.copy(
                readBytesBuffer,
                0,
                indexData.valueStart,
                indexData.valueEnd + 1
            );
            return readBytesBuffer.toString(this.#encoding);
        }
        let readFileBuffer = this.#readFileBuffers.find(
            (el) => el.filePointer == indexData.filePointer
        );
        if (!readFileBuffer) {
            await this.#readFile(indexData.filePointer);
            readFileBuffer = this.#readFileBuffers.find(
                (el) => el.filePointer == indexData.filePointer
            );
            if (!readFileBuffer) {
                throw Error("Data file can't be read");
            }
        }
        const readBytesLength = indexData.valueEnd - indexData.valueStart + 1;
        const readBytesBuffer = Buffer.allocUnsafe(readBytesLength);
        readFileBuffer.fileBuffer.copy(
            readBytesBuffer,
            0,
            indexData.valueStart,
            indexData.valueEnd + 1
        );
        return readBytesBuffer.toString(this.#encoding);
    }
    #addKeyToIndex(key, filePointer, valueStart, valueEnd) {
        this.#index.set(key, {
            filePointer: filePointer,
            valueStart: valueStart,
            valueEnd: valueEnd,
        });
    }
    #appendToWorkingBuffer(value) {
        const valueStartPointer = this.#bufferPointer;
        this.#buffer.write(value, this.#bufferPointer, this.#encoding);
        this.#bufferPointer += Buffer.byteLength(value, this.#encoding);
        const valueEndPointer = this.#bufferPointer - 1;
        return [valueStartPointer, valueEndPointer];
    }
    #flushDataBuffer() {
        if (this.#lastBufferPointerValue != this.#bufferPointer) {
            this.#writeWorkingBufferToFile();
        }
    }
    #getFilePath(filePointer) {
        return resolve(this.#paths.dataFolderPath, filePointer.toString());
    }
    #getWorkingFilePath() {
        return this.#getFilePath(this.#workingFilePointer);
    }
    #initFolderStructure() {
        if (!existsSync(this.#paths.dbFolderPath)) {
            mkdirSync(this.#paths.dbFolderPath);
        }
        if (!existsSync(this.#paths.dataFolderPath)) {
            mkdirSync(this.#paths.dataFolderPath);
        }
    }
    async #initIndex() {
        if (!existsSync(this.#paths.indexFilePath)) {
            return;
        }
        const fileContent = await readFile(
            this.#paths.indexFilePath,
            this.#encoding
        );
        const entries = fileContent.split("\n");
        for (const entry of entries) {
            const entryValues = entry.split("\x00");
            if (entryValues.length != 4) {
                continue;
            }
            this.#addKeyToIndex(
                entryValues[0],
                parseInt(entryValues[1]),
                parseInt(entryValues[2]),
                parseInt(entryValues[3])
            );
        }
    }
    async #initWorkingBuffer() {
        const dataFiles = await readdir(this.#paths.dataFolderPath);
        for (const file of dataFiles) {
            if (parseInt(file).toString() === file) {
                this.#workingFilePointer = parseInt(file);
            }
        }
        if (existsSync(this.#getWorkingFilePath())) {
            const fileContent = await readFile(
                this.#getWorkingFilePath(),
                this.#encoding
            );
            this.#appendToWorkingBuffer(fileContent);
        }
    }
    async #readFile(filePointer) {
        const fileContent = await readFile(
            this.#getFilePath(filePointer),
            this.#encoding
        );
        const fileBuffer = Buffer.from(fileContent, this.#encoding);
        this.#readFileBuffers.push({
            filePointer: filePointer,
            fileBuffer: fileBuffer,
        });
        if (this.#readFileBuffers.length > this.#maxInMemoryReadFiles) {
            this.#readFileBuffers.unshift();
        }
    }
    #setNextWorkingBuffer() {
        this.#workingFilePointer += 1;
        this.#bufferPointer = 0;
    }
    #valueFitsInWorkingBuffer(value) {
        const encodedLength = Buffer.byteLength(value, this.#encoding);
        if (encodedLength > this.#bufferSize) {
            throw Error(
                `Value encoded length excedes max size ${this.#bufferSize}`
            );
        }
        return this.#bufferPointer + encodedLength <= this.#bufferSize;
    }
    async #writeIndexToFile(key) {
        const indexData = this.#index.get(key);
        const entry = `${key}\x00${indexData.filePointer}\x00${indexData.valueStart}\x00${indexData.valueEnd}\n`;
        await writeFile(this.#paths.indexFilePath, entry, { flag: "a" });
    }
    async #writeWorkingBufferToFile() {
        this.#lastBufferPointerValue = this.#bufferPointer;
        const writtenBytes = Buffer.allocUnsafe(this.#bufferPointer);
        this.#buffer.copy(writtenBytes, 0, 0, this.#bufferPointer);
        await writeFile(this.#getWorkingFilePath(), writtenBytes);
    }
}
