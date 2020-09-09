/**
 * Enable this flag in development to see debug messages.
 */
const DEBUG = false;

/**
 * Print a debug message.
 *
 * It's the same as console.log.
 */
function debug(...args) {
  if (DEBUG) {
    console.log("[Analyse ChessTempo on Lichess]", ...args);
  }
}

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
 * @param {() => void} listener
 */
function onElementMutated(target, listener) {
  new MutationObserver(() => {
    listener();
  }).observe(target, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
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
        // 'after' option does not work due to a bug in ChessTempo.
        after: "analyse",
        action,
      },
    ],
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
 * @param {HTMLElement} element
 */
function isElementVisible(element) {
  return element.offsetParent !== null;
}

/**
 * @param {Element} button
 *   Must be a child of a 'board-controls' element, which in turn must be a
 *   child of a 'chess-tactics' element.
 */
function init(button) {
  const boardControls = button.closest("board-controls");
  const tactics = boardControls && boardControls.closest("chess-tactics");
  if (!tactics) {
    debug(
      `Could not find 'chess-tactics' element (board-controls = ${boardControls})`
    );
    return;
  }

  let buttonVisible = false;
  const handleBoardControlsMutation = () => {
    if (isElementVisible(button) === buttonVisible) {
      // Avoid setting the button to a state it's already in. Doing so causes an
      // infinite loop between mutation <-> handler.
      return;
    }
    if (isElementVisible(button)) {
      debug("Showing Lichess button");
      boardControls.showActions(["lichess"]);
      buttonVisible = true;
    } else {
      debug("Hiding Lichess button");
      boardControls.hideActions(["lichess"]);
      buttonVisible = false;
    }
  };

  addLichessButton(boardControls, () => {
    openFen(tactics.probData.startPosition);
  });
  debug("Lichess button added to board-controls");
  onElementMutated(boardControls, handleBoardControlsMutation);
}

const tactics = document.querySelector("chess-tactics");
const analyseButton =
  tactics && tactics.querySelector(".ct-board-action-analyse");
if (analyseButton) {
  debug("Found analyse button", analyseButton);
  init(analyseButton);
} else {
  debug("Waiting for analyse button");
  onChildElementAdded(tactics, ".ct-board-action-analyse", init);
}
