const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Konfigurasi express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Global variable untuk tracking proses
let currentPairingProcess = null;
let pairingStatus = {
    isRunning: false,
    pairingCode: null,
    targetNumber: null,
    startTime: null
};

// Fungsi pembersihan folder auth
function cleanAuthFolder() {
    const authPath = path.join(__dirname, 'PAEDULZ');
    if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
    }
}

// Fungsi untuk memulai proses pairing
function startPairingProcess(targetNumber) {
    // Bersihkan folder auth sebelumnya
    cleanAuthFolder();

    // Spawn proses baru
    const pairingProcess = spawn('node', ['pairing no enc.js', targetNumber], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Reset status
    pairingStatus = {
        isRunning: true,
        pairingCode: null,
        targetNumber: targetNumber,
        startTime: Date.now()
    };

    // Handler untuk stdout
    pairingProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('STDOUT:', output);

        // Tangkap pairing code
        if (output.includes('PAIRING_CODE:')) {
            pairingStatus.pairingCode = output.split('PAIRING_CODE:')[1].trim();
            console.log('Pairing Code Ditemukan:', pairingStatus.pairingCode);
        }
    });

    // Handler untuk stderr
    pairingProcess.stderr.on('data', (data) => {
        console.error('STDERR:', data.toString());
    });

    // Handler saat proses selesai
    pairingProcess.on('close', (code) => {
        console.log(`Proses pairing selesai dengan kode: ${code}`);
        
        // Reset status
        pairingStatus = {
            isRunning: false,
            pairingCode: null,
            targetNumber: null,
            startTime: null
        };

        // Bersihkan proses
        currentPairingProcess = null;
    });

    return pairingProcess;
}

// Endpoint untuk memulai pairing
app.post('/start-pairing', (req, res) => {
    const { targetNumber } = req.body;

    // Validasi nomor
    if (!targetNumber || !/^62\d{9,}$/.test(targetNumber)) {
        return res.status(400).json({ 
            success: false,
            message: 'Nomor target tidak valid. Gunakan format 628xxxxxxxx' 
        });
    }

    // Hentikan proses sebelumnya jika ada
    if (currentPairingProcess) {
        try {
            currentPairingProcess.kill();
        } catch (error) {
            console.error('Gagal menghentikan proses sebelumnya:', error);
        }
    }

    try {
        // Mulai proses pairing baru
        currentPairingProcess = startPairingProcess(targetNumber);

        // Tunggu pairing code
        const checkPairingCode = setInterval(() => {
            if (pairingStatus.pairingCode) {
                clearInterval(checkPairingCode);
                res.json({
                    success: true,
                    message: 'Pairing dimulai',
                    pairingCode: pairingStatus.pairingCode,
                    targetNumber: targetNumber
                });
            } else if (Date.now() - pairingStatus.startTime > 120000) { // 2 menit timeout
                clearInterval(checkPairingCode);
                currentPairingProcess.kill();
                res.status(408).json({
                    success: false,
                    message: 'Timeout menunggu pairing code'
                });
            }
        }, 1000);

    } catch (error) {
        console.error('Gagal memulai pairing:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memulai proses pairing',
            error: error.message
        });
    }
});

// Endpoint untuk menghentikan pairing
app.post('/stop-pairing', (req, res) => {
    try {
        if (currentPairingProcess) {
            // Hentikan proses
            currentPairingProcess.kill();
            
            // Bersihkan folder auth
            cleanAuthFolder();

            // Reset status
            pairingStatus = {
                isRunning: false,
                pairingCode: null,
                targetNumber: null,
                startTime: null
            };

            res.json({ 
                success: true,
                message: 'Proses pairing berhasil dihentikan'
            });
        } else {
            res.json({ 
                success: false,
                message: 'Tidak ada proses pairing yang sedang berjalan'
            });
        }
    } catch (error) {
        console.error('Gagal menghentikan proses:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal menghentikan proses pairing',
            error: error.message
        });
    }
});

// Endpoint status pairing
app.get('/pairing-status', (req, res) => {
    res.json({
        success: true,
        ...pairingStatus
    });
});

// Jalankan server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server berjalan di http://0.0.0.0:${port}`);
});

// Tangani error yang tidak terduga
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Pastikan proses pairing dihentikan jika ada
    if (currentPairingProcess) {
        currentPairingProcess.kill();
    }
});

// Tangani penghentian proses
process.on('SIGINT', () => {
    console.log('Mematikan server...');
    
    // Hentikan proses pairing
    if (currentPairingProcess) {
        currentPairingProcess.kill();
    }

    // Bersihkan folder auth
    cleanAuthFolder();

    process.exit(0);
});