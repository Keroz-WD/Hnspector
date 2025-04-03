"use strict";

let hnNodeList = [];
let dataList = [];
let hBoxArray = [];
let hBoxInitialized = false;

// Formats data to be sent to popup.js
const createDataList = (titles) => {
  dataList = {
    pageInfo: {
      url: document.URL,
      title: document.title || "<Page title is missing>",
    },
    headers: titles.map((element) => ({
      tag: element.nodeName,
      content: hBoxInitialized
        ? element.textContent.trim().slice(0, -2)
        : element.textContent.trim(),
    })),
  };
};

// Updates the list of titles and reacts to DOM changes
const updateHeaders = () => {
  hnNodeList = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ).filter((element) => {
    const style = getComputedStyle(element);
    if (style.display === "none") return false;

    // Check if element or its children have visible content
    const hasVisibleContent =
      element.textContent.trim() !== "" &&
      Array.from(element.children).every((child) => {
        const childStyle = getComputedStyle(child);
        return childStyle.display !== "none" || child.textContent.trim() !== "";
      });

    return hasVisibleContent;
  });
  createDataList(hnNodeList);
};

// Observer to detect DOM changes
const observer = new MutationObserver(updateHeaders);
observer.observe(document.body, { childList: true, subtree: true });

// Update title on page load
updateHeaders();

// Highlight headings
const highlightHeaders = (titles) => {
  titles.forEach((element) => {
    if (element.textContent === "") return;
    element.classList.toggle("hns-header");
    element.classList.toggle(`hns-${element.tagName}`);
    if (!hBoxInitialized) buildHnBoxes(element);
  });
  hBoxArray.forEach((element) => element.classList.toggle("hns-show"));
  hBoxInitialized = true;
};

// Add header tag indicator
const buildHnBoxes = (element) => {
  const hBox = document.createElement("div");
  hBox.classList.add("hns-hBox", `hns-${element.tagName}`);
  hBox.textContent = element.tagName;
  element.appendChild(hBox);
  hBoxArray.push(hBox);
};

// Scroll to element with hid value in dataset
const ScrollTo = (hid) => {
  const targetElement = hnNodeList[hid];
  if (!targetElement) {
    console.error("Incorrect index to scroll to:", hid);
    return;
  }

  const isScrollNeeded = () => {
    const viewportHeight = window.innerHeight;
    const rect = targetElement.getBoundingClientRect();
    return rect.top < 0 || rect.bottom > viewportHeight;
  };

  if (isScrollNeeded()) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    const handleScrollEnd = () => {
      makeItBlink(targetElement);
      window.removeEventListener("scrollend", handleScrollEnd);
    };
    window.addEventListener("scrollend", handleScrollEnd);
  } else {
    makeItBlink(targetElement);
  }
};

const makeItBlink = (target) => {
  let count = 0;
  const interval = () => {
    if (count < 6) {
      target.classList.toggle("hns-hidden");
      count++;
      setTimeout(interval, 100);
    }
  };
  interval();
};

// Check if headers are highlighted
const isHighlighted = () => ({
  highlight:
    hnNodeList.length > 0 && hnNodeList[0].classList.contains("hns-header"),
});

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
  return true;
});
