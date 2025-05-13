
function generateQR() {
    const r = parseInt(document.getElementById("r").value);
    const g = parseInt(document.getElementById("g").value);
    const b = parseInt(document.getElementById("b").value);
    const kodeSampel = document.getElementById("kodeSampel").value.trim();

    if (isNaN(r) || isNaN(g) || isNaN(b) || !kodeSampel) {
        alert("Harap isi nilai RGB (0-255) dan kode sampel (misal: RTK-001)");
        return;
    }

    const qr = new QRious({
        element: document.getElementById("qrCanvas"),
        size: 200,
        value: JSON.stringify({ r, g, b, kodeSampel })
    });
}

function handleQRFile(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            const jsQR = window.jsQR || null;
            if (!jsQR) {
                alert("Perlu library QR reader tambahan (misalnya jsQR).");
                return;
            }

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
                extractRGBFromQR(code.data);
            } else {
                alert("QR tidak terdeteksi.");
            }
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function extractRGBFromQR(text) {
    try {
        const data = JSON.parse(text);
        if (data.r !== undefined && data.g !== undefined && data.b !== undefined) {
            updateDisplay({ r: data.r, g: data.g, b: data.b }, data.kodeSampel);
        }
    } catch (e) {
        document.getElementById("quality").innerText = "Format QR tidak sesuai.";
    }
}

function updateDisplay(rgb, kodeSampel = null) {
    const quality = interpretColor(rgb);
    const price = getPriceByQuality(quality);

    document.getElementById("quality").innerText = "Kualitas: " + quality;
    document.getElementById("price").innerText = "Harga: " + price;

    if (kodeSampel) {
        document.getElementById("sampleCode").innerText = "Kode Sampel: " + kodeSampel;
    } else {
        document.getElementById("sampleCode").innerText = "";
    }
}

function interpretColor(rgb) {
    const { r, g, b } = rgb;
    if (r > 200 && g < 100 && b < 100) return "Sangat Layak (Merah Kecoklatan)";
    if (r > 200 && g > 100 && b < 100) return "Layak (Oranye/Merah Muda)";
    if (r > 200 && g > 200 && b < 100) return "Tidak Layak (Kuning Cerah)";
    return "Tidak Dikenali";
}

function getPriceByQuality(quality) {
    switch (quality) {
        case "Sangat Layak (Merah Kecoklatan)": return "Rp15.000";
        case "Layak (Oranye/Merah Muda)": return "Rp12.000";
        case "Tidak Layak (Kuning Cerah)": return "Rp6.000";
        default: return "Rp0";
    }
}
