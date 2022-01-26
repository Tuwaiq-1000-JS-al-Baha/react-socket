import { useEffect, useState } from "react"
import io from "socket.io-client"

const socket = io("ws://localhost:5000")

function App() {
  const [username, setUsername] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [directMessages, setDirectMessages] = useState([])

  useEffect(() => {
    socket.on("updateUsers", usernames => {
      setUsersList(usernames)
    })
    socket.on("receiveMessageChat", (senderUsername, message) => {
      console.log("received from chat:", senderUsername, "say:", message)
      const newMessage = {
        senderUsername,
        message,
      }

      setChatMessages(oldChatMessages => [...oldChatMessages, newMessage])
    })

    socket.on("receiveDirectMessage", (senderUsername, message) => {
      console.log("received direct message from:", senderUsername, "say:", message)
      const newMessage = {
        senderUsername,
        message,
      }

      setDirectMessages(oldDirectMessages => [...oldDirectMessages, newMessage])
    })
  }, [])

  const sendMessageChat = e => {
    e.preventDefault()
    const form = e.target
    const text = form.elements.messageText.value
    socket.emit("sendMessageChat", text)
  }

  const sendDirectMessage = e => {
    e.preventDefault()
    const form = e.target
    const receiverUsername = form.elements.receiverUsername.value
    const text = form.elements.messageText.value
    socket.emit("sendDirectMessage", receiverUsername, text)
  }

  const chooseUsername = e => {
    e.preventDefault()
    const form = e.target
    const username = form.elements.username.value
    socket.emit("chooseUsername", username)
    setUsername(username)
  }

  return (
    <div>
      {username ? (
        <>
          <h2>send message</h2>
          <h3>hello {username}</h3>
          <form onSubmit={sendMessageChat}>
            <h2>send to chat</h2>
            <label>type your message:</label>
            <input type="text" name="messageText" />
            <button type="submit">Send</button>
          </form>
          <h2>Users list</h2>
          {usersList.map(user => (
            <p key={user}>{user}</p>
          ))}
          <div>
            <h2>view chat messages</h2>
            {chatMessages.map(chatMessage => (
              <div key={`chat-message-${chatMessage.senderUsername}-${chatMessage.message}`}>
                <strong>{chatMessage.senderUsername}: </strong>
                <span>{chatMessage.message}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendDirectMessage}>
            <h2>send direct message</h2>
            <label>to who:</label>
            <select name="receiverUsername">
              {usersList.map(user => (
                <option key={user}>{user}</option>
              ))}
            </select>
            <br />
            <label>type your message:</label>
            <input type="text" name="messageText" />
            <button type="submit">Send</button>
          </form>
          <div>
            <h2>view direct messages</h2>
            {directMessages.map(directMessage => (
              <div key={`direct-message-${directMessage.senderUsername}-${directMessage.message}`}>
                <strong>{directMessage.senderUsername}: </strong>
                <span>{directMessage.message}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={chooseUsername}>
          <label>choose a username:</label>
          <input type="text" name="username" />
          <button type="submit">Choose</button>
        </form>
      )}
    </div>
  )
}

export default App
