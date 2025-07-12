const express = require("express");
const cors = require("cors");
const escpos = require("escpos");

escpos.USB = require("escpos-usb");

const app = express();
app.use(express.json());
app.use(cors());

// Fungsi untuk mendapatkan device printer
function getPrinter() {
  try {
    const device = new escpos.USB(); // Inisialisasi ulang setiap kali ada permintaan
    const printer = new escpos.Printer(device);
    return { device, printer };
  } catch (error) {
    console.warn("⚠️ Printer tidak ditemukan. Pastikan printer terhubung.");
    return null;
  }
}

app.post("/print", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Teks tidak boleh kosong" });
  }

  const printerData = getPrinter();
  if (!printerData) {
    return res.status(500).json({ error: "Printer belum tersedia. Silakan hubungkan printer dan coba lagi." });
  }

  const { device, printer } = printerData;

  console.log("📥 Menerima permintaan print:", text);

  device.open((error) => {
    if (error) {
      console.error("❌ Gagal menghubungkan ke printer:", error);
      return res.status(500).json({ error: "Tidak dapat terhubung ke printer" });
    }

    printer
      .align("ct")
      .text(text)
      .newLine()
      .cut()
      .close();

    console.log("✅ Print berhasil");
    res.json({ success: "Printing done" });
  });
});

app.post("/printAntrian", (req, res) => {
  const { nomorAntrian, poli, tanggal, waktu } = req.body;

  if (!nomorAntrian || !poli || !tanggal || !waktu) {
    return res.status(400).json({ error: "Data antrian tidak lengkap!" });
  }

  const printerData = getPrinter();
  if (!printerData) {
    return res.status(500).json({ error: "Printer belum tersedia. Silakan hubungkan printer dan coba lagi." });
  }

  const { device, printer } = printerData;

  console.log("📥 Menerima permintaan cetak antrian:", nomorAntrian);

  device.open((error) => {
    if (error) {
      console.error("❌ Gagal menghubungkan ke printer:", error);
      return res.status(500).json({ error: "Tidak dapat terhubung ke printer" });
    }

    printer
      .align("ct")
      .size(0, 0)
      .text("RSUD MUARA BENGKAL")
      .newLine()
      .size(1, 1)
      .text("NOMOR ANTRIAN")
      .newLine()
      .size(2, 2)
      .text(nomorAntrian)
      .size(0, 0)
      .newLine()
      .text(poli)
      .newLine()
      .text(tanggal)
      .text(waktu)
      .newLine()
      .cut()
      .close();

    console.log("✅ Nomor antrian berhasil dicetak!");
    res.json({ success: "Printing done" });
  });
});

// Jalankan server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🚀 Print server berjalan di http://localhost:${PORT}`);
});
