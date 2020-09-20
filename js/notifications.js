export const messages = {
    twentyMessage: {
        header: "Your eyes need rest",
        message: "You have been looking at the screen for 20 mins without a break",
    },
    startWork: {
        header: "Your break is completed",
        message: "Let's get back to work",
    },
    takeBreak: {
        header: "Amazing! You completed the slot",
        message: "Let's take a well deserved break",
    },
    takeLongBreak: {
        header: "Awesome! You completed 4 slots.",
        message: "Take a long break before getting back to work",
    }
}

export const notification = {
    generateNotification: (messageType) => {
        const notification = messages[`${messageType}`]
        const myNotification = new Notification(notification.header, {
            body: notification.message
        })
        
        myNotification.onclick = () => {
            console.log('Notification clicked')
        }
    }
}