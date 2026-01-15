let numbers = [];

/* ===== READ EXCEL ===== */
document.getElementById("excelFile")
  .addEventListener("change", readExcel);

function readExcel(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const workbook = XLSX.read(e.target.result, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    numbers = data.map(row => row.mobile).filter(Boolean);
    showToast(numbers.length + " numbers loaded", true);
  };

  reader.readAsBinaryString(event.target.files[0]);
}

/* ===== SEND SMS ===== */
async function sendSMS() {
  if (numbers.length === 0) {
    showToast("Please upload Excel file", false);
    return;
  }

  const message = document.getElementById("message").value.trim();
  if (!message) {
    showToast("Message cannot be empty", false);
    return;
  }

  showLoading(true);
  showProgress(true);

  try {
    const res = await fetch(
      "https://sms-worker.bulk-sms-app.workers.dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers, message })
      }
    );

    const result = await res.json();

    updateProgress(numbers.length, numbers.length);
    showToast(result.status || "SMS sent successfully", true);

  } catch (error) {
    console.error(error);
    showToast("Failed to send SMS", false);
  }

  showLoading(false);
}

/* ===== UI HELPERS ===== */
function updateCounter() {
  const msg = document.getElementById("message").value;
  document.getElementById("charCount").innerText = msg.length;
}

function applyTemplate(text) {
  if (text) {
    document.getElementById("message").value = text;
    updateCounter();
  }
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}

function showProgress(show) {
  document.getElementById("progressBox").classList.toggle("d-none", !show);
}

function updateProgress(sent, total) {
  const percent = Math.round((sent / total) * 100);
  const bar = document.getElementById("progressBar");
  bar.style.width = percent + "%";
  bar.innerText = percent + "%";
}

function showToast(message, success = true) {
  const toastEl = document.getElementById("toastMsg");
  toastEl.classList.remove("bg-success", "bg-danger");
  toastEl.classList.add(success ? "bg-success" : "bg-danger");
  document.getElementById("toastText").innerText = message;

  new bootstrap.Toast(toastEl).show();
}
