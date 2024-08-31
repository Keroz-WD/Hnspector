"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const highlightToggle = document.getElementById("highlightToggle");
  const contrastToggle = document.getElementById("contrastToggle");

  sendToContent({ request: "getData" });

  // Send request to highlight all headers in DOM
  highlightToggle.addEventListener("change", () =>
    sendToContent({ request: "highlight" })
  );

  // Contrast titles with the rest of the content
  contrastToggle.addEventListener("change", () => {
    if (contrastToggle.checked) {
      sendToContent({ request: "contrastOn" });
    } else {
      sendToContent({ request: "contrastOff" });
    }
  });
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
  const actions = {
    dataList: displayData(response),
  };
  return actions[response];
};

// Display all data in Popup
const displayData = (dataList) => {
  console.log(dataList);
  displayPageInfo(dataList[0]);
  displayHeaders(dataList[1]);
  displaySummary(dataList[1]);
};

// Display page title
const displayPageInfo = (pageInfo) => {
  document.getElementById("pageTitle").textContent = pageInfo.title;
};

// Display headers list in order of apparence in page html
const displayHeaders = (data) => {
  const headersList = document.getElementById("headersList");

  let previousHn = 0;

  data.map((header) => {
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
        dotSpacer.classList.add("warning");
      }
      indentation.appendChild(dotSpacer);
    }

    row.appendChild(hnBox);
    row.appendChild(headerBox);

    headerBox.classList.add(`hb-${header.tag}`);

    headerBox.addEventListener("click", (e) => {
      console.log(e.target);
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
