"use strict";

const STORAGE_KEY = "working-increments:storage"

class App {
  constructor() {
    this.storage = null;

    this.IncrementerContainerDiv = document.getElementById("incrementer-list-container");
    this.CreateIncrementerDialog = document.getElementById("create-incrementer-dialog");
    this.UpdateIncrementerDialog = document.getElementById("update-incrementer-dialog");
    this.CreateIncrementerTickDialog = document.getElementById("create-incrementer-tick-dialog");
    this.ErrorDialog = document.getElementById("error-dialog");

    this.storageString = localStorage.getItem(STORAGE_KEY);
    if (!this.storageString) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ incrementers: [] }));
      this.storageString = localStorage.getItem(STORAGE_KEY);
    }

    try {
      this.storage = JSON.parse(this.storageString);
    } catch (e) {
      this.dispatchError(e);
      this.storage = { incrementers: [] };
    }

    this.appendIncrementerElements();
    this.setupErrorListener();
  }

  createIncrementer(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const incrementerName = formData.get("name");

    if (this.storage.incrementers.find((inc) => inc.name === incrementerName)) {
      console.log("error")
      this.dispatchError("An incrementer with that name already exists.");
      return;
    }
    event.target.querySelector("input[name=name]").value = "";
    this.storage.incrementers.push({ name: incrementerName, ticks: [] });
    this.saveStorage(true);
  }

  updateIncrementer(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const originalName = event.submitter.dataset.incrementer;
    const incrementerName = formData.get("name");

    const incrementerIdx = this.storage.incrementers.findIndex((inc) => inc.name === originalName)
    if (incrementerIdx < 0) {
      this.dispatchError("An incrementer with that name doesn't exist.");
      return;
    }

    this.storage.incrementers[incrementerIdx].name = incrementerName;
    this.saveStorage(true);
  }

  deleteIncrementer(incrementerName) {
    const incrementerIdx = this.storage.incrementers.findIndex((inc) => inc.name === incrementerName)
    if (incrementerIdx < 0) {
      this.dispatchError("An incrementer with that name doesn't exist.");
      return;
    }

    this.storage.incrementers.splice(incrementerIdx, 1);
    this.saveStorage(true);
  }

  createIncrementerTick(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const incrementerName = event.submitter.dataset.incrementer;
    const tickDescription = formData.get("description");
    const incrementerIdx = this.storage.incrementers.findIndex((inc) => inc.name === incrementerName);
    if (incrementerIdx < 0) {
      this.dispatchError("An incrementer with that name doesn't exist.");
      return;
    }
    event.target.querySelector("input[name=description]").value = "";
    this.storage.incrementers[incrementerIdx].ticks.push({ createdAt: new Date(), description: tickDescription });
    this.saveStorage(true);
  }

  deleteIncrementerTick(incrementerName, tickCreatedAt, tickDescription) {
    const incrementerIndex = this.storage.incrementers.findIndex((inc) => inc.name === incrementerName);
    if (incrementerIndex < 0) {
      this.dispatchError("An incrementer with that name doesn't exist.");
      return;
    }

    const tickIndex = this.storage.incrementers[incrementerIndex].ticks.findIndex((tick) => tick.createdAt === tickCreatedAt && tick.description === tickDescription);
    if (tickIndex < 0) {
      this.dispatchError("A tick with with those parameters doesn't exist.");
      return;
    }

    this.storage.incrementers[incrementerIndex].ticks.splice(tickIndex, 1);
    this.saveStorage(true);
  }

  saveStorage(reloadPage = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage));
      if (reloadPage) {
        window.location.reload();
      }
    } catch (e) {
      this.dispatchError(e);
    }
  }

  appendIncrementerElements() {
    if (this.IncrementerContainerDiv) {
      this.storage.incrementers.map((inc) => {
        const incrementDiv = document.createElement("div");
        incrementDiv.classList.add("incrementer");

        const incrementNav = document.createElement("nav");
        incrementNav.classList.add("increment-nav");

        const incrementH2 = document.createElement("h2");
        incrementH2.innerText = inc.name;

        const incrementSettingsHint = document.createElement("button");
        incrementSettingsHint.classList.add("incrementer-settings");
        incrementSettingsHint.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 24 24" width="24" fill="currentColor"><path d="M9.815 3.094a3.467 3.467 0 0 1-2.78-1.09l-.084-.001a3.467 3.467 0 0 1-2.781 1.09 3.477 3.477 0 0 1-1.727 2.51 3.471 3.471 0 0 1 0 2.794 3.477 3.477 0 0 1 1.727 2.51 3.467 3.467 0 0 1 2.78 1.09h.084a3.467 3.467 0 0 1 2.78-1.09 3.477 3.477 0 0 1 1.727-2.51 3.471 3.471 0 0 1 0-2.794 3.477 3.477 0 0 1-1.726-2.51zM14 5.714a1.474 1.474 0 0 0 0 2.572l-.502 1.684a1.473 1.473 0 0 0-1.553 2.14l-1.443 1.122A1.473 1.473 0 0 0 8.143 14l-2.304-.006a1.473 1.473 0 0 0-2.352-.765l-1.442-1.131A1.473 1.473 0 0 0 .5 9.968L0 8.278a1.474 1.474 0 0 0 0-2.555l.5-1.69a1.473 1.473 0 0 0 1.545-2.13L3.487.77A1.473 1.473 0 0 0 5.84.005L8.143 0a1.473 1.473 0 0 0 2.358.768l1.444 1.122a1.473 1.473 0 0 0 1.553 2.14L14 5.714zm-5.812 9.198a7.943 7.943 0 0 0 2.342-.73 3.468 3.468 0 0 1-.087.215 3.477 3.477 0 0 1 1.727 2.51 3.467 3.467 0 0 1 2.78 1.09h.084a3.467 3.467 0 0 1 2.78-1.09 3.477 3.477 0 0 1 1.727-2.51 3.471 3.471 0 0 1 0-2.794 3.477 3.477 0 0 1-1.726-2.51 3.467 3.467 0 0 1-2.78-1.09h-.084l-.015.016a8.077 8.077 0 0 0 .002-2.016L16.144 6a1.473 1.473 0 0 0 2.358.768l1.444 1.122a1.473 1.473 0 0 0 1.553 2.14L22 11.714a1.474 1.474 0 0 0 0 2.572l-.502 1.684a1.473 1.473 0 0 0-1.553 2.14l-1.443 1.122a1.473 1.473 0 0 0-2.359.768l-2.304-.006a1.473 1.473 0 0 0-2.352-.765l-1.442-1.131a1.473 1.473 0 0 0-1.545-2.13l-.312-1.056zM7 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>`
        incrementSettingsHint.onclick = () => {
          this.UpdateIncrementerDialog.toggleAttribute("open");
          this.UpdateIncrementerDialog.querySelector("input[name=name]").value = inc.name;
          this.UpdateIncrementerDialog.querySelector("button[id=delete-incrementer-button").onclick = () => { this.deleteIncrementer(inc.name) }
          this.UpdateIncrementerDialog.querySelector("button[type=submit]").dataset.incrementer = inc.name;
        }

        incrementNav.appendChild(incrementH2);
        incrementNav.appendChild(incrementSettingsHint);

        incrementDiv.appendChild(incrementNav);

        const tickDivContainer = document.createElement("div");
        tickDivContainer.classList.add("ticks")
        inc.ticks.map((tick) => {
          const tickDiv = document.createElement("div");
          tickDiv.classList.add("tick");

          const tickDeleteHint = document.createElement("div");
          tickDeleteHint.classList.add("delete-hint")
          tickDeleteHint.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -6 20 20" width="24" fill="#aaaaaa"><path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path></svg>`
          tickDeleteHint.onclick = (event) => {
            event.stopPropagation();
            this.deleteIncrementerTick(inc.name, tick.createdAt, tick.description);
          }
          tickDiv.appendChild(tickDeleteHint);

          const tickTooltip = document.createElement("div");
          tickTooltip.classList.add("tick-tooltip");
          tickTooltip.innerHTML = `<div><time>${ new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(new Date(tick.createdAt))
            }</time > <p>${ tick.description }</p></div`;
          tickTooltip.addEventListener("mousemove", function (event) {
            this.style.left = `${ event.pageX }px`;
            this.style.top = `${ event.pageY }px`;
          }, false);
          tickDiv.appendChild(tickTooltip);
          tickDivContainer.appendChild(tickDiv);
        })

        const addTickDiv = document.createElement("div");
        addTickDiv.setAttribute("role", "button");
        addTickDiv.classList.add("tick", "add-tick");
        addTickDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.5 -4.5 24 24" width="24" fill="currentColor"><path d="M8.9 6.9v-5a1 1 0 1 0-2 0v5h-5a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2h-5z"></path></svg>`;
        addTickDiv.onclick = () => {
          this.CreateIncrementerTickDialog.toggleAttribute("open")
          this.CreateIncrementerTickDialog.querySelector("button[type=submit]").dataset.incrementer = inc.name;
        };
        tickDivContainer.appendChild(addTickDiv);

        incrementDiv.appendChild(tickDivContainer);
        this.IncrementerContainerDiv.appendChild(incrementDiv)
      })
    }
  }

  setupErrorListener() {
    document.body.addEventListener("error", (event) => {
      if (event.detail === "clear") {
        this.ErrorDialog.innerHTML = "";
        this.ErrorDialog.setAttribute("open", false);
        return;
      }

      this.ErrorDialog.setAttribute("open", true);
      this.ErrorDialog.innerHTML = `< p > ${ event.detail }</p > `;
    }, false);
  }

  dispatchError(message) {
    document.body.dispatchEvent(new CustomEvent("error", { detail: message }));
  }

  dismissError() {
    document.body.dispatchEvent(new CustomEvent("error", { detail: "clear" }));
  }

  closeDialog(dialogId) {
    document.getElementById(dialogId).toggleAttribute("open");
  }
}

const app = new App();