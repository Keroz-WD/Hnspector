"use strict";

let highlightToggle = {};

document.addEventListener("DOMContentLoaded", () => {
  highlightToggle = document.getElementById("highlightToggle");

  sendToContent({ request: "getData" });
  sendToContent({ request: "checkHighlight" });

  highlightToggle.addEventListener("change", () =>
    sendToContent({ request: "highlight" })
  );
});

// Send requests to content.js and receive responses
const sendToContent = (request) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
      if (response) {
        manageResponse(response);
      } else {
        // Catch error
      }
    });
  });
};

// Manage responses from content.js
const manageResponse = (response) => {
  if (response.pageInfo && response.headers) {
    // If response contains page info and headers list
    displayData(response);
  } else if (response.highlight !== undefined) {
    // If response contains headers highlight status
    initHighlightToggle(response.highlight);
  } else {
    console.warn("Unexpected response :", response);
  }
};

// Display all data in Popup
const displayData = (dataList) => {
  //console.log(dataList);
  displayPageInfo(dataList.pageInfo);
  displayHeaders(dataList.headers);
  displaySummary(dataList.headers);
};

const initHighlightToggle = (isActive) => {
  highlightToggle.checked = isActive;
};

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

  let previousHn = 0;

  data.map((header, index) => {
    const row = document.createElement("div");
    const indentation = document.createElement("div");
    const hnBox = document.createElement("div");
    const headerBox = document.createElement("div");

    row.classList.add("row");
    indentation.classList.add("indentation");
    hnBox.classList.add("hn-box");
    headerBox.classList.add("headerBox");

    hnBox.textContent = header.tag;
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
    row.appendChild(headerBox);

    headerBox.classList.add(`hb-${header.tag}`);
    // Hid is used by ScrollTo() in content.js
    headerBox.setAttribute("data-hid", index);

    // Behavior when a header is clicked
    headerBox.addEventListener("click", (e) => {
      sendToContent({ request: "scrollTo", target: headerBox.dataset.hid });
    });

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
