"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const highlightButton = document.getElementById("highlightButton");
  const pageTitle = document.getElementById("pageTitle");

  startButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { request: "getList" },
        (response) => {
          if (response) {
            console.log(response);
            displayPageTitle(response[0].title);
          } else {
            // Catch error
          }
        }
      );
    });
  });

  // Send request to highlight all the Hn in DOM
  highlightButton.addEventListener("click", () => {
    sendToContent({ request: "highlight" });
  });

  const sendToContent = (request) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, request);
    });
  };

  // Display page title
  const displayPageTitle = (title) => {
    pageTitle.textContent = title;
  };
});
