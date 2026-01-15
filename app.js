let numbers = [];

document.getElementById("excelFile")
  .addEventListener("change", readExcel);

function readExcel(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const workbook = XLSX.read(e.target.result, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    numbers = data.map(row => row.mobile).filter(Boolean);
    document.getElementById("status").innerText =
      numbers.length + " numbers loaded";
  };

  reader.readAsBinaryString(event.target.files[0]);
}

async function sendSMS() {
  const message = document.getElementById("message").value;

  if (!numbers.length || !message) {
    alert("Missing Excel or message");
    return;
  }

  const res = await fetch("https://sms-worker.bulk-sms-app.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numbers, message })
  });

  const result = await res.json();
  alert(result.status);
}

