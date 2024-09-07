"use strict";

let hnNodeList = Array.from(
  document.querySelectorAll("h1, h2, h3, h4, h5, h6")
);

let dataList = [];

// Formats data to be sent to popup.js
const createDataList = (titles) => {
  // Init dataList strucutre
  dataList = {
    pageInfo: {
      url: document.URL,
      title: document.title || "<Page title is missing>",
    },
    headers: [],
  };

  class HnData {
    constructor(tag, content) {
      this.tag = tag;
      this.content = content;
    }
  }

  titles.forEach((element) => {
    dataList.headers.push(
      new HnData(element.nodeName, element.textContent.trim())
    );
  });
};

// Updates the list of titles and reacts to DOM changes
const updateHeaders = () => {
  hnNodeList = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  createDataList(hnNodeList);
};

// Observer to detect DOM changes
const observer = new MutationObserver(updateHeaders);

// Observe the addition and deletion of nodes in the DOM
observer.observe(document.body, { childList: true, subtree: true });

// Mettre à jour les titres au démarrage
updateHeaders();

// Highlight all Hn tags by changing their background color to yellow
const highlightHeaders = (titles) => {
  titles.forEach((element) => {
    element.classList.toggle("hns-header");
    element.classList.toggle(`hns-${element.tagName}`);
  });
};

// Scroll to element with hid value in dataset
const ScrollTo = (hid) => {
  if (hnNodeList[hid]) {
    hnNodeList[hid].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  } else {
    console.error("Incorrect index to scroll to:", hid);
  }
};

// Check if headers are highlighted
const isHighlighted = () => {
  const highlighted =
    hnNodeList.length > 0 && hnNodeList[0].classList.contains("hns-header");
  return { highlight: highlighted };
};

// Listen requests sent by popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  createDataList(hnNodeList);

  switch (message.request) {
    case "getData":
      sendResponse(dataList);
      break;
    case "checkHighlight":
      sendResponse(isHighlighted());
      break;
    case "highlight":
      highlightHeaders(hnNodeList);
      break;
    case "scrollTo":
      ScrollTo(message.target);
      break;
    default:
      console.warn("Unknown request received:", message.request);
  }
});
