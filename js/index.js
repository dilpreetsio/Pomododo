import { notification } from "./notifications.js"

let currentTime =  1
let timer = undefined
let timerContainer = document.getElementById("timer-text")
let controlButton = document.getElementById("control-button")
let resetButton = document.getElementById("reset-button")
let menuButton = document.getElementById("menu")
let ddMenu = document.getElementById("settings-dd")
let modeText = document.getElementById("mode-text")

function initApp() {
    store.initStore()
    
    currentTime = 0.1 * 60
    renderApp()
}

function renderApp() {
    renderMenu()
    let mode = store.get("mode")
    modeText.innerHTML = (mode === "work" ? "Work" : (mode === "break" ? "Break" : "Long break"))
    timerContainer.innerHTML = getTime(currentTime)
    renderSlots()
}

function afterSlotCompleted() {
    document.getElementById("mode-text").innerHTML = "Break"
    let slotsCompleted = parseInt(store.get("slots_completed")) + 1
    renderSlots(slotsCompleted)
    
    if(slotsCompleted === config.numberOfSlots) {
        document.getElementById("mode-text").innerHTML = "Long break"
        store.set("mode", "long break")
        slotsCompleted = 0
    } else 
        store.set("mode", "break")

    currentTime = 0.1 * 60
    store.set("slots_completed", slotsCompleted)
    timerContainer.innerHTML = getTime(currentTime)
}

function aferBreakCompleted() {
    document.getElementById("mode-text").innerHTML = "Work"
    currentTime = 0.1 * 60
    timerContainer.innerHTML = getTime(currentTime)
    store.set("mode", "work")
}

controlButton.addEventListener("click", (e)=> {
    console.log("clicked control button")
    let btn = e.currentTarget
    console.log(btn)
    if(btn.className.includes("start-btn")) {
        if(store.get("slots_completed") == 0 && store.get("mode") === "work") {
            renderSlots(0)
        }
        btn.className = "btn pause-btn"
        toggleStartButton(false)
        timer = setInterval(() => {
            currentTime--
            timerContainer.innerHTML = getTime(currentTime)
            if(currentTime == 0) {
                if (store.get("mode") === "work") afterSlotCompleted()
                else aferBreakCompleted()
                toggleStartButton(true)
                clearInterval(timer)
                console.log(btn)
                btn.className = "btn start-btn"
                toggleStartButton(true)
            }
        }, 1000)
    } else {
        toggleStartButton(true)
        btn.className = "btn start-btn"
        store.set("timer", currentTime)
        clearInterval(timer)
    }
})

resetButton.addEventListener("click", (e) => {
        clearInterval(timer)
        currentTime = parseInt(store.get("slot_time")) * 60
        toggleStartButton(true)
        store.set("timer", currentTime)
        store.set("slots_completed", 0)
        timerContainer.innerHTML = getTime(currentTime)
})

menuButton.addEventListener("click", (e) => {
    document.getElementById("settings-dd").classList.toggle("show");
})

ddMenu.addEventListener("click", (e) => {
    let element = e.target
    if(element.className.includes("menu-item")) {
        let id = element.id
        let idArgs = id.split("-")
        console.log(id)
        if (id.includes("slot")) {
            console.log('slot time')
            console.log(idArgs[idArgs.length -1])
            store.set("slot_time", idArgs[idArgs.length -1])
        } else if (id.includes("long")) {
            store.set("long_break_time", idArgs[idArgs.length -1])
        } else {
            store.set("break_time", idArgs[idArgs.length -1])
        }
    }
    renderMenu()
})

function getTime(time) {
    const minutes = Math.floor(time/60)
    const seconds = time % 60
    return `${minutes < 10 ? "0" + minutes : minutes} : ${seconds < 10 ? "0" + seconds : seconds}` 
}

function toggleStartButton(isStart) {
    document.getElementById('start-btn').style.display = isStart ? "block" : "none"
    document.getElementById('pause-btn').style.display = isStart ? "none" : "block"
}


function createTickElement(className) {
    let img = document.createElement("img")
    img.setAttribute("src", "./img/tick.svg")
    img.setAttribute("class", `tick ${className}`)
    return img
}

function renderSubMenu(className, items) {
    for (i in items) {
        let item = document.createElement("a")
        item.setAttribute("href", "#")
        item.setAttribute("class", "menu-item")
        item.setAttribute("id", `slot-${items[i]}`)
        item.innerHTML = `${items[i]} minutes`
        if(items[i] == store.get("slot_time")) {
            console.log("here in slot time equal to store")
            item.appendChild(createTickElement("slot"))
        }
        menu.appendChild(item)
    }
}


function renderMenu() {
    const slotTimes = config.slotTimes
    let menu = document.getElementById("settings-dd")
    menu.innerHTML = ""
    let i =0;
    let subHeader = document.createElement("a")
    subHeader.setAttribute("href", "#")
    subHeader.setAttribute("class", "sub-menu")
    subHeader.innerHTML = "Slot time"
    menu.appendChild(subHeader)
    for (i in slotTimes) {
        let item = document.createElement("a")
        item.setAttribute("href", "#")
        item.setAttribute("class", "menu-item")
        item.setAttribute("id", `slot-${slotTimes[i]}`)
        item.innerHTML = `${slotTimes[i]} minutes`
        if(slotTimes[i] == store.get("slot_time")) {
            item.appendChild(createTickElement("slot"))
        }
        menu.appendChild(item)
    }
    
    subHeader = document.createElement("a")
    subHeader.setAttribute("href", "#")
    subHeader.setAttribute("class", "sub-menu")
    subHeader.innerHTML = "Break time"
    menu.appendChild(subHeader)
    const breakTimes = config.breakTimes
    for (i in breakTimes) {
        let item = document.createElement("a")
        item.setAttribute("href", "#")
        item.setAttribute("class", "menu-item")
        item.setAttribute("id", `break-${breakTimes[i]}`)
        item.innerHTML = `${breakTimes[i]} minutes`
        if(breakTimes[i] == store.get("break_time")) {
            console.log('here')
            item.appendChild(createTickElement("break"))
        }
        menu.appendChild(item)
    }
    
    subHeader = document.createElement("a")
    subHeader.setAttribute("href", "#")
    subHeader.setAttribute("class", "sub-menu")
    subHeader.innerHTML = "Long break time"
    menu.appendChild(subHeader)
    const longBreakTimes = config.longBreakTimes
    for (i in longBreakTimes) {
        let item = document.createElement("a")
        item.setAttribute("href", "#")
        item.setAttribute("class", "menu-item")
        item.setAttribute("id", `long-break-${longBreakTimes[i]}`)
        item.innerHTML = `${longBreakTimes[i]} minutes`
        if(longBreakTimes[i] == store.get("long_break_time")) {
            item.appendChild(createTickElement("long-break"))
        }
        menu.appendChild(item)
    }
}

function renderSlots(slotsCompleted) {
    let slotsContainer = document.getElementById("slots-container")
    slotsContainer.innerHTML = ""
    slotsCompleted= slotsCompleted || store.get("slots_completed")
    for(let i=0;i<config.numberOfSlots; i++) {
        let slot = document.createElement("div")
        if(slotsCompleted>i)
            slot.setAttribute("class", "slot slot-completed")
        else
            slot.setAttribute("class", "slot slot-pending")
        slotsContainer.appendChild(slot)
    }
}

initApp()