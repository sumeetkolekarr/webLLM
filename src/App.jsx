import React, { useEffect, useState } from 'react'
import './app.css'
import * as webllm from '@mlc-ai/web-llm'

const App = () => {
  const [messages, setMessages] = useState([{
    role: 'system',
    content: 'Hello, How can I help you?'
  }])
  const [engine, setEngine] = useState(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    const initEngine = async () => {
      try {
        const selectedModel = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'
        const engineInstance = await webllm.CreateMLCEngine(selectedModel, {
          initProgressCallback: (initProgress) => {
            console.log(initProgress);
          }
        });
        setEngine(engineInstance);
        console.log("Engine initialized successfully");
      } catch (error) {
        console.error("Failed to initialize engine:", error);
      }
    };

    initEngine();
  }, []);

  async function sendMessageToLLM() {
    if (!engine) {
      console.error("Engine not initialized yet. Please wait.");
      return;
    }

    const formattedMessages = messages.reduce((acc, msg) => {
      if (msg.role === 'system' && acc.length === 0) {
        acc.push(msg);
      } else if (msg.role === 'assistant' || msg.role === 'user') {
        acc.push(msg);
      }
      return acc;
    }, []);

    const userMessage = {
      role: 'user',
      content: input
    };

    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setInput('');

    try {
      const apiMessages = [...formattedMessages, userMessage];

      const reply = await engine.chat.completions.create({
        messages: apiMessages
      });

      const assistantMessage = {
        role: 'assistant',
        content: reply.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('reply', reply);
    } catch (error) {
      console.error("Error getting completion:", error);
    }
  }

  return (
    <main>
      <section>
        <div className="converse-area">
          <div className="messages">
            {
              messages.map((message, index) => (
                <div className={`message ${message.role}`} key={index}>
                  {message.content}
                </div>
              ))
            }
          </div>
          <div className="input-area">
            <input type="text" onChange={(e) => { setInput(e.target.value) }} value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessageToLLM()
                }
              }} placeholder='Message LLM' />
            <button onClick={() => {
              sendMessageToLLM()
            }}>Send</button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App