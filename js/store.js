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
        if (!localStorage.getItem("day_stat")) localStorage.setItem("day_stat", 0)
        if (!localStorage.getItem("day_time")) localStorage.setItem("day_time", 0)
        if (!localStorage.getItem("week_stat")) localStorage.setItem("week_stat", 0)
        if (!localStorage.getItem("week_time")) localStorage.setItem("week_time", 0)
        if (!localStorage.getItem("month_stat")) localStorage.setItem("month_stat", 0)
        if (!localStorage.getItem("month_time")) localStorage.setItem("month_time", 0)
        if (!localStorage.getItem("year_stat")) localStorage.setItem("year_stat", 0)
        if (!localStorage.getItem("year_time")) localStorage.setItem("year_time", 0)
        if (!localStorage.getItem("current_day")) localStorage.setItem("current_day", date.getDate())
        if (!localStorage.getItem("current_month")) localStorage.setItem("current_month", date.getMonth())
        if (!localStorage.getItem("current_year")) localStorage.setItem("current_year", date.getFullYear())
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