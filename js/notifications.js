export const messages = {
    twentyMessage: {
        header: "Your eyes need rest",
        message: "You have been looking at the screen for 20 mins without a break",
    },
    startWork: {
        header: "",
        message: "",
    },
    takeBreak: {
        header: "",
        message: "",
    },
    takeLongBreak: {
        header: "",
        message: "",
    }
}

export const notification = {
    generateNotification: (header, message) => {
        const myNotification = new Notification(header, {
            body: message
        })
        
        myNotification.onclick = () => {
            console.log('Notification clicked')
        }
    }
}