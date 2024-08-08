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
  displayHnTitles(dataList[1]);
};

const displayPageInfo = (data) => {
  const pageURL = document.getElementById("pageURL");
  const pageTitle = document.getElementById("pageTitle");
  const pageTitleCharacters = document.getElementById("pageTitleCharacters");

  pageURL.textContent = data.url;
  pageTitle.textContent = data.title;
  pageTitleCharacters.textContent = data.title.length + " characters.";
};

const displayHnTitles = (data) => {
  console.log("Hn titles");
};
