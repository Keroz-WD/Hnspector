"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const highlightButton = document.getElementById("highlightButton");
  const pageURL = document.getElementById("pageURL");
  const pageTitle = document.getElementById("pageTitle");

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

  startButton.addEventListener("click", () => {
    sendToContent({ request: "getList" });
  });

  // Send request to highlight all Hn in DOM
  highlightButton.addEventListener("click", () => {
    sendToContent({ request: "highlight" });
  });

  const displayData = (dataList) => {
    console.log(dataList);
    displayPageInfo(dataList[0]);
    displayHnTitles(dataList[1]);
  };

  const displayPageInfo = (data) => {
    pageURL.textContent = data.url;
    pageTitle.textContent = data.title;
  };

  const displayHnTitles = (data) => {
    console.log("Hn titles");
  };
});
