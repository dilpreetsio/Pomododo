import { notification } from "./notifications.js"
let { remote } = require('electron')
let win = remote.getCurrentWindow()

let currentTime =  1
let timer = undefined
let timerContainer = document.getElementById("timer-text")
let controlButton = document.getElementById("control-button")
let settingButton = document.getElementById("setting-button")
let modeText = document.getElementById("mode-text")

function initApp() {
    store.initStore()
    currentTime = 0.1 * 60
    renderApp()
}

function renderApp() {
    let mode = store.get("mode")
    modeText.innerHTML = (mode === "work" ? "Work" : (mode === "break" ? "Break" : "Long break"))
    timerContainer.innerHTML = getTime(currentTime)
    renderSlots()
}

function afterSlotCompleted() {
    document.getElementById("mode-text").innerHTML = "Break"
    let slotsCompleted = parseInt(store.get("slots_completed")) + 1
    renderSlots(slotsCompleted)
    
    notification.generateNotification("Slot completed", "Take a break")
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
    notification.generateNotification("Break completed", "Start working")
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

// resetButton.addEventListener("click", e => {
//     clearInterval(timer)
//     currentTime = parseInt(store.get("slot_time")) * 60
//     toggleStartButton(true)
//     store.set("timer", currentTime)
//     store.set("slots_completed", 0)
//     timerContainer.innerHTML = getTime(currentTime)
// })


settingButton.addEventListener("click", (e) => {
        let settings = document.getElementById("settings")
        console.log(settings)
        if (settings.style.visibility === "visible") {
            settings.innerHTML = ""
            settings.style.visibility = "hidden"
            win.setBounds({
                height: parseInt(config.windowSize[1]),
                width: parseInt(config.windowSize[0]),   
            })
        } else {
            settings.style.visibility = "visible"
            renderSettings(settings)
            win.setBounds({
                height: parseInt(config.elongatedWindowSize[1]),
                width: parseInt(config.elongatedWindowSize[0]),
            })
        }
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

function renderSettings(settings) {
    let app = document.getElementById("app")
    let row = document.createElement("div")
    row.innerHTML = "Settings"
    row.className = "row"
    settings.appendChild(row)
    app.appendChild(settings)

    let settingsTable = document.createElement("div")
    settingsTable.className = "settings-table"
    
    config.timeConfig.forEach(timeConf => {
        console.log(config.timeConfig)
        let timeRow = document.createElement("div")    
        timeRow.className = "table-row"
        let slotTab = document.createElement("div")
        slotTab.innerHTML = timeConf.name
        slotTab.className = "table-text"
        timeRow.appendChild(slotTab)
        timeConf.times.forEach(time => {
            let slotTab = document.createElement("div")
            slotTab.className = (store.get(timeConf.slug) == time) ? "table-cell selected-cell" : "table-cell"
            slotTab.innerHTML = `${time} mins`
            timeRow.appendChild(slotTab)
        })

    settingsTable.appendChild(timeRow)
    settings.appendChild(settingsTable)
    })
}

initApp()