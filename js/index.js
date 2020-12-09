import { notification, messages } from "./notifications.js"
let { remote, shell } = require('electron')
let win = remote.getCurrentWindow()
let testDate = new Date()
testDate.setDate(testDate.getDate() + 1)
function convertToSec(time) { return parseInt(time) * 60 }
function convertToMs(time) { return (parseInt(time) * 60 * 1000) }
function getTime(time) {
    const minutes = Math.floor(time/60)
    const seconds = time % 60
    return `${minutes < 10 ? "0" + minutes : minutes} : ${seconds < 10 ? "0" + seconds : seconds}` 
}

function getTimeInterval(oldDate) {
    let newDate = oldDate
    newDate.setDate(newDate.getDate() + 1)
    return newDate - (new Date())
}

let App = function() {
    this.currentTime = parseInt(store.get("slot_time") * 60)
    this.timer = undefined
    this.twentyReminder = undefined
    this.timerContainer = document.getElementById("timer-text")
    this.controlButton = document.getElementById("control-button")
    this.settingButton = document.getElementById("setting-button")
    this.statsButton = document.getElementById("stats-button")
    this.resetButton = document.getElementById("reset-button")
    this.modeText = document.getElementById("mode-text")
    this.intervalTime = 0

    this.init = () => {
        store.initStore()
        this.currentTime = convertToSec(store.get("slot_time"))
        this.controlButton.addEventListener("click", this.eventHandlers.updateTimerState)
        this.settingButton.addEventListener("click", this.eventHandlers.toggleSettings)
        this.statsButton.addEventListener("click", this.eventHandlers.toggleStats)
        this.resetButton.addEventListener("click", this.eventHandlers.resetApp)
        this.setTwentyTimer()
        this.renderApp()
        this.setDate()

        this.intervalTime = getTimeInterval(this.getOldDate())
        setInterval(function () {
            this.setDate()
            this.intervalTime = getTimeInterval(this.getOldDate())
        }, this.intervalTime)
    }

    this.updateApp = () => {
        this.renderStats()
        this.renderSettings()
    }

    this.updateCurrentTime = (timeType) => {
        this.currentTime = (parseInt(store.get(`${timeType}`)) * 60)
        this.timerContainer.innerHTML = getTime(this.currentTime)
    }

    this.getOldDate = () => {
        let dateData = JSON.parse(store.get("date_data"))
        return new Date(dateData.currentYear, dateData.currentMonth, dateData.currentDay)
    }

    this.isSameDate = (oldDate) => {
        const date = testDate
        return (date.getDate() === oldDate.getDate() && 
                date.getMonth() === oldDate.getMonth() &&
                date.getFullYear() === oldDate.getFullYear())
    }

    this.setDate = () => {
        let dateData = JSON.parse(store.get("date_data"))
        let oldDate = this.getOldDate()
        if (!this.isSameDate(oldDate)) {
            const date = new Date()
            let timeData = JSON.parse(store.get("time_data"))
            let slotData = JSON.parse(store.get("slot_data"))
            
            timeData.dayTime = 0
            slotData.daySlot = 0
            if (date.getDay() === 1 || ((date - oldDate) / (1000*60*60*24) > 6)) {
                timeData.weekTime = 0
                slotData.weekSlot = 0
            }
            if (date.getDate() === 1) {
                timeData.monthTime = 0
                slotData.monthSlot = 0
            }
            if (date.getFullYear() !== parseInt(dateData.currentYear)) {
                timeData.yearTime = 0
                slotData.yearSlot = 0
            }

            dateData.currentDay = date.getDate()
            dateData.currentMonth = date.getMonth()
            dateData.currentYear = date.getFullYear()
            store.set("date_data", JSON.stringify(dateData))
            store.set("time_data", JSON.stringify(timeData))
            store.set("slot_data", JSON.stringify(slotData))
            this.renderStats()
        }
    }

    this.updateAppData = () => {
        let timeData = JSON.parse(store.get("time_data"))
        let slotData = JSON.parse(store.get("slot_data"))
        const slotTime = parseInt(store.get("slot_time"))
        timeData.dayTime = parseInt(timeData.dayTime) + slotTime
        slotData.daySlot = parseInt(slotData.daySlot) + 1
        timeData.weekTime = parseInt(timeData.weekTime) + slotTime
        slotData.weekSlot = parseInt(slotData.weekSlot) + 1
        timeData.monthTime = parseInt(timeData.monthTime) + slotTime
        slotData.monthSlot = parseInt(slotData.monthSlot) + 1
        timeData.yearTime = parseInt(timeData.yearTime) + slotTime
        slotData.yearSlot = parseInt(slotData.yearSlot) + 1
        store.set("slot_data", JSON.stringify(slotData))
        store.set("time_data", JSON.stringify(timeData))
        this.renderStats()
    }

    this.afterSlotCompleted = () => {
        this.modeText.innerHTML = "Break"
        let slotsCompleted = parseInt(store.get("slots_completed")) + 1
        if(slotsCompleted === config.numberOfSlots) {
            document.getElementById("mode-text").innerHTML = "Long break"
            store.set("mode", "long break")
            notification.generateNotification("takeLongBreak")
            this.currentTime =  convertToSec(store.get("long_break_time"))
        } else {
            store.set("mode", "break")
            notification.generateNotification("takeBreak")
            this.currentTime = convertToSec(store.get("break_time"))
        }
        this.renderSlots(slotsCompleted)
        store.set("slots_completed", slotsCompleted)
        this.updateAppData()
        this.timerContainer.innerHTML = getTime(this.currentTime)
    }

    this.aferBreakCompleted = () => {
        document.getElementById("mode-text").innerHTML = "Work"
        this.currentTime = convertToSec(store.get("slot_time"))
        notification.generateNotification("startWork")
        this.timerContainer.innerHTML = getTime(this.currentTime)
        if (store.get("mode")==="long break") {
            store.set("slots_completed", 0)
            this.renderSlots()
        }
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
        footer.innerHTML = `Made with ❤️ by <strong style="color: #2F87FF !important; cursor: pointer">Dilpreetsio</strong>`
        footer.addEventListener("click", (e) => {
            shell.openExternal('https://twitter.com/dilpreetsio')
        })
        settings.appendChild(footer)
    }
    
    this.renderStats = (stats) => {
        const timeData = JSON.parse(store.get("time_data"))
        const slotData = JSON.parse(store.get("slot_data"))
        document.getElementById("day-slots").innerHTML = slotData.daySlot
        document.getElementById("day-time").innerHTML = getTime(parseInt(timeData.dayTime))
        document.getElementById("week-slots").innerHTML = slotData.weekSlot
        document.getElementById("week-time").innerHTML = getTime(parseInt(timeData.weekTime))
        document.getElementById("month-slots").innerHTML = slotData.monthSlot
        document.getElementById("month-time").innerHTML = getTime(parseInt(timeData.monthTime))
        document.getElementById("year-slots").innerHTML = slotData.yearSlot
        document.getElementById("year-time").innerHTML = getTime(parseInt(timeData.yearTime))
        document.getElementById("interruptions").innerHTML = store.get("interruptions")
    }

    this.toggleStartButton = (isStart) => {
        document.getElementById('start-btn').style.display = isStart ? "block" : "none"
        document.getElementById('pause-btn').style.display = isStart ? "none" : "block"
    }

    // dimension  {height : h, width: w}
    this.setWindowBounds = (dimension) => {
        win.setBounds(dimension, true)
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
                btn.className = "btn start-btn"
                this.toggleStartButton(true)
                store.set("timer", this.currentTime)
                store.set("interruptions", parseInt(store.get("interruptions")) + 1)
                clearInterval(this.timer)
            }
        },
        toggleStats: (e) => {
            let stats = document.getElementById("stats")
            if (stats.style.visibility === "visible") {
                stats.style.visibility = "hidden"
                stats.style.display = "none"
                win.setBounds({
                    height: parseInt(config.windowSize[1]),
                    width: parseInt(config.windowSize[0]),   
                }, true)
            } else {
                stats.style.visibility = "visible"
                stats.style.display = "block"
                this.renderStats()
                win.setBounds({
                    height: parseInt(config.elongatedWindowSize[1]),
                    width: parseInt(config.elongatedWindowSize[0]),
                }, true)
                this.renderSettings(settings)
            }
        },
        toggleSettings: (e) => {
            let settings = document.getElementById("settings")
            if (settings.style.visibility === "visible") {
                settings.innerHTML = ""
                settings.style.visibility = "hidden"
                settings.style.display = "none"
                win.setBounds({
                    height: parseInt(config.windowSize[1]),
                    width: parseInt(config.windowSize[0]),   
                }, true)
            } else {
                settings.style.visibility = "visible"
                settings.style.display = "block"
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
            store.set("timer", convertToSec(store.get("slot_time")))
            this.modeText.innerHTML = "Work"
            this.timerContainer.innerHTML = getTime(convertToSec(store.get("slot_time")))
            this.currentTime = convertToSec(store.get("slot_time"))
            this.renderSlots(0)
            this.toggleStartButton(true)
            this.controlButton.className = "btn start-btn"
            if(this.timer) clearTimeout(this.timer)
        }
    }
}

let app = new App()
app.init()