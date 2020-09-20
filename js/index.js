import { notification, messages } from "./notifications.js"
let { remote, shell } = require('electron')
let win = remote.getCurrentWindow()

function convertToSec(time) { return parseInt(time) * 60 }
function convertToMs(time) { return (parseInt(time) * 60 * 1000) }
function getTime(time) {
    const minutes = Math.floor(time/60)
    const seconds = time % 60
    return `${minutes < 10 ? "0" + minutes : minutes} : ${seconds < 10 ? "0" + seconds : seconds}` 
}

let App = function() {
    this.currentTime = parseInt(store.get("slot_time") * 60)
    this.timer = undefined
    this.twentyReminder = undefined
    this.timerContainer = document.getElementById("timer-text")
    this.controlButton = document.getElementById("control-button")
    this.settingButton = document.getElementById("setting-button")
    this.resetButton = document.getElementById("reset-button")
    this.modeText = document.getElementById("mode-text")

    this.init = () => {
        store.initStore()
        this.currentTime = convertToSec(store.get("slot_time"))
        this.controlButton.addEventListener("click", this.eventHandlers.updateTimerState)
        this.settingButton.addEventListener("click", this.eventHandlers.toggleSettings)
        this.resetButton.addEventListener("click", this.eventHandlers.resetApp)
        this.setTwentyTimer()
        this.renderApp()
    }

    this.updateCurrentTime = (timeType) => {
        this.currentTime = parseInt(store.get(`${timeType}`)) * 60
        this.timerContainer.innerHTML = getTime(this.currentTime)
    }

    this.afterSlotCompleted = () => {
        this.modeText.innerHTML = "Break"
        let slotsCompleted = parseInt(store.get("slots_completed")) + 1
        
        if(slotsCompleted === config.numberOfSlots) {
            document.getElementById("mode-text").innerHTML = "Long break"
            store.set("mode", "long break")
            notification.generateNotification("takeLongBreak")
            this.currentTime =  convertToSec(store.get("long_break_time"))
            slotsCompleted = 0
        } else {
            store.set("mode", "break")
            notification.generateNotification("takeBreak")

            this.currentTime = convertToSec(store.get("break_time"))
        }
        this.renderSlots(slotsCompleted)
        store.set("slots_completed", slotsCompleted)
        this.timerContainer.innerHTML = getTime(this.currentTime)
    }

    this.aferBreakCompleted = () => {
        document.getElementById("mode-text").innerHTML = "Work"
        this.currentTime = convertToSec(store.get("slot_time"))
        notification.generateNotification("startWork")
        this.timerContainer.innerHTML = getTime(this.currentTime)
        store.set("mode", "work")
    }

    this.setTwentyTimer = (toggleState) => {
        if (this.twentyReminder) clearInterval(this.twentyReminder)

        if (store.get("twenty_rule") === "true") {
            this.twentyReminder = setInterval(() => {
                notification.generateNotification("twentyMessage")
            }, convertToMs(20))
        }
    }

    this.renderApp = () => {
        let mode = store.get("mode")
        let slotType = ""
        if (mode === "work") {
            this.modeText.innerHTML = "Work"
            slotType = "slot_time"
        } else if (mode.includes("long")) {
            this.modeText.innerHTML = "Long break"
            slotType = "long_break_time"
        } else {
            this.modeText.innerHTML = "Break"
            slotType = "break_time"
        }
        this.updateCurrentTime(slotType)
        this.renderSlots()
    }

    this.renderSlots = (slotsCompleted) => {
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

    this.renderSettings = (settings) => {
        let app = document.getElementById("app")
        let row = document.createElement("div")
        row.innerHTML = "Settings"
        row.className = "row"
        let hr = document.createElement("hr")
        settings.appendChild(hr)
        settings.appendChild(row)
        app.appendChild(settings)
    
        let settingsTable = document.createElement("div")
        settingsTable.className = "settings-table"
        
        // render twenty toggle button
        let twentyToggle = document.createElement("div")
        twentyToggle.setAttribute("class", "table-row")
        let twentyToggleText = document.createElement("div")
        twentyToggleText.innerHTML = "20-20-20"
        twentyToggleText.className = "table-text"
        let input = document.createElement("input")
        input.setAttribute("id", "twentyToggle")
        input.setAttribute("type", "checkbox")
        input.setAttribute("class", "checkbox")
        if (store.get("twenty_rule")==="true") {
            input.setAttribute("checked", true)
        }
        input.addEventListener("change", this.eventHandlers.toggleTwentyRule)
        let label = document.createElement("label")
        label.setAttribute("for", "twentyToggle")
        label.setAttribute("class", "toggle")
        twentyToggle.appendChild(twentyToggleText)
        twentyToggle.appendChild(input)
        twentyToggle.appendChild(label)
        settings.appendChild(twentyToggle)
    
        settingsTable.appendChild(twentyToggle)

        //render time settings from config
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
                slotTab.addEventListener("click", this.eventHandlers.changeTimeSetting)
                timeRow.appendChild(slotTab)
            })
    
        settingsTable.appendChild(timeRow)
        settings.appendChild(settingsTable)
        })

        let footer = document.createElement("div")
    
        footer.style.textAlign = "center"
        footer.style.fontSize = "10px"
        footer.style.marginTop = "4px"
        footer.style.textDecoration = "none"
        footer.innerHTML = `Made with ❤️ by <strong style="color: #2F87FF !important; cursor: pointer">dilpreetsio</strong>`
        footer.addEventListener("click", (e) => {
            shell.openExternal('https://twitter.com/dilpreetsio')
        })
        settings.appendChild(footer)
    }
    
    this.toggleStartButton = (isStart) => {
        document.getElementById('start-btn').style.display = isStart ? "block" : "none"
        document.getElementById('pause-btn').style.display = isStart ? "none" : "block"
    }

    this.eventHandlers = {
        updateTimerState: (e) => {
            let btn = e.currentTarget
            if(btn.className.includes("start-btn")) {
                if(store.get("slots_completed") == 0 && store.get("mode") === "work") {
                    this.renderSlots(0)
                }
                btn.className = "btn pause-btn"
                this.toggleStartButton(false)
                this.timer = setInterval(() => {
                    this.currentTime--
                    this.timerContainer.innerHTML = getTime(this.currentTime)
                    if(this.currentTime == 0) {
                        if (store.get("mode") === "work") this.afterSlotCompleted()
                        else this.aferBreakCompleted()
                        this.toggleStartButton(true)
                        clearInterval(this.timer)
                        btn.className = "btn start-btn"
                        this.toggleStartButton(true)
                    }
                }, 1000)
            } else {
                this.toggleStartButton(true)
                btn.className = "btn start-btn"
                store.set("timer", this.currentTime)
                clearInterval(this.timer)
            }
        },
        resetTimer: (e) => {},
        toggleSettings: (e) => {
            let settings = document.getElementById("settings")
            if (settings.style.visibility === "visible") {
                settings.innerHTML = ""
                settings.style.visibility = "hidden"
                win.setBounds({
                    height: parseInt(config.windowSize[1]),
                    width: parseInt(config.windowSize[0]),   
                }, true)
            } else {
                settings.style.visibility = "visible"
                win.setBounds({
                    height: parseInt(config.elongatedWindowSize[1]),
                    width: parseInt(config.elongatedWindowSize[0]),
                }, true)
                this.renderSettings(settings)
            }
        },
        changeTimeSetting: (e) => {
            const slug = e.currentTarget.getAttribute("data-slug")
            const time = e.currentTarget.getAttribute("data-time")
            let selectedElement = document.querySelector(`.selected-cell[data-slug=${slug}]`)
            selectedElement.classList.remove("selected-cell")
            e.currentTarget.classList.add("selected-cell")
            store.set(slug, time)
            const mode = store.get("mode")
            if((mode == "work" && slug === "slot_time") || 
                (mode == "long break" && slug === "long_break_time") ||
                (mode == "break" && slug === "break_time")
            ) this.updateCurrentTime(slug)
        },
        toggleTwentyRule: (e) => {
            store.set("twenty_rule", e.target.checked)
            this.setTwentyTimer( e.target.checked)
        },
        resetApp: () => {
            store.set("slots_completed", 0)
            store.set("mode", "work")
            this.modeText.innerHTML = "Work"
            this.timerContainer.innerHTML = getTime(convertToSec(store.get("slot_time")))
            this.renderSlots(0)
            this.toggleStartButton(true)
            if(this.timer) clearTimeout(this.timer)
        }
    }
}

let app = new App()
app.init()