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
  displayHnStructure(dataList[1]);
};

const displayPageInfo = (pageInfo) => {
  const pageTitle = document.getElementById("pageTitle");
  const pageTitleCharacters = document.getElementById("pageTitleCharacters");
  const pageDescription = document.getElementById("pageDescription");

  pageTitle.textContent = pageInfo.title;
  pageTitleCharacters.textContent = pageInfo.title.length + " characters.";
  pageDescription.textContent = pageInfo.description;
};

const displayHnStructure = (data) => {
  displaySummary(data);
};

const displaySummary = (data) => {
  // Count amount of each Hn tag
  const getHnTotal = (i) => data.filter((e) => e.tag === "H" + i).length;

  for (let i = 1; i <= 6; i++) {
    document.getElementById("totalH" + i).textContent = getHnTotal(i);
  }
  document.getElementById("totalHn").textContent = data.length;
};
