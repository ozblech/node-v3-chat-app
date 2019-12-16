const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButon = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //New message  element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const messageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(messageStyles.marginBottom)
    const newMessageHeight = newMessageMargin + $newMessage.offsetHeight

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('k:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (urlObj) => {
    console.log(urlObj)
    const html = Mustache.render(locationMessageTemplate, {
        username: urlObj.username,
        url: urlObj.url,
        createdAt: moment(urlObj.createdAt).format('k:mm')
   
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
 
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//mesages
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
            
        }
        console.log('The message was delivered')
    })
})

//location
$sendLocationButon.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geo location is not supported by your browser')
    }
    
    $sendLocationButon.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
      
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared')
            $sendLocationButon.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})