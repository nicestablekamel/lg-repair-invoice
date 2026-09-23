const $ = (id) => document.getElementById(id);

let invoiceNumber = localStorage.getItem("lg_invoice_number") || "1";

function currentInvoiceNumber() {
  return `INV-${String(invoiceNumber).padStart(4, "0")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0
  }).format(Number(value || 0)) + " DA";
}

function getFormData() {
  return {
    dechargeDate: $("dechargeDate").value.trim(),
    companyName: $("companyName").value.trim(),
    companyPhone: $("companyPhone").value.trim(),
    companyEmail: $("companyEmail").value.trim(),
    companyAddress: $("companyAddress").value.trim(),
    clientName: $("clientName").value.trim(),
    clientPhone: $("clientPhone").value.trim(),
    clientEmail: $("clientEmail").value.trim(),
    productCategory: $("productCategory").value,
    serialNumber: $("serialNumber").value.trim(),
    problemDescription: $("problemDescription").value.trim(),
    repairQuote: $("repairQuote").value,
    repairStatus: document.querySelector('input[name="repairStatus"]:checked').value,
    policyNote: $("policyNote").value.trim(),
    invoiceNumber: currentInvoiceNumber(),
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date())
  };
}

function invoiceTemplate(data, repairman = false) {
  const inactive = data.repairStatus !== "Active";

  return `
    <div class="invoice-top">
      <div class="company">
        <div class="logo-placeholder"><img src="assets/logo.png" alt=""></div>
        <div>
          <h3>${escapeHtml(data.companyName || "LG Service Aprés-vente")}</h3>
          <p>${escapeHtml(data.companyAddress)}</p>
          <p>${escapeHtml(data.companyPhone)}</p>
          <p>${escapeHtml(data.companyEmail)}</p>
        </div>
      </div>

      <div class="invoice-meta">
        <h2>Facture de réparation</h2>
        <p><strong>Reference:</strong> ${escapeHtml(data.invoiceNumber)}</p>
        <p><strong>Date:</strong> ${escapeHtml(data.date)}</p>
        <p><strong>Copy:</strong> ${repairman ? "Repairman" : "Client"}</p>
      </div>
    </div>

    <div class="invoice-section">
      <div class="invoice-section-title">Client</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Nom et prénom</div>
          <div class="value">${escapeHtml(data.clientName)}</div>
        </div>
        <div class="info-item">
          <div class="label">Date de réception</div>
          <div class="value">${escapeHtml(data.dechargeDate)}</div>
        </div>
        <div class="info-item">
          <div class="label">Numéro</div>
          <div class="value">${escapeHtml(data.clientPhone)}</div>
        </div>
        <div class="info-item">
          <div class="label">Email</div>
          <div class="value">${escapeHtml(data.clientEmail || "—")}</div>
        </div>
      </div>
    </div>

    <div class="invoice-section">
      <div class="invoice-section-title">Produit</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Produit</div>
          <div class="value">${escapeHtml(data.productCategory)}</div>
        </div>
        <div class="info-item">
          <div class="label">Numéro de séries</div>
          <div class="value">${escapeHtml(data.serialNumber)}</div>
        </div>
      </div>
    </div>

    <div class="invoice-section">
      <div class="invoice-section-title">Probleme</div>
      <div class="problem-box">${escapeHtml(data.problemDescription)}</div>
    </div>

    <div class="invoice-section">
      <div class="invoice-section-title">Détails de la réparation</div>
      <table class="quote-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Etat</th>
            <th>Devis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Service de réparation — ${escapeHtml(data.productCategory)}</td>
            <td>
              <span class="status-pill ${inactive ? "inactive" : ""}">
                ${escapeHtml(data.repairStatus)}
              </span>
            </td>
            <td>${formatMoney(data.repairQuote)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="total-box">
      <div class="total">
        <span>Totale</span>
        <strong>${formatMoney(data.repairQuote)}</strong>
      </div>
    </div>

    ${repairman ? `
      <div class="repairman-report">
        <div class="invoice-section-title">Rapport du réparateur</div>
        <div class="report-box"></div>
        <div class="signature">signature: __________________________</div>
      </div>
    ` : ""}

    <div class="policy">
      <div class="invoice-section-title">Politique / note</div>
      <p>${escapeHtml(data.policyNote)}</p>
    </div>

    <div class="invoice-footer">
      <span>${escapeHtml(data.companyName)}</span>
      <span>${repairman ? "Repairman copy" : "Copie client"}</span>
    </div>
  `;
}

function updatePreview() {
  const data = getFormData();
  $("invoiceNumberBadge").textContent = data.invoiceNumber;
  $("invoicePreview").innerHTML = invoiceTemplate(data, false);
}

async function createPdf(data, repairman) {
  const { jsPDF } = window.jspdf;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.background = "#fff";

  const page = document.createElement("div");
  page.className = "invoice-page";
  page.style.boxShadow = "none";
  page.innerHTML = invoiceTemplate(data, repairman);

  container.appendChild(page);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const suffix = repairman ? "repairman" : "client";
    pdf.save(`${data.invoiceNumber}-${suffix}.pdf`);
  } finally {
    container.remove();
  }
}

$("invoiceForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!event.target.checkValidity()) {
    event.target.reportValidity();
    return;
  }

  const data = getFormData();

  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Generating...";

  try {
    await createPdf(data, false);
    await new Promise(resolve => setTimeout(resolve, 300));
    await createPdf(data, true);

    invoiceNumber = String(Number(invoiceNumber) + 1);
    localStorage.setItem("lg_invoice_number", invoiceNumber);
    updatePreview();

    alert("Both invoice PDFs have been generated.");
  } catch (error) {
    console.error(error);
    alert("Could not generate the PDFs. Check the browser console for details.");
  } finally {
    button.disabled = false;
    button.textContent = "Generate 2 PDFs";
  }
});

$("resetBtn").addEventListener("click", () => {
  $("invoiceForm").reset();
  updatePreview();
});

function printInvoice(repairman = false) {
  const data = getFormData();

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=1200"
  );

  if (!printWindow) {
    alert("Please allow popups to print the invoice.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">

      <title>
        ${data.invoiceNumber} - ${repairman ? "Repairman" : "Client"}
      </title>

      <link rel="stylesheet" href="style.css">

      <style>
        @page {
          size: A4;
          margin: 0;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        .invoice-page {
          width: 794px;
          min-height: 1123px;
          margin: 0;
          box-shadow: none;
        }
      </style>
    </head>

    <body>

      <div class="invoice-page">
        ${invoiceTemplate(data, repairman)}
      </div>

      <script>
        window.onload = function () {
          setTimeout(function () {
            window.print();
          }, 700);
        };

        window.onafterprint = function () {
          window.close();
        };
      <\/script>

    </body>
    </html>
  `);

  printWindow.document.close();
}

$("printClientBtn").addEventListener("click", () => {
  printInvoice(false);
});

$("printRepairmanBtn").addEventListener("click", () => {
  printInvoice(true);
});

$("invoiceForm").addEventListener("input", updatePreview);
$("invoiceForm").addEventListener("change", updatePreview);

updatePreview();
