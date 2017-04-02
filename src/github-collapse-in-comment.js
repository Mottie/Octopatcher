// @name         GitHub Collapse In Comment
// @version      1.0.1
// @description  A script that adds a header that can toggle long code and quote blocks in comments
// @license      https://creativecommons.org/licenses/by-sa/4.0/
// @namespace    https://github.com/Mottie
// @author       Rob Garrison
// @source       https://github.com/Mottie/GitHub-userscripts (extension converted from github-collapse-in-comment.user.js)
/* jshint esnext:true, unused:true */
/* global chrome */
(() => {
  "use strict";
  /*
   Idea from: https://github.com/dear-github/dear-github/issues/166 & https://github.com/isaacs/github/issues/208
   examples:
    https://github.com/Mottie/tablesorter/issues/569
    https://github.com/jquery/jquery/issues/3195
  */
  let timer, settings,
    busy = false,

    // defaults ALSO set in options.js
    defaults = {
      cc_enabled : true,
      cc_animated: true,
      // hide code/quotes longer than this number of lines
      cc_minLines : 15,
      cc_state : "c" // "c" = collapsed; "e" = expanded
    },

    // syntax highlight class name lookup table
    syntaxClass = {
      "basic"  : "HTML",
      "cs"     : "C#",
      "fsharp" : "F#",
      "gfm"    : "Markdown",
      "jq"     : "JSONiq",
      "shell"  : "Bash (shell)",
      "tcl"    : "Glyph",
      "tex"    : "LaTex"
    };

  function makeToggle(name, lines) {
    /* full list of class names from
    https://github.com/github/linguist/blob/master/lib/linguist/languages.yml (look at "tm_scope" value)
    here are some example syntax highlighted class names:
      highlight-text-html-markdown-source-gfm-apib
      highlight-text-html-basic
      highlight-source-fortran-modern
      highlight-text-tex
    */
    let n = (name && name[1] || "")
      .replace(/((source-)|(text-)|(html-)|(markdown-)|(-modern))/g, "");
    n = (syntaxClass[n] || n).toUpperCase().trim();
    return `${n || "Block"} (${lines} lines)`;
  }

  function addToggles() {
    busy = true;
    if (settings.cc_enabled) {
      // issue comments
      if ($("#discussion_bucket")) {
        let loop,
          indx = 0,
          block = document.createElement("a"),
          regexSyntax = /highlight-([\w-]+)/,
          els = $$(".markdown-body pre, .email-signature-reply"),
          len = els.length;

        // "flash" = blue box styling
        block.className = "gcic-block border flash" +
          (settings.cc_state === "c" ? " gcic-block-closed end" : "");
        block.href = "#";

        // loop with delay to allow user interaction
        loop = () => {
          let el, wrap, node, syntaxClass, numberOfLines,
            minLines = parseInt(settings.cc_minLines, 10),
            // max number of DOM insertions per loop
            max = 0;
          while (max < 20 && indx < len) {
            if (indx >= len) { return; }
            el = els[indx];
            if (el && !el.classList.contains("gcic-has-toggle")) {
              numberOfLines = el.innerHTML.split("\n").length;
              if (numberOfLines > minLines) {
                syntaxClass = "";
                wrap = closest(".highlight", el);
                if (wrap && wrap.classList.contains("highlight")) {
                  syntaxClass = (wrap.className || "").match(regexSyntax);
                } else {
                  // no syntax highlighter defined (not wrapped)
                  wrap = el;
                }
                node = block.cloneNode();
                node.innerHTML = makeToggle(syntaxClass, numberOfLines);
                wrap.parentNode.insertBefore(node, wrap);
                el.classList.add("gcic-has-toggle");
                if (settings.cc_state === "c") {
                  el.display = "none";
                }
                max++;
              }
            }
            indx++;
          }
          if (indx < len) {
            setTimeout(() => {
              loop();
            }, 200);
          }
        };
        loop();
      }
    } else {
      removeAll(".gcic-block");
      removeClass(".gcic-has-toggle");
    }
    busy = false;
  }

  function onTransitionEnd(els, fn) {
    if (settings.cc_animated) {
      els = Array.isArray(els) ? els : [els];
      els.forEach(el => {
        let listener = () => {
          fn();
          // remove listener after event fired
          el.removeEventListener("transitionend", listener);
          el.removeEventListener("webkitTransitionEnd", listener);
        };
        el.addEventListener("transitionend", listener);
        el.addEventListener("webkitTransitionEnd", listener);
      });
    } else {
      fn();
    }
  }

  function addBindings() {
    document.addEventListener("click", event => {
      let els, indx, flag,
        el = event.target;
      if (el && el.classList.contains("gcic-block")) {
        event.preventDefault();
        // shift + click = toggle all blocks in a single comment
        // shift + ctrl + click = toggle all blocks on page
        if (event.shiftKey) {
          flag = !el.classList.contains("gcic-block-closed");
          els = closest(".markdown-body", el);
          $$(".gcic-block", event.ctrlKey ? "" : els).forEach(el => {
            el.classList.toggle("gcic-block-closed", flag);
            el.classList.toggle("end", flag);
          });
        } else {
          // opening
          if (el.classList.contains("gcic-block-closed")) {
            if (settings.cc_animated) {
              el.classList.remove("end"); // remove .end when open
              // delay removing after class removing
              // if immediately removed, transition won't show
              setTimeout(() => {
                el.classList.remove("gcic-block-closed");
              }, 50);
            } else {
              el.classList.remove(...["gcic-block-closed", "end"]);
            }
          } else {
            el.classList.add("gcic-block-closed");
            if (el.nextElementSibling.matches(".highlight, .email-signature-reply, pre")) {
              let codeBlock = el.nextElementSibling;
              onTransitionEnd(codeBlock, () => {
                el.classList.add("end");
              });
            }
          }
        }
        removeSelection();
      }
    });

    $$("#js-repo-pjax-container, #js-pjax-container").forEach(target => {
      new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          let mtarget = mutation.target;
          // preform checks before adding code wrap to minimize function calls
          // update after comments are edited
          if (!busy && (mtarget === target || mtarget.matches(".js-comment-body, .js-preview-body"))) {
            clearTimeout(timer);
            timer = setTimeout(() => {
              addToggles();
            }, 100);
          }
        });
      }).observe(target, {
        childList: true,
        subtree: true
      });
    });
  }

  function update(vals) {
    busy = true;
    settings = Object.assign({}, defaults, settings, vals);
    let toggles = $$(".gcic-block"),
      indx = toggles.length;
    while (indx--) {
      toggles[indx].parentNode.removeChild(toggles[indx]);
    }
    toggles = $$(".gcic-has-toggle");
    indx = toggles.length;
    while (indx--) {
      toggles[indx].classList.remove("gcic-has-toggle");
    }
    addToggles();
  }

  function init(vals) {
    settings = Object.assign({}, defaults, settings, vals);
    let styles = document.createElement("style");
    styles.textContent = `
      .gcic-block {
        border: #eee 1px solid;
        padding:2px 8px 2px 10px;
        border-radius: 5px 5px 0 0;
        position: relative;
        top: 1px;
        cursor: pointer;
        font-weight: bold;
        display: block;
      }
      .gcic-block + .highlight {
        border-top: none;
      }
      .gcic-block + .highlight,
      .gcic-block + .email-signature-reply,
      .gcic-block + pre {
        opacity: 1;
        transform: scaleY(1);
        transform-origin: top;
        transition: opacity .5s ease, transform .5s ease;
        -webkit-transition: opacity .5s ease, transform .5s ease;
      }
      .gcic-block + .email-signature-reply {
        margin-top: 0;
      }
      .gcic-block:after {
        content: "\u25bc ";
        float: right;
        transition: transform .3s ease;
        -webkit-transition: transform .3s ease;
      }
      .gcic-block-closed {
        border-radius: 5px;
        margin-bottom: 10px;
      }
      .gcic-block-closed:after {
        transform: rotate(90deg);
      }
      .gcic-block-closed + .highlight,
      .gcic-block-closed + .email-signature-reply,
      .gcic-block-closed + pre {
        opacity: 0;
        transform: scaleY(0);
      }
      .gcic-block-closed.end + .highlight,
      .gcic-block-closed.end + .email-signature-reply,
      .gcic-block-closed.end + pre {
        display: none;
      }
    `;
    $("head").appendChild(styles);

    addBindings();
    addToggles();
  }

  function $(selector, el) {
    return (el || document).querySelector(selector);
  }

  function $$(selector, el) {
    return Array.from((el || document).querySelectorAll(selector));
  }

  function closest(selector, el) {
    while (el && el.nodeType === 1) {
      if (el.matches(selector)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  function removeClass(selector, name) {
    $$(selector).forEach(el => {
      el.classList.remove(name || selector);
    });
  }

  function removeAll(selector) {
    $$(selector).forEach(el => {
      el.parentNode.removeChild(el);
    });
  }

  function removeSelection() {
    // remove text selection - http://stackoverflow.com/a/3171348/145346
    var sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  }

  // Firefox does not support chrome.storage.sync
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage#Chrome_incompatibilities
  // The storage API is not supported in content scripts.
  let storageType = chrome.storage && chrome.storage.sync ? "sync" : "local";
  chrome.storage[storageType].get(defaults, vals => {
    init(vals);
  });
  chrome.storage.onChanged.addListener(() => {
    chrome.storage[storageType].get(defaults, vals => {
      update(vals);
    });
  });
})();
