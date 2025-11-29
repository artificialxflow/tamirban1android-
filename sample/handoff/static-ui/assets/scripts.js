document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector("[data-handoff-menu]");
  const menuPanel = document.querySelector("[data-handoff-sidebar]");

  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", () => {
      menuPanel.classList.toggle("is-open");
    });
  }

  hydrateVisitsTable();
  hydrateCustomersTable();
  hydrateInvoicesTable();
});

const numberFormatter = new Intl.NumberFormat("fa-IR");

const visitStatusLabels = {
  SCHEDULED: "زمان‌بندی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد",
};

const customerStatusLabels = {
  ACTIVE: "فعال",
  PENDING: "در انتظار پیگیری",
  AT_RISK: "احتمال ریزش",
  INACTIVE: "غیرفعال",
  LOYAL: "مشتری وفادار",
};

const invoiceStatusLabels = {
  SENT: "ارسال شده",
  PAID: "پرداخت شده",
  CANCELLED: "لغو شده",
};

function safeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function renderMessageRow(colspan, message) {
  return `<tr><td colspan="${colspan}" style="text-align:center;color:#94a3b8;">${safeHtml(message)}</td></tr>`;
}

async function loadMockData(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("response_not_ok");
    return await response.json();
  } catch (error) {
    console.warn("[handoff] failed to load", path, error);
    return null;
  }
}

async function hydrateVisitsTable() {
  const tbody = document.querySelector("[data-handoff-visits]");
  if (!tbody) return;

  const data = await loadMockData("mock-data/visits.json");
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = renderMessageRow(5, "هیچ ویزیتی برای نمایش وجود ندارد.");
    return;
  }

  tbody.innerHTML = data
    .map((visit) => {
      const statusText = visitStatusLabels[visit.status] ?? visit.status ?? "-";
      return `
        <tr>
          <td>${safeHtml(visit.scheduledAt)}</td>
          <td>${safeHtml(visit.customerName)}</td>
          <td>${safeHtml(visit.marketerName ?? "نامشخص")}</td>
          <td><span class="badge">${safeHtml(statusText)}</span></td>
          <td>${safeHtml(visit.note ?? "-")}</td>
        </tr>
      `;
    })
    .join("");
}

async function hydrateCustomersTable() {
  const tbody = document.querySelector("[data-handoff-customers]");
  if (!tbody) return;

  const data = await loadMockData("mock-data/customers.json");
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = renderMessageRow(8, "هیچ مشتری ثبت نشده است.");
    return;
  }

  tbody.innerHTML = data
    .map((customer) => {
      const statusText = customerStatusLabels[customer.status] ?? customer.status ?? "-";
      const monthlyRevenue = typeof customer.monthlyRevenue === "number" ? numberFormatter.format(customer.monthlyRevenue) : "-";
      return `
        <tr>
          <td>${safeHtml(customer.code)}</td>
          <td>${safeHtml(customer.name)}</td>
          <td>${safeHtml(customer.marketer ?? "نامشخص")}</td>
          <td>${safeHtml(customer.city ?? "-")}</td>
          <td>${safeHtml(customer.lastVisit ?? "-")}</td>
          <td><span class="badge">${safeHtml(statusText)}</span></td>
          <td>
            <span style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#0f172a;color:#fff;padding:0 0.6rem;font-size:0.75rem;">
              ${safeHtml(customer.grade ?? "-")}
            </span>
          </td>
          <td>${monthlyRevenue}</td>
        </tr>
      `;
    })
    .join("");
}

async function hydrateInvoicesTable() {
  const tbody = document.querySelector("[data-handoff-invoices]");
  if (!tbody) return;

  const data = await loadMockData("mock-data/invoices.json");
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = renderMessageRow(5, "هیچ پیش‌فاکتوری ثبت نشده است.");
    return;
  }

  tbody.innerHTML = data
    .map((invoice) => {
      const statusText = invoiceStatusLabels[invoice.status] ?? invoice.status ?? "-";
      const total = typeof invoice.total === "number" ? numberFormatter.format(invoice.total) : "-";
      return `
        <tr>
          <td>${safeHtml(invoice.number)}</td>
          <td>${safeHtml(invoice.customer)}</td>
          <td><span class="badge">${safeHtml(statusText)}</span></td>
          <td>${safeHtml(invoice.dueDate ?? "-")}</td>
          <td>${total}</td>
        </tr>
      `;
    })
    .join("");
}

