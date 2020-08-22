const store = {
    initStore: () => {
        if (!localStorage.getItem("break_time")) localStorage.setItem("break_time", 5)
        if (!localStorage.getItem("long_break_time")) localStorage.setItem("long_break_time", 15)
        if (!localStorage.getItem("slot_time")) localStorage.setItem("slot_time", 30)
        if (!localStorage.getItem("slots_completed")) localStorage.setItem("slots_completed", 0)
        if (!localStorage.getItem("mode")) localStorage.setItem("mode", "work")
        if (!localStorage.getItem("current_time")) localStorage.setItem("current_time", 0)
        if (!localStorage.getItem("20_rule")) localStorage.setItem("20_rule", false)
    },
    
    getStore: () => {
        return {
            breakTime: parseInt(localStorage.getItem("break_time")),
            longBreakTime: parseInt(localStorage.getItem("long_break_time")),
            slotTime: parseInt(localStorage.getItem("slot_time")),
            slotsCompleted: parseInt(localStorage.getItem("slots_completed")),
            currentTime: parseInt(localStorage.getItem("current_time")),
            state: localStorage.getItem("mode"),
            twentyRule: localStorage.getItem("20_rule")
        }
    },

    get: (item) => {
        return localStorage.getItem(item)
    },

    set: (item, value) => {
        localStorage.setItem(item, value)
    }
}



