const store = {
    initStore: () => {
        if (!localStorage.getItem("break_time")) localStorage.setItem("break_time", 5)
        if (!localStorage.getItem("long_break_time")) localStorage.setItem("long_break_time", 15)
        if (!localStorage.getItem("slot_time")) localStorage.setItem("slot_time", 30)
        if (!localStorage.getItem("slots_completed")) localStorage.setItem("slots_completed", 0)
        if (!localStorage.getItem("mode")) localStorage.setItem("mode", "work")
        if (!localStorage.getItem("current_time")) localStorage.setItem("current_time", 0)
        if (!localStorage.getItem("twenty_rule")) localStorage.setItem("twenty_rule", false)
        if (!localStorage.getItem("daily_stat")) localStorage.setItem("daily_stat", 0)
        if (!localStorage.getItem("daily_time")) localStorage.setItem("daily_time", 0)
        if (!localStorage.getItem("weekly_stat")) localStorage.setItem("weekly_stat", 0)
        if (!localStorage.getItem("weekly_time")) localStorage.setItem("weekly_time", 0)
        if (!localStorage.getItem("monthly_stat")) localStorage.setItem("monthly_stat", 0)
        if (!localStorage.getItem("monthly_time")) localStorage.setItem("monthly_time", 0)
        if (!localStorage.getItem("yearly_stat")) localStorage.setItem("yearly_stat", 0)
        if (!localStorage.getItem("yearly_time")) localStorage.setItem("yearly_time", 0)
        if (!localStorage.getItem("current_day")) localStorage.setItem("yearly_time", 0)
        if (!localStorage.getItem("current_week")) localStorage.setItem("yearly_time", 0)
        if (!localStorage.getItem("current_month")) localStorage.setItem("yearly_time", 0)
        if (!localStorage.getItem("current_year")) localStorage.setItem("yearly_time", 0)
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