import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { gsap } from "gsap";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
    );
  }, []);
  // GSAP Button Animation
  useEffect(() => {
    gsap.to(".send-button", {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out",
      repeat: -1,
      yoyo: true,
    });
  }, []);
  useEffect(() => {
    // Initialize socket
    socketRef.current = io("http://localhost:5000");

    // Listen for the assigned username from the server
    socketRef.current.on("username", (assignedUsername) => {
      setUsername(assignedUsername);
    });

    // Listen for incoming messages
    socketRef.current.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup socket connection on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Scroll to the bottom of the message container when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    gsap.fromTo(
      ".message",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }
    );
  }, [messages]);

  useEffect(() => {
    gsap.fromTo(
      ".chat-title",
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
    );
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("sendMessage", { message, sender: username });
      setMessage("");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "500px",
        margin: "auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "#f5f5f5",
      }}
    >
      <Typography
        ref={titleRef}
        textAlign={"center"}
        mb={2}
        sx={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Chat Application
      </Typography>
      <Paper sx={{ padding: 2, maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            className={`message ${msg.sender === username ? "user" : "other"}`}
            sx={{
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "8px",
              bgcolor: msg.sender === username ? "#1976d2" : "#ccc",
              color: msg.sender === username ? "white" : "black",
            }}
          >
            <strong>{msg.sender === username ? "You" : msg.sender}: </strong>
            {msg.message || msg.text || msg.content}{" "}
            {/* 🔥 Handle all possible keys */}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {/* <Paper sx={{ padding: 2, maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            className={`message ${msg.sender === username ? "user" : "other"}`}
            sx={{
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "8px",
              bgcolor: msg.sender === username ? "#1976d2" : "#ccc",
              color: msg.sender === username ? "white" : "black",
            }}
          >
            <strong>{msg.sender}: </strong>
            {msg.text}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper> */}
      <Box display="flex" mt={2}>
        <TextField
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ marginLeft: 1 }}
          onClick={sendMessage}
          className="send-button"
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default App;
