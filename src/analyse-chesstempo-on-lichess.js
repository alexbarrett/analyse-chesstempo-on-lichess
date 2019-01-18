/**
 * @param {Element} target
 * @param {string} selector
 * @param {(element: Element) => void} listener
 */
function onChildElementAdded(target, selector, listener) {
  new MutationObserver((mutations, observer) => {
    for (const mut of mutations) {
      const el = mut.target.querySelector(selector);
      if (el) {
        observer.disconnect();
        listener(el);
        return;
      }
    }
  }).observe(target, { childList: true, subtree: true });
}

/**
 * @param {Element} target
 * @param {(element: Element) => void} listener
 */
function onClassChanged(target, listener) {
  new MutationObserver(mutations => {
    listener();
  }).observe(target, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

/**
 * @param {Element} boardControls
 * @param {() => void} action
 */
function addLichessButton(boardControls, action) {
  boardControls.addButtons({
    buttons: [
      {
        title: "Analyse on Lichess",
        label: "<span class='analyse-chesstempo-on-lichess'/>",
        name: "lichess",
        after: "analyse",
        action
      }
    ]
  });
}

/**
 * @param {string} fen
 */
function openFen(fen) {
  window.open(
    "https://lichess.org/analysis/standard/" + fen.replace(/\s/g, "_")
  );
}

/**
 * @param {Element} analyseButton Must be a child of a 'board-controls' element,
 *  which in turn must be a child of a 'chess-tactics' element.
 */
function init(analyseButton) {
  const boardControls = analyseButton.closest("board-controls");
  const tactics = boardControls && boardControls.closest("chess-tactics");
  if (tactics) {
    addLichessButton(boardControls, () => {
      openFen(tactics.probData.startPosition);
    });
    onClassChanged(analyseButton, () => {
      if (analyseButton.classList.contains("ct-hidden")) {
        boardControls.hideActions(["lichess"]);
      } else {
        boardControls.showActions(["lichess"]);
      }
    });
  }
}

const tactics = document.querySelector("chess-tactics");
const analyseButton = tactics.querySelector(".ct-board-action-analyse");
if (analyseButton) {
  init(analyseButton);
} else {
  onChildElementAdded(tactics, ".ct-board-action-analyse", init);
}
