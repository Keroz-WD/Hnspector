"use strict";

console.log("Content.js : OK");

const hnNodeList = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

let dataList = [];

// Formats data to be sent to popup
const createDataList = (titles) => {
  dataList.push({ url: document.URL, title: document.title });

  class HnData {
    constructor(tag, content) {
      this.tag = tag;
      this.content = content;
    }
  }

  let hnList = [];

  titles.forEach((element) => {
    hnList.push(new HnData(element.nodeName, element.textContent));
  });

  dataList.push(hnList);
};

// Highlight all Hn tags by changing their background color to yellow
const highlightTitles = (titles) => {
  titles.forEach((element) => {
    element.style.backgroundColor = "yellow";
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  createDataList(hnNodeList);

  switch (message.request) {
    case "getData":
      sendResponse(dataList);
      break;
    case "highlight":
      highlightTitles(hnNodeList);
      break;
  }
});
