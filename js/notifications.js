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