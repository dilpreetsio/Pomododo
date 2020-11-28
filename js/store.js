const store = {
    initStore: () => {
        let date = new Date()
        if (!localStorage.getItem("break_time")) localStorage.setItem("break_time", 5)
        if (!localStorage.getItem("long_break_time")) localStorage.setItem("long_break_time", 15)
        if (!localStorage.getItem("slot_time")) localStorage.setItem("slot_time", 30)
        if (!localStorage.getItem("slots_completed")) localStorage.setItem("slots_completed", 0)
        if (!localStorage.getItem("mode")) localStorage.setItem("mode", "work")
        if (!localStorage.getItem("current_time")) localStorage.setItem("current_time", 0)
        if (!localStorage.getItem("twenty_rule")) localStorage.setItem("twenty_rule", false)
        if (!localStorage.getItem("interruptions")) localStorage.setItem("interruptions", 0)
        if (!localStorage.getItem("slot_data")) localStorage.setItem("slot_data", JSON.stringify({
            daySlot: 0,
            weekSlot: 0,
            monthSlot: 0,
            yearSlot: 0
        }))
        if (!localStorage.getItem("time_data")) localStorage.setItem("time_data", JSON.stringify({
            dayTime: 0,
            weekTime: 0,
            monthTime: 0,
            yearTime: 0
        }))
        if (!localStorage.getItem("date_data")) localStorage.setItem("date_data", JSON.stringify({
            currentDay: date.getDate(),
            currentMonth: date.getMonth(),
            currentYear: date.getFullYear()
        }))
    },
    
    getStore: () => {
        return {
            breakTime: parseInt(localStorage.getItem("break_time")),
            longBreakTime: parseInt(localStorage.getItem("long_break_time")),
            slotTime: parseInt(localStorage.getItem("slot_time")),
            slotsCompleted: parseInt(localStorage.getItem("slots_completed")),
            currentTime: parseInt(localStorage.getItem("current_time")),
            state: localStorage.getItem("mode"),
            twentyRule: localStorage.getItem("twenty_rule")
        }
    },

    get: (item) => {
        return localStorage.getItem(item)
    },

    set: (item, value) => {
        localStorage.setItem(item, value)
    }
}