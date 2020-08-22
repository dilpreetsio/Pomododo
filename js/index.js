import { notification } from "./notifications.js"
let { remote } = require('electron')
let win = remote.getCurrentWindow()

let currentTime =  parseInt(store.get("slot_time")) * 60
let timer = undefined
let timerContainer = document.getElementById("timer-text")
let controlButton = document.getElementById("control-button")
let settingButton = document.getElementById("setting-button")
let modeText = document.getElementById("mode-text")

function initApp() {
    store.initStore()
    // currentTime = 0.1 * 60
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
        currentTime = parseInt(store.get("long_break_time")) * 60
        slotsCompleted = 0
    } else {
        store.set("mode", "break")
        currentTime = parseInt(store.get("break_time")) * 60
    }

    store.set("slots_completed", slotsCompleted)
    timerContainer.innerHTML = getTime(currentTime)
}

function aferBreakCompleted() {
    document.getElementById("mode-text").innerHTML = "Work"
    currentTime =  parseInt(store.get("slot_time")) * 60

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

function changeTimeSetting(e) {
    const slug = e.currentTarget.getAttribute("data-slug")
    const time = e.currentTarget.getAttribute("data-time")
    let selectedElement = document.querySelector(`.selected-cell[data-slug=${slug}]`)
    selectedElement.classList.remove("selected-cell")
    e.currentTarget.classList.add("selected-cell")
    store.set(slug, time)
}

function toggleTwentyRule(e) {

}

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
            win.setBounds({
                height: parseInt(config.elongatedWindowSize[1]),
                width: parseInt(config.elongatedWindowSize[0]),
            })
            renderSettings(settings)
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

    let twentyToggle = document.createElement("div")
    twentyToggle.setAttribute("class", "table-row")
    let twentyToggleText = document.createElement("div")
    twentyToggleText.innerHTML = "20-20-20"
    twentyToggleText.className = "table-text"
    let input = document.createElement("input")
    input.setAttribute("id", "twentyToggle")
    input.setAttribute("type", "checkbox")
    input.setAttribute("class", "checkbox")
    let label = document.createElement("label")
    label.setAttribute("for", "twentyToggle")
    label.setAttribute("class", "toggle")
    twentyToggle.appendChild(twentyToggleText)
    twentyToggle.appendChild(input)
    twentyToggle.appendChild(label)
    // settings.appendChild(twentyToggle)

    settingsTable.appendChild(twentyToggle)
    config.timeConfig.forEach(timeConf => {
        let timeRow = document.createElement("div")    
        timeRow.className = "table-row"
        let slotTab = document.createElement("div")
        slotTab.innerHTML = timeConf.name
        slotTab.className = "table-text"
        timeRow.appendChild(slotTab)
        timeConf.times.forEach(time => {
            let slotTab = document.createElement("div")
            slotTab.id = `${timeConf.name}_${time}`
            slotTab.className = (store.get(timeConf.slug) == time) ? "table-cell selected-cell" : "table-cell"
            slotTab.innerHTML = `${time} mins`
            slotTab.setAttribute("data-slug",timeConf.slug)
            slotTab.setAttribute("data-time",time)
            slotTab.addEventListener("click", changeTimeSetting)
            timeRow.appendChild(slotTab)
        })

    settingsTable.appendChild(timeRow)
    settings.appendChild(settingsTable)
    console.log("drawing settings")
    })
    let footer = document.createElement("div")

    footer.style.textAlign = "center"
    footer.style.fontSize = "10px"
    footer.style.marginTop = "10px"
    footer.style.textDecoration = "none"
    footer.innerHTML = `Made with ❤️ by <a href="https://twitter.com/dilpreetsio">dilpreetsio</a>`
    settings.appendChild(footer)
}

initApp()