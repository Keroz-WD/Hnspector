"use strict";

let highlightToggle = {};
let copyButton = {};
let csvButton = {};

document.addEventListener("DOMContentLoaded", () => {
  highlightToggle = document.getElementById("highlightToggle");
  copyButton = document.getElementById("copyButton");
  csvButton = document.getElementById("csvButton");

  sendToContent({ request: "getData" });
  sendToContent({ request: "checkHighlight" });

  highlightToggle.addEventListener("change", () =>
    sendToContent({ request: "highlight" })
  );

  copyButton.classList.add("disabled");
  csvButton.classList.add("disabled");
});

// Send requests to content.js and receive responses
const sendToContent = (request) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message to content script:",
            chrome.runtime.lastError.message
          );
        } else if (response) {
          manageResponse(response);
        } else {
          console.warn("No response received from content");
        }
      });
    } else {
      console.warn("No active tab found.");
    }
  });
};

// Manage responses from content.js
const manageResponse = (response) => {
  if (response.pageInfo && response.headers) {
    // If response contains page info and headers list
    displayData(response);
    // If no headers in DOM then disable export feature
    if (response.headers.length > 0) {
      convertDataToCSV(response);
    }
  } else if (response.highlight !== undefined) {
    // If response contains headers highlight status
    initHighlightToggle(response.highlight);
  } else {
    console.warn("Unexpected response :", response);
  }
};

// Display all data in Popup
const displayData = (dataList) => {
  displayPageInfo(dataList.pageInfo);
  displayHeaders(dataList.headers);
  displaySummary(dataList.headers);
};

const initHighlightToggle = (isActive) => (highlightToggle.checked = isActive);

// Display page title
const displayPageInfo = (pageInfo) => {
  const pageTitle = document.getElementById("pageTitle");
  if (pageInfo.title === "<Page title is missing>") {
    pageTitle.classList.add("title-warning");
  }
  pageTitle.textContent = pageInfo.title;
};

// Display headers list in order of apparence in page html
const displayHeaders = (data) => {
  const headersList = document.getElementById("headersList");

  if (data.length === 0) {
    console.warn("No header found.");
    const row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("title-warning");
    row.textContent = "<No header found>";
    headersList.appendChild(row);
    return;
  }

  let previousHn = 0;

  // Display headers as a list
  data.map((header, index) => {
    const row = document.createElement("div");
    const indentation = document.createElement("div");
    const hnBox = document.createElement("div");
    const spanHn = document.createElement("span");
    const headerBox = document.createElement("div");

    row.classList.add("row");
    indentation.classList.add("indentation");
    hnBox.classList.add("hn-box");
    headerBox.classList.add("headerBox");

    spanHn.textContent = header.tag;
    hnBox.classList.add(`${header.tag.toLowerCase()}-box`);

    row.appendChild(indentation);

    // Dots indentation
    for (let i = 1; i < +header.tag[1]; i++) {
      const dotSpacer = document.createElement("div");
      dotSpacer.classList.add("dot-spacer");
      // Alert if the gap is > 1 with previous header
      if (i - previousHn > 0) {
        dotSpacer.classList.add("gap-warning");
      }
      indentation.appendChild(dotSpacer);
    }

    row.appendChild(hnBox);
    hnBox.appendChild(spanHn);
    row.appendChild(headerBox);

    headerBox.classList.add(`hb-${header.tag}`);
    // Hid is used by ScrollTo() in content.js
    headerBox.setAttribute("data-hid", index);

    // Behavior when a header is clicked
    headerBox.addEventListener("click", (e) => {
      sendToContent({ request: "scrollTo", target: headerBox.dataset.hid });
    });

    // Copy header content to clipboard
    hnBox.addEventListener("click", () => {
      navigator.clipboard.writeText(header.content).then(() => {
        // Feedback animation
        hnBox.classList.add("copied");
        setTimeout(() => {
          hnBox.classList.remove("copied");
        }, 1600);
      });
    });

    // Check if header tag is not empty
    if (header.content != "") {
      headerBox.textContent = header.content;
    } else {
      headerBox.textContent = "<empty tag>";
      headerBox.classList.add("empty-tag");
    }

    headersList.appendChild(row);
    previousHn = +header.tag[1];
  });
};

// Count amount of each headers
const displaySummary = (data) => {
  const getHnTotal = (i) => data.filter((e) => e.tag === "H" + i).length;

  for (let i = 1; i <= 6; i++) {
    document.getElementById("totalH" + i).textContent = getHnTotal(i);
  }
  document.getElementById("totalHn").textContent = data.length;
};

// Export headers list to csv
const convertDataToCSV = (data) => {
  // Checks whether there is any data to process
  if (!data) {
    console.warn("No data to export as csv received.");
    return;
  }

  const headers = data.headers;
  const processedData = [];

  let csvContent = "";

  headers.forEach((item) => {
    processedData.push(Object.values(item));
  });

  processedData.forEach((entry) => {
    csvContent += entry.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8," });
  const objUrl = URL.createObjectURL(blob);

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(csvContent).then(() => {
      // Feedback animation
      copyButton.classList.add("copied");

      setTimeout(() => {
        copyButton.classList.remove("copied");
      }, 1600);
    });
  });

  csvButton.setAttribute("href", objUrl);
  csvButton.setAttribute(
    "download",
    `Headers_from_${data.pageInfo.url.replace("://", "_")}.csv`
  );

  csvButton.addEventListener("click", () => {
    // Feedback animation
    csvButton.classList.add("copied");
    setTimeout(() => {
      csvButton.classList.remove("copied");
    }, 1600);
  });

  copyButton.classList.remove("disabled");
  csvButton.classList.remove("disabled");
};
