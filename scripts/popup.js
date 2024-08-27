"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const highlightButton = document.getElementById("highlightButton");

  sendToContent({ request: "getData" });

  // Send request to highlight all Hn in DOM
  highlightButton.addEventListener("click", () => {
    sendToContent({ request: "highlight" });
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

  console.log(data);

  data.map((header) => {
    const row = document.createElement("div");
    const hnBox = document.createElement("div");
    const headerBox = document.createElement("div");

    row.classList.add("row");
    hnBox.classList.add("hn-box");
    headerBox.classList.add("headerBox");

    hnBox.textContent = header.tag;
    hnBox.classList.add(`${header.tag.toLowerCase()}-box`);

    row.appendChild(hnBox);
    row.appendChild(headerBox);

    if (header.content != "") {
      headerBox.textContent = header.content;
    } else {
      headerBox.textContent = "< empty tag >";
      headerBox.classList.add("empty-tag");
    }

    headersList.appendChild(row);
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
