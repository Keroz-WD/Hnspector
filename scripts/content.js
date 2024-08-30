"use strict";

console.log("Content.js : OK");

const hnNodeList = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

let dataList = [];

// Formats data to be sent to popup
const createDataList = (titles) => {
  const metaDescription = document
    .querySelector("meta[name='description']")
    .getAttribute("content");
  dataList.push({
    url: document.URL,
    title: document.title,
    description: metaDescription,
  });

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
const highlightHeaders = (titles, isActive) => {
  titles.forEach((element) => {
    console.log(element.tagName);
    if (isActive) {
      element.classList.add("hns-header");
      element.classList.add(`hns-${element.tagName}`);
    } else {
      element.classList.remove("hns-header");
      element.classList.remove(`hns-${element.tagName}`);
    }
  });
};

const contrastContent = (isActive) => {
  if (isActive) {
    console.log("contrast on");
  } else {
    console.log("contrast off");
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  createDataList(hnNodeList);

  switch (message.request) {
    case "getData":
      sendResponse(dataList);
      break;
    case "highlightOn":
      highlightHeaders(hnNodeList, true);
      console.log("highlight on");
      break;
    case "highlightOff":
      // Remove highlights
      console.log("highlight off");
      highlightHeaders(hnNodeList, false);
      break;
    case "contrastOn":
      // Contrast content
      contrastContent(true);
      break;
    case "contrastOff":
      // Remove contrast
      contrastContent(false);
      break;
  }
});
